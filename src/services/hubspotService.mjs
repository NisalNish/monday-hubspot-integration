import axios from 'axios';

// Fetch deals using the provided access token
export async function fetchDeals(accessToken) {
  try {
    const response = await axios.get('https://api.hubapi.com/crm/v3/objects/deals', {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
    return response.data;
  } catch (err) {
    console.error('❌ Error fetching deals:', err.response?.data || err.message);
    throw err;
  }
}
