import { Router } from 'express';
import * as finances from '../services/finances';

const router = Router();

router.get('/transactions', (_req, res) => {
  res.json(finances.listTransactions());
});

router.get('/payouts', (_req, res) => {
  res.json(finances.listPayouts());
});

router.get('/refunds', (_req, res) => {
  res.json(finances.listRefunds());
});

router.post('/payouts/:id/approve', (req, res) => {
  const payout = finances.approvePayout(req.params.id, req.adminName);
  if (!payout) return res.status(404).json({ error: 'Выплата не найдена' });
  res.json(payout);
});

export default router;
