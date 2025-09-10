import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();

// Delete current user from Kinde
router.delete('/', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    // Decode JWT to get user id
    const token = authHeader.split(' ')[1];
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    const userId = payload.sub;
    if (!userId) return res.status(400).json({ error: 'User ID not found in token' });

    // Get Kinde Management API token
    const mgmtTokenRes = await axios.post(
      `https://${process.env.KINDE_DOMAIN}/oauth2/token`,
      new URLSearchParams([
        ['grant_type', 'client_credentials'],
        ['client_id', process.env.KINDE_MGMT_CLIENT_ID || ''],
        ['client_secret', process.env.KINDE_MGMT_CLIENT_SECRET || ''],
        ['audience', `https://${process.env.KINDE_DOMAIN}/api/v1`],
      ]),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );
    const mgmtToken = mgmtTokenRes.data.access_token;

    // Call Kinde API to delete user
    await axios.delete(
      `https://${process.env.KINDE_DOMAIN}/api/v1/users/${userId}`,
      { headers: { Authorization: `Bearer ${mgmtToken}` } }
    );


    res.status(200).json({ message: 'Account deleted successfully' });
  } catch (err) {
    console.error('Account delete error:', err);
    res.status(500).json({ error: 'Failed to delete account' });
  }
});

export default router;
