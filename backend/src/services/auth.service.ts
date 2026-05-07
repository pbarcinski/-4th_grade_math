import bcrypt from 'bcrypt';
import { prisma } from '../lib/prisma';
import { signToken } from '../lib/jwt';

export async function register(username: string, email: string, password: string) {
  const existing = await prisma.user.findFirst({
    where: { OR: [{ email }, { username }] },
  });
  if (existing) {
    throw new Error(existing.email === email ? 'Email jest już zajęty' : 'Nazwa użytkownika jest już zajęta');
  }
  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: { username, email, passwordHash },
    select: { id: true, username: true, email: true },
  });
  const token = signToken({ userId: user.id, username: user.username });
  return { token, user };
}

export async function login(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error('Nieprawidłowy email lub hasło');
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) throw new Error('Nieprawidłowy email lub hasło');
  const token = signToken({ userId: user.id, username: user.username });
  return { token, user: { id: user.id, username: user.username, email: user.email } };
}
