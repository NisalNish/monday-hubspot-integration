import express from 'express';
import dotenv from 'dotenv';
import jwtAuth from './middlewares/authMiddleware.mjs';
import { createBoard } from './services/mondayService.mjs';
import webhookRoutes from './routes/webhook.mjs';
import reportRoutes from './routes/report.mjs';

dotenv.config();

const app = express();
app.use(express.json());

// Root
app.get('/', (req, res) => {
  res.send('✅ HubSpot + Monday.com Integration API is running.');
});

// JWT-protected manual trigger
app.post('/hubspot/deal', jwtAuth, async (req, res) => {
  const { dealName, amount } = req.body;

  if (!dealName || !amount) {
    return res.status(400).json({ error: ' Missing dealName or amount' });
  }

  try {
    const boardId = await createBoard(dealName, amount);
    res.status(200).json({ message: ' Board created successfully', boardId });
  } catch (err) {
    console.error(' Error creating board:', err.message);
    res.status(500).json({ error: ' Failed to create board', details: err.message });
  }
});

// Webhook + Reporting routes
app.use('/hubspot/webhook', webhookRoutes);
app.use('/report', jwtAuth, reportRoutes); // ✅ Protected report route

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(` Server is running on http://localhost:${PORT}`);
});
