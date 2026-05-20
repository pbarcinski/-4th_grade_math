import bcrypt from 'bcrypt';
import { prisma } from '../lib/prisma';
import { signToken } from '../lib/jwt';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL?.toLowerCase();

export async function register(username: string, email: string, password: string, avatar?: string) {
  const existing = await prisma.user.findFirst({
    where: { OR: [{ email }, { username }] },
  });
  if (existing) {
    throw new Error(existing.email === email ? 'Email jest już zajęty' : 'Nazwa użytkownika jest już zajęta');
  }
  const passwordHash = await bcrypt.hash(password, 12);
  const isAdmin = Boolean(ADMIN_EMAIL && email.toLowerCase() === ADMIN_EMAIL);
  const user = await prisma.user.create({
    data: {
      username,
      email,
      passwordHash,
      ...(avatar ? { avatar } : {}),
      role: isAdmin ? 'ADMIN' : 'USER',
      confirmed: isAdmin,
    },
    select: { id: true, username: true, email: true, avatar: true, role: true, confirmed: true },
  });
  if (!user.confirmed) {
    return { pendingConfirmation: true as const };
  }
  const token = signToken({ userId: user.id, username: user.username, role: user.role });
  return { token, user };
}

export async function login(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error('Nieprawidłowy email lub hasło');
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) throw new Error('Nieprawidłowy email lub hasło');
  if (!user.confirmed) throw new Error('Konto czeka na zatwierdzenie przez administratora');
  const token = signToken({ userId: user.id, username: user.username, role: user.role });
  return {
    token,
    user: { id: user.id, username: user.username, email: user.email, avatar: user.avatar, role: user.role, confirmed: user.confirmed },
  };
}
