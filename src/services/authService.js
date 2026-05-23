import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const authService = {
    async register(name, email, password) {
        const response = await axios.post(`${BASE_URL}/auth/register`, {
            name,
            email,
            password,
        });
        return response.data;
    },

    async login(email, password) {
        const response = await axios.post(`${BASE_URL}/auth/login`, {
            email,
            password,
        });
        return response.data;
    },

    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    },

    getToken() {
        return localStorage.getItem('token');
    },

    getUser() {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    }
};

export default authService;