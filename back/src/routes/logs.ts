import { Router } from 'express';
import { listAuditLogs, recordAudit } from '../services/audit';
import { AdminLogTargetType } from '../types';

const router = Router();

router.get('/', (_req, res) => {
  res.json(listAuditLogs());
});

router.post('/', (req, res) => {
  const { action, targetType, targetId, details } = req.body ?? {};
  if (!action || !targetType || !targetId) {
    return res.status(400).json({ error: 'Нужны поля action, targetType, targetId' });
  }
  const allowed: AdminLogTargetType[] = [
    'verification',
    'user_state',
    'complaint',
    'city',
    'faq',
    'finance',
  ];
  if (!allowed.includes(targetType)) {
    return res.status(400).json({ error: 'Недопустимый targetType' });
  }
  const entry = recordAudit({
    adminName: req.adminName,
    action: String(action),
    targetType,
    targetId: String(targetId),
    details: String(details ?? ''),
  });
  res.status(201).json(entry);
});

export default router;
