import { Router } from 'express';
import { listAuditLogs } from '../services/audit';

const router = Router();

router.get('/', (_req, res) => {
  res.json(listAuditLogs());
});

export default router;
