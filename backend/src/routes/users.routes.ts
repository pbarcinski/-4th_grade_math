import { Router } from 'express';
import * as usersController from '../controllers/users.controller';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.use(requireAuth);

router.get('/me', usersController.getMe);
router.patch('/me/avatar', usersController.updateAvatar);
router.get('/me/stats', usersController.getStats);
router.get('/me/sessions', usersController.getSessions);

export default router;
