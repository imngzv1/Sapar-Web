import { Router } from 'express';
import * as drivers from '../services/drivers';

const router = Router();

router.get('/', (_req, res) => {
  res.json(drivers.listDrivers());
});

router.post('/:id/suspend', (req, res) => {
  const driver = drivers.suspendDriver(req.params.id, req.adminName);
  if (!driver) return res.status(404).json({ error: 'Водитель не найден' });
  res.json(driver);
});

router.post('/:id/activate', (req, res) => {
  const driver = drivers.activateDriver(req.params.id, req.adminName);
  if (!driver) return res.status(404).json({ error: 'Водитель не найден' });
  res.json(driver);
});

export default router;
