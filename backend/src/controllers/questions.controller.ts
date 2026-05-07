import { Request, Response, NextFunction } from 'express';
import * as questionsService from '../services/questions.service';

export async function nextQuestion(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const mode = (req.query.mode as 'LEARN' | 'CHALLENGE') || 'LEARN';
    const question = await questionsService.generateQuestion(userId, mode);
    res.json(question);
  } catch (err) {
    next(err);
  }
}

export async function submitAnswer(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { operandA, operandB, operation, givenAnswer, mode, sessionId } = req.body;
    const result = await questionsService.checkAnswer(
      userId,
      operandA,
      operandB,
      operation,
      givenAnswer,
      mode,
      sessionId ?? null,
    );
    res.json(result);
  } catch (err) {
    next(err);
  }
}
