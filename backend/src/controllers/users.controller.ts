import { Request, Response, NextFunction } from 'express';
import * as usersService from '../services/users.service';

export async function getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const profile = await usersService.getProfile(req.user!.userId);
    res.json(profile);
  } catch (err) {
    next(err);
  }
}

export async function getStats(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const weakAreas = await usersService.getWeakAreas(req.user!.userId);
    res.json({ weakAreas });
  } catch (err) {
    next(err);
  }
}

export async function getSessions(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const page = parseInt((req.query.page as string) ?? '1', 10);
    const limit = parseInt((req.query.limit as string) ?? '10', 10);
    const data = await usersService.getSessions(req.user!.userId, page, limit);
    res.json(data);
  } catch (err) {
    next(err);
  }
}
