import { Router } from 'express';
import * as rides from '../services/rides';

const router = Router();

router.get('/', (_req, res) => {
  res.json(rides.listRides());
});

router.post('/:id/cancel', (req, res) => {
  const ride = rides.cancelRide(req.params.id, req.adminName);
  if (!ride) return res.status(404).json({ error: 'Поездка не найдена' });
  res.json(ride);
});

export default router;
