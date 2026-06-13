import { Router } from 'express';
import * as verifications from '../services/verifications';

const router = Router();

router.get('/', (_req, res) => {
  res.json(verifications.listRequests());
});

router.post('/:id/approve', (req, res) => {
  const request = verifications.approveRequest(req.params.id, req.adminName);
  if (!request) return res.status(404).json({ error: 'Заявка не найдена' });
  res.json(request);
});

router.post('/:id/reject', (req, res) => {
  const { reason } = req.body ?? {};
  if (!reason || !String(reason).trim()) {
    return res.status(400).json({ error: 'Нужно указать причину отказа' });
  }
  const request = verifications.rejectRequest(req.params.id, reason, req.adminName);
  if (!request) return res.status(404).json({ error: 'Заявка не найдена' });
  res.json(request);
});

export default router;
