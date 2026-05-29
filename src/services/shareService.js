import axios from 'axios';
import authService from './authService';

const BASE_URL = import.meta.env.VITE_TRAVEL_API_BASE_URL;

function authHeader() {
  const token = authService.getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

const shareService = {
  async createToken(tripId, accessType) {
    const response = await axios.post(
      `${BASE_URL}/trips/${tripId}/share`,
      { accessType },
      { headers: authHeader() }
    );
    return response.data;
  },

  async getTokens(tripId) {
    const response = await axios.get(
      `${BASE_URL}/trips/${tripId}/share`,
      { headers: authHeader() }
    );
    return response.data;
  },

  async revokeToken(tripId, tokenId) {
    await axios.delete(
      `${BASE_URL}/trips/${tripId}/share/${tokenId}`,
      { headers: authHeader() }
    );
  },

  async getSharedTrip(token) {
    const response = await axios.get(`${BASE_URL}/shared/${token}`);
    return response.data;
  },
};

export default shareService;
