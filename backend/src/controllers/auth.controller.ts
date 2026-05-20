import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/auth.service';

export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { username, email, password, avatar } = req.body;
    const result = await authService.register(username, email, password, avatar);
    res.status(201).json(result);
  } catch (err) {
    if (err instanceof Error && err.message.includes('zajęt')) {
      res.status(409).json({ error: err.message });
    } else {
      next(err);
    }
  }
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    res.json(result);
  } catch (err) {
    if (err instanceof Error && err.message.includes('Nieprawidłowy')) {
      res.status(401).json({ error: err.message });
    } else if (err instanceof Error && err.message.includes('zatwierdzeni')) {
      res.status(403).json({ error: err.message });
    } else {
      next(err);
    }
  }
}

export function logout(_req: Request, res: Response): void {
  res.json({ message: 'ok' });
}
