import { Request, Response, NextFunction } from 'express';
import * as sessionsService from '../services/sessions.service';

type Category = 'MULTIPLICATION' | 'UNIT_CONVERSION';

export async function startSession(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const durationSecs = Number(req.body.durationSecs) || 60;
    const category = (req.body.category as Category) || 'MULTIPLICATION';
    const session = await sessionsService.createSession(userId, durationSecs, category);
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

export async function leaderboard(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const durationSecs = Number(req.query.duration) || 60;
    const category = (req.query.category as Category) || 'MULTIPLICATION';
    const data = await sessionsService.getLeaderboard(durationSecs, category);
    res.json({ leaderboard: data });
  } catch (err) {
    next(err);
  }
}

export async function personalBest(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const category = (req.query.category as Category) || 'MULTIPLICATION';
    const data = await sessionsService.getPersonalBest(userId, category);
    res.json(data ?? null);
  } catch (err) {
    next(err);
  }
}
