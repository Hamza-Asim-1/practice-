import axios from 'axios';
import toast from 'react-hot-toast';
import { UI_TEXT } from '../config/ui-text';

const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Response Interceptor for Global Error Handling
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        let message = UI_TEXT.error.generic;
        
        if (error.response?.data?.message) {
            const backendMsg = error.response.data.message;
            message = Array.isArray(backendMsg) ? backendMsg.join(' | ') : backendMsg;
        }
        
        // Define silent/skipped auth requests
        const isGetMe = error.config?.url?.endsWith('/auth/me');
        const is401 = error.response?.status === 401;
        const skipToast = error.config?.skipToast === true;
        
        // Don't toast for silent hydration 401s or explicitly skipped requests
        if (!skipToast && !(isGetMe && is401)) {
            toast.error(message);
        }
        
        error.mappedMessage = message;
        return Promise.reject(error);
    }
);

export default apiClient;
