import axios from 'axios';
import authService from './authService';

const BASE_URL = import.meta.env.VITE_PLANNING_API_BASE_URL;

function authHeader() {
  const token = authService.getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

const checklistService = {
  async getAllByTrip(tripId) {
    const response = await axios.get(
      `${BASE_URL}/trips/${tripId}/checklist`,
      { headers: authHeader() }
    );
    return response.data;
  },

  async create(tripId, title) {
    const response = await axios.post(
      `${BASE_URL}/trips/${tripId}/checklist`,
      { title },
      { headers: authHeader() }
    );
    return response.data;
  },

  async toggle(tripId, id, isCompleted) {
    const response = await axios.patch(
      `${BASE_URL}/trips/${tripId}/checklist/${id}`,
      { isCompleted },
      { headers: authHeader() }
    );
    return response.data;
  },

  async remove(tripId, id) {
    await axios.delete(
      `${BASE_URL}/trips/${tripId}/checklist/${id}`,
      { headers: authHeader() }
    );
  },
};

export default checklistService;
