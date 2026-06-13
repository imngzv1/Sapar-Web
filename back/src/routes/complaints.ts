import { Router } from 'express';
import * as complaints from '../services/complaints';

const router = Router();

router.get('/', (_req, res) => {
  res.json(complaints.listComplaints());
});

router.post('/:id/resolve', (req, res) => {
  const { decision } = req.body ?? {};
  if (!decision || !String(decision).trim()) {
    return res.status(400).json({ error: 'Нужно указать решение по жалобе' });
  }
  const complaint = complaints.resolveComplaint(req.params.id, decision, req.adminName);
  if (!complaint) return res.status(404).json({ error: 'Жалоба не найдена' });
  res.json(complaint);
});

router.post('/:id/dismiss', (req, res) => {
  const { decision } = req.body ?? {};
  if (!decision || !String(decision).trim()) {
    return res.status(400).json({ error: 'Нужно указать причину отклонения' });
  }
  const complaint = complaints.dismissComplaint(req.params.id, decision, req.adminName);
  if (!complaint) return res.status(404).json({ error: 'Жалоба не найдена' });
  res.json(complaint);
});

export default router;
