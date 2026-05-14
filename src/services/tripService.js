import axios from 'axios';
import authService from './authService';

const BASE_URL = import.meta.env.VITE_TRAVEL_API_BASE_URL;

function authHeader() {
  const token = authService.getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

const tripService = {
  async getAll() {
    const response = await axios.get(`${BASE_URL}/trips`, {
      headers: authHeader(),
    });
    return response.data;
  },

  async getById(id) {
    const response = await axios.get(`${BASE_URL}/trips/${id}`, {
      headers: authHeader(),
    });
    return response.data;
  },

  async create(tripData) {
    const response = await axios.post(`${BASE_URL}/trips`, tripData, {
      headers: authHeader(),
    });
    return response.data;
  },

  async update(id, tripData) {
    const response = await axios.put(`${BASE_URL}/trips/${id}`, tripData, {
      headers: authHeader(),
    });
    return response.data;
  },

  async remove(id) {
    await axios.delete(`${BASE_URL}/trips/${id}`, {
      headers: authHeader(),
    });
  },
};

export default tripService;