import { Router } from 'express';
import { body } from 'express-validator';
import * as questionsController from '../controllers/questions.controller';
import { validate } from '../middleware/validate';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.use(requireAuth);

router.get('/next', questionsController.nextQuestion);

router.post(
  '/answer',
  [
    body('operandA').isInt({ min: 0 }),
    body('operandB').isInt({ min: 0 }),
    body('operation').isIn(['MULTIPLY', 'DIVIDE', 'CONVERT']),
    body('givenAnswer').isInt({ min: 0 }),
    body('mode').isIn(['LEARN', 'CHALLENGE']),
    body('category').optional().isIn(['MULTIPLICATION', 'UNIT_CONVERSION']),
    body('conversionKey').optional().isString(),
  ],
  validate,
  questionsController.submitAnswer,
);

export default router;
