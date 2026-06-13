import { Router } from 'express';
import * as cities from '../services/cities';

const router = Router();

router.get('/', (_req, res) => {
  res.json(cities.listCities());
});

router.post('/', (req, res) => {
  const { name } = req.body ?? {};
  if (!name || !String(name).trim()) {
    return res.status(400).json({ error: 'Название города обязательно' });
  }
  res.status(201).json(cities.createCity(name, req.adminName));
});

router.post('/:id/toggle', (req, res) => {
  const city = cities.toggleCity(req.params.id, req.adminName);
  if (!city) return res.status(404).json({ error: 'Город не найден' });
  res.json(city);
});

router.delete('/:id', (req, res) => {
  const removed = cities.removeCity(req.params.id, req.adminName);
  if (!removed) return res.status(404).json({ error: 'Город не найден' });
  res.status(204).end();
});

export default router;
