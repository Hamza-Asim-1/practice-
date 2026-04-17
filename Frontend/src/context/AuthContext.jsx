import apiClient from '../api/apiClient';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/auth.api';
import toast from 'react-hot-toast';
import { UI_TEXT } from '../config/ui-text';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const isActionInFlight = React.useRef(false);

    const hasInitialFetchStarted = React.useRef(false);
    
    useEffect(() => {
        if (hasInitialFetchStarted.current) return;
        hasInitialFetchStarted.current = true;

        authApi.getMe({ skipToast: true })
            .then(res => {
                setUser(res.data.user || res.data);
            })
            .catch(() => {
                setUser(null);
            })
            .finally(() => {
                setLoading(false);
            });

        // Global session monitoring: if any request returns 401 (Unauthorized),
        // it means the account status has changed or the session expired.
        const interceptor = apiClient.interceptors.response.use(
            (response) => response,
            (error) => {
                if (error.response?.status === 401) {
                    const isGetMe = error.config?.url?.endsWith('/auth/me');
                    // If not the initial hydration check, clear user state
                    if (!isGetMe) {
                        setUser(null);
                    }
                }
                return Promise.reject(error);
            }
        );

        return () => apiClient.interceptors.response.eject(interceptor);
    }, []);

    const login = async (email, password) => {
        if (isActionInFlight.current) return { success: false, message: 'Action already in progress' };
        isActionInFlight.current = true;
        
        try {
            const res = await authApi.login(email, password);
            const userData = res.data.user;
            
            if (!userData) {
                return { success: false, message: res.data.message || UI_TEXT.error.generic };
            }

            setUser(userData);
            toast.success(res.data.message || UI_TEXT.success.login);
            return { success: true, user: userData };
        } catch (error) {
            return { success: false, message: error.mappedMessage || UI_TEXT.error.generic };
        } finally {
            isActionInFlight.current = false;
        }
    };

    const register = async (formData) => {
        if (isActionInFlight.current) return { success: false, message: 'Action already in progress' };
        isActionInFlight.current = true;

        try {
            const res = await authApi.register(formData);
            const userData = res.data.user;

            if (!userData) {
                return { success: false, message: res.data.message || UI_TEXT.error.generic };
            }

            setUser(userData);
            toast.success(res.data.message || UI_TEXT.success.register);
            return { success: true, user: userData };
        } catch (error) {
            return { success: false, message: error.mappedMessage || UI_TEXT.error.generic };
        } finally {
            isActionInFlight.current = false;
        }
    };

    const logout = async () => {
        try {
            const response = await authApi.logout();
            setUser(null);
            toast.success(response?.data?.message || response?.message || UI_TEXT.success.logout);
        } catch (error) {
            console.error('Logout API failure:', error);
            // Always clear local state even if server session cleanup fails
            setUser(null);
            toast.success(UI_TEXT.success.logout);
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;
