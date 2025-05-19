// src/routes/report.mjs
import express from 'express';
import jwtAuth from '../middlewares/authMiddleware.mjs';
import { getETLReport } from '../services/etlService.mjs';

const router = express.Router();

// JWT-protected route to fetch ETL report data
router.get('/', jwtAuth, async (req, res) => {
  try {
    const report = await getETLReport();
    res.status(200).json({ success: true, data: report });
  } catch (err) {
    console.error('❌ ETL Report Error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to generate report' });
  }
});

export default router;
