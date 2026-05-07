import { Request, Response, NextFunction } from 'express';
import * as sessionsService from '../services/sessions.service';

export async function startSession(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const session = await sessionsService.createSession(userId);
    res.status(201).json(session);
  } catch (err) {
    next(err);
  }
}

export async function finishSession(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;
    const { score, totalAsked } = req.body;
    const session = await sessionsService.endSession(id, userId, score, totalAsked);
    res.json(session);
  } catch (err) {
    if (err instanceof Error && err.message.includes('nie istnieje')) {
      res.status(404).json({ error: err.message });
    } else {
      next(err);
    }
  }
}

export async function leaderboard(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await sessionsService.getLeaderboard();
    res.json({ leaderboard: data });
  } catch (err) {
    next(err);
  }
}

export async function personalBest(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const data = await sessionsService.getPersonalBest(userId);
    res.json(data ?? null);
  } catch (err) {
    next(err);
  }
}
