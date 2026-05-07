import { Router } from 'express';
import { body } from 'express-validator';
import * as sessionsController from '../controllers/sessions.controller';
import { validate } from '../middleware/validate';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.use(requireAuth);

router.post('/', sessionsController.startSession);
router.patch(
  '/:id/end',
  [body('score').isInt({ min: 0 }), body('totalAsked').isInt({ min: 0 })],
  validate,
  sessionsController.finishSession,
);
router.get('/leaderboard', sessionsController.leaderboard);
router.get('/personal-best', sessionsController.personalBest);

export default router;
