import axios from 'axios'
import authService from './authService'

const BASE_URL = import.meta.env.VITE_PLANNING_API_BASE_URL;

function authHeader() {
    const token = authService.getToken();
    return token ? { Authorization: 'Bearer ${token}' } : {};
}
const expenseService = {
    async getAllByTrip(tripId) {
        const response = await axios.get(
            '${BASE_URL}/trips/${tripId}/expenses',
            { headers: authHeader() }
        );
        return response.data;
    },
    async create(tripId, expenseData) {
        const response = await axios.post(
            '${BASE_URL}/trips/${tripId}/expenses',
            expenseData,
            { headers: authHeader() }
        );
        return response.data;
    },
    async remove(tripId, id) {
        await axios.delete(
            '${BASE_URL}/trips/${tripId}/expenses/${id}',
            { headers: authHeader() }
        );
    },
};

export default expenseService;
