import apiClient from './apiClient';

export const authApi = {
    login: (email, password, config = {}) => 
        apiClient.post('/auth/login', { email, password }, config),
    
    register: (formData, config = {}) => 
        apiClient.post('/auth/register', formData, config),
    
    logout: (config = {}) => 
        apiClient.post('/auth/logout', {}, config),
    
    getMe: (config = {}) => 
        apiClient.get('/auth/me', config),
};
