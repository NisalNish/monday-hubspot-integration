// src/routes/webhook.mjs
import express from 'express';
import { createBoard } from '../services/mondayService.mjs';
import jwtAuth from '../middlewares/authMiddleware.mjs';

const router = express.Router();

// Receive HubSpot webhook
router.post('/', jwtAuth, async (req, res) => {
  const deal = req.body?.properties || {};
  const dealName = deal.dealname;
  const amount = parseFloat(deal.amount);

  if (!dealName || isNaN(amount)) {
    return res.status(400).json({ error: ' Invalid payload' });
  }

  try {
    const boardId = await createBoard(dealName, amount);
    res.status(200).json({ message: '✅ Board created from webhook', boardId });
  } catch (err) {
    console.error('Webhook error:', err.message);
    res.status(500).json({ error: ' Failed to process webhook' });
  }
});

export default router;
