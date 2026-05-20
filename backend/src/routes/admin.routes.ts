import { Router } from 'express';
import * as adminController from '../controllers/admin.controller';
import { requireAuth } from '../middleware/auth';
import { requireAdmin } from '../middleware/requireAdmin';

const router = Router();

router.use(requireAuth, requireAdmin);

router.get('/users', adminController.getUsers);
router.patch('/users/:id/confirm', adminController.confirmUser);
router.delete('/users/:id', adminController.deleteUser);

export default router;
