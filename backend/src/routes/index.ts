import { Router } from 'express';
import authRoutes from './auth.routes';
import usersRoutes from './users.routes';
import questionsRoutes from './questions.routes';
import sessionsRoutes from './sessions.routes';
import adminRoutes from './admin.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', usersRoutes);
router.use('/questions', questionsRoutes);
router.use('/sessions', sessionsRoutes);
router.use('/admin', adminRoutes);

export default router;
