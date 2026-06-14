import axios from 'axios';

const BASE_URL = import.meta.env.VITE_TRAVEL_API_BASE_URL;

function authHeaders() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

const sharedEditService = {
  async createActivity(shareToken, data) {
    const response = await axios.post(
      `${BASE_URL}/shared/${shareToken}/activities`,
      data,
      { headers: authHeaders() }
    );
    return response.data;
  },

  async updateActivity(shareToken, activityId, data) {
    const response = await axios.put(
      `${BASE_URL}/shared/${shareToken}/activities/${activityId}`,
      data,
      { headers: authHeaders() }
    );
    return response.data;
  },

  async deleteActivity(shareToken, activityId) {
    await axios.delete(
      `${BASE_URL}/shared/${shareToken}/activities/${activityId}`,
      { headers: authHeaders() }
    );
  },

  async createChecklistItem(shareToken, title) {
    const response = await axios.post(
      `${BASE_URL}/shared/${shareToken}/checklist`,
      { title },
      { headers: authHeaders() }
    );
    return response.data;
  },

  async toggleChecklistItem(shareToken, itemId, isCompleted) {
    const response = await axios.patch(
      `${BASE_URL}/shared/${shareToken}/checklist/${itemId}`,
      { isCompleted },
      { headers: authHeaders() }
    );
    return response.data;
  },

  async deleteChecklistItem(shareToken, itemId) {
    await axios.delete(
      `${BASE_URL}/shared/${shareToken}/checklist/${itemId}`,
      { headers: authHeaders() }
    );
  },

  async createDestination(shareToken, data) {
    const response = await axios.post(
      `${BASE_URL}/shared/${shareToken}/destinations`,
      data,
      { headers: authHeaders() }
    );
    return response.data;
  },

  async updateDestination(shareToken, destId, data) {
    const response = await axios.put(
      `${BASE_URL}/shared/${shareToken}/destinations/${destId}`,
      data,
      { headers: authHeaders() }
    );
    return response.data;
  },

  async deleteDestination(shareToken, destId) {
    await axios.delete(
      `${BASE_URL}/shared/${shareToken}/destinations/${destId}`,
      { headers: authHeaders() }
    );
  },

  async createExpense(shareToken, data) {
    const response = await axios.post(
      `${BASE_URL}/shared/${shareToken}/expenses`,
      data,
      { headers: authHeaders() }
    );
    return response.data;
  },

  async deleteExpense(shareToken, expenseId) {
    await axios.delete(
      `${BASE_URL}/shared/${shareToken}/expenses/${expenseId}`,
      { headers: authHeaders() }
    );
  },

  async updateTrip(shareToken, data) {
    const response = await axios.put(
      `${BASE_URL}/shared/${shareToken}/trip`,
      data,
      { headers: authHeaders() }
    );
    return response.data;
  },
};

export default sharedEditService;