import { Request, Response, NextFunction } from 'express';
import * as questionsService from '../services/questions.service';
import type { Category } from '../services/questions.service';

export async function nextQuestion(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const mode = (req.query.mode as 'LEARN' | 'CHALLENGE') || 'LEARN';
    const category = (req.query.category as Category) || 'MULTIPLICATION';
    const question = await questionsService.generateQuestion(userId, mode, category);
    res.json(question);
  } catch (err) {
    next(err);
  }
}

export async function submitAnswer(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { operandA, operandB, operation, givenAnswer, mode, sessionId, category, conversionKey } = req.body;
    const result = await questionsService.checkAnswer(
      userId,
      operandA,
      operandB,
      operation,
      givenAnswer,
      mode,
      sessionId ?? null,
      category ?? 'MULTIPLICATION',
      conversionKey,
    );
    res.json(result);
  } catch (err) {
    next(err);
  }
}
