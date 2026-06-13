import { Router } from 'express';

import users from './users';
import drivers from './drivers';
import verifications from './verifications';
import rides from './rides';
import complaints from './complaints';
import cities from './cities';
import finances from './finances';
import faq from './faq';
import logs from './logs';

const router = Router();

router.use('/users', users);
router.use('/drivers', drivers);
router.use('/verifications', verifications);
router.use('/rides', rides);
router.use('/complaints', complaints);
router.use('/cities', cities);
router.use('/faq', faq);
router.use('/logs', logs);
// finances объединяет /transactions, /payouts, /refunds — монтируется в корень /api
router.use('/', finances);

export default router;
