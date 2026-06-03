import api from './axios';

export const register = async (email, name, password) => {
    const response = await api.post('/auth/register', { email, name, password });
    return response.data;
};

export const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
};

export const getChats = async () => {
    const response = await api.get('/chats');
    return response.data; // предполагаем, что бэк возвращает { chats: [...] }
};