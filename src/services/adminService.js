import axios from 'axios';
import authService from './authService';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

function authHeader() {
    const token = authService.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
}

const adminService = {
    async getAllUsers() {
        const response = await axios.get(`${BASE_URL}/admin/users`, {
            headers: authHeader(),
        });
        return response.data;
    },
    async updateRole(id, role) {
        const response = await axios.patch(
            `${BASE_URL}/admin/users/${id}/role`,
            { role },
            { headers: authHeader() }
        );
        return response.data;
    },
    async deleteUser(id) {
        await axios.delete(`${BASE_URL}/admin/users/${id}`, {
            headers: authHeader(),
        });
    },

};
export default adminService;