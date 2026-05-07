import { Router } from 'express';
import authRoutes from './auth.routes';
import usersRoutes from './users.routes';
import questionsRoutes from './questions.routes';
import sessionsRoutes from './sessions.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', usersRoutes);
router.use('/questions', questionsRoutes);
router.use('/sessions', sessionsRoutes);

export default router;
