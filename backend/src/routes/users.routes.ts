import { Router } from 'express';
import * as usersController from '../controllers/users.controller';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.use(requireAuth);

router.get('/me', usersController.getMe);
router.get('/me/stats', usersController.getStats);
router.get('/me/sessions', usersController.getSessions);

export default router;
