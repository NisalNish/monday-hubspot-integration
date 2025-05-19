import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();
const router = express.Router();

const HUBSPOT_AUTH_URL = 'https://app.hubspot.com/oauth/authorize';
const HUBSPOT_TOKEN_URL = 'https://api.hubapi.com/oauth/v1/token';
const HUBSPOT_DEALS_URL = 'https://api.hubapi.com/crm/v3/objects/deals';

// 🔐 Step 1: Redirect to HubSpot OAuth consent screen
router.get('/hubspot', (req, res) => {
  const redirectUri = encodeURIComponent(process.env.HUBSPOT_REDIRECT_URI);
  const url = `${HUBSPOT_AUTH_URL}?client_id=${process.env.HUBSPOT_CLIENT_ID}&redirect_uri=${redirectUri}&scope=crm.objects.contacts.read%20crm.objects.deals.read`;
  console.log('🔁 Redirecting to HubSpot:', url);
  res.redirect(url);
});

// 🔄 Step 2: Handle OAuth callback and exchange code for access_token
router.get('/hubspot/callback', async (req, res) => {
  const code = req.query.code;

  try {
    const response = await axios.post(HUBSPOT_TOKEN_URL, null, {
      params: {
        grant_type: 'authorization_code',
        client_id: process.env.HUBSPOT_CLIENT_ID,
        client_secret: process.env.HUBSPOT_CLIENT_SECRET,
        redirect_uri: process.env.HUBSPOT_REDIRECT_URI,
        code
      },
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    const { access_token, refresh_token, expires_in } = response.data;

    res.json({
      message: '✅ HubSpot OAuth successful!',
      access_token,
      refresh_token,
      expires_in
    });
  } catch (error) {
    console.error('❌ OAuth Error:', error.response?.data || error.message);
    res.status(500).json({ error: 'OAuth token exchange failed.' });
  }
});

// 🔍 Step 3: Fetch HubSpot deals using access token
router.get('/hubspot/deals', async (req, res) => {
  const accessToken = req.query.token;

  if (!accessToken) {
    return res.status(400).json({ error: '❌ Missing access_token in query.' });
  }

  try {
    const response = await axios.get(HUBSPOT_DEALS_URL, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    res.json(response.data);
  } catch (err) {
    console.error('❌ Fetch Deals Error:', err.response?.data || err.message);
    res.status(500).json({ error: 'Failed to fetch deals.' });
  }
});

export default router;
