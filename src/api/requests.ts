import axios from 'axios';

const API_URL = 'http://localhost:3000/api/v1';

export const approveRequest = async (id: string, token: string) => {
  const response = await axios.post(
    `${API_URL}/transport_requests/${id}/approve`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};