import axios from 'axios';
import authService from './authService';

const BASE_URL = import.meta.env.VITE_ACTIVITY_API_BASE_URL;

function authHeader() {
  const token = authService.getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

const activityService = {
  async getAllByTrip(tripId) {
    const response = await axios.get(
      `${BASE_URL}/trips/${tripId}/activities`,
      { headers: authHeader() }
    );
    return response.data;
  },

  async create(tripId, data) {
    const response = await axios.post(
      `${BASE_URL}/trips/${tripId}/activities`,
      data,
      { headers: authHeader() }
    );
    return response.data;
  },

  async update(tripId, id, data) {
    const response = await axios.put(
      `${BASE_URL}/trips/${tripId}/activities/${id}`,
      data,
      { headers: authHeader() }
    );
    return response.data;
  },

  async remove(tripId, id) {
    await axios.delete(
      `${BASE_URL}/trips/${tripId}/activities/${id}`,
      { headers: authHeader() }
    );
  },
};

export default activityService;
