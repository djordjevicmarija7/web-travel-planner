import axios from 'axios';

const BASE_URL = import.meta.env.VITE_TRAVEL_API_BASE_URL;

function tokenHeader(shareToken) {
  return { Authorization: `Bearer ${shareToken}` };
}

const sharedEditService = {
  async createActivity(shareToken, data) {
    const response = await axios.post(
      `${BASE_URL}/shared/${shareToken}/activities`,
      data,
      { headers: tokenHeader(shareToken) }
    );
    return response.data;
  },

  async updateActivity(shareToken, activityId, data) {
    const response = await axios.put(
      `${BASE_URL}/shared/${shareToken}/activities/${activityId}`,
      data,
      { headers: tokenHeader(shareToken) }
    );
    return response.data;
  },

  async deleteActivity(shareToken, activityId) {
    await axios.delete(
      `${BASE_URL}/shared/${shareToken}/activities/${activityId}`,
      { headers: tokenHeader(shareToken) }
    );
  },

  async createChecklistItem(shareToken, title) {
    const response = await axios.post(
      `${BASE_URL}/shared/${shareToken}/checklist`,
      { title },
      { headers: tokenHeader(shareToken) }
    );
    return response.data;
  },

  async toggleChecklistItem(shareToken, itemId, isCompleted) {
    const response = await axios.patch(
      `${BASE_URL}/shared/${shareToken}/checklist/${itemId}`,
      { isCompleted },
      { headers: tokenHeader(shareToken) }
    );
    return response.data;
  },

  async deleteChecklistItem(shareToken, itemId) {
    await axios.delete(
      `${BASE_URL}/shared/${shareToken}/checklist/${itemId}`,
      { headers: tokenHeader(shareToken) }
    );
  },
};

export default sharedEditService;
