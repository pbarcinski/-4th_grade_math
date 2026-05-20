import { Request, Response, NextFunction } from 'express';
import * as adminService from '../services/admin.service';

export async function getUsers(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const users = await adminService.listUsers();
    res.json({ users });
  } catch (err) {
    next(err);
  }
}

export async function confirmUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await adminService.confirmUser(req.params.id);
    res.json(user);
  } catch (err) {
    if (err instanceof Error && err.message.includes('istnieje')) {
      res.status(404).json({ error: err.message });
    } else {
      next(err);
    }
  }
}

export async function deleteUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await adminService.deleteUser(req.user!.userId, req.params.id);
    res.status(204).send();
  } catch (err) {
    if (err instanceof Error) {
      res.status(400).json({ error: err.message });
    } else {
      next(err);
    }
  }
}
