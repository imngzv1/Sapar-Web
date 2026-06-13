import { Router } from 'express';
import * as faq from '../services/faq';

const router = Router();

router.get('/', (_req, res) => {
  res.json(faq.listFaq());
});

router.post('/', (req, res) => {
  const { question, answer, category } = req.body ?? {};
  if (!question || !answer || !category) {
    return res.status(400).json({ error: 'Заполните вопрос, ответ и категорию' });
  }
  res.status(201).json(
    faq.createFaq({ question, answer, category, adminName: req.adminName })
  );
});

router.delete('/:id', (req, res) => {
  const removed = faq.removeFaq(req.params.id, req.adminName);
  if (!removed) return res.status(404).json({ error: 'Запись не найдена' });
  res.status(204).end();
});

export default router;
