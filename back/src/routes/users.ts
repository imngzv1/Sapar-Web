import { Router } from 'express';
import * as users from '../services/users';

const router = Router();

router.get('/', (_req, res) => {
  res.json(users.listUsers());
});

router.get('/:id', (req, res) => {
  const user = users.getUser(req.params.id);
  if (!user) return res.status(404).json({ error: 'Пользователь не найден' });
  res.json(user);
});

router.post('/:id/block', (req, res) => {
  const { reason } = req.body ?? {};
  if (!reason || !String(reason).trim()) {
    return res.status(400).json({ error: 'Нужно указать причину блокировки' });
  }
  const user = users.blockUser(req.params.id, reason, req.adminName);
  if (!user) return res.status(404).json({ error: 'Пользователь не найден' });
  res.json(user);
});

router.post('/:id/unblock', (req, res) => {
  const user = users.unblockUser(req.params.id, req.adminName);
  if (!user) return res.status(404).json({ error: 'Пользователь не найден' });
  res.json(user);
});

export default router;
