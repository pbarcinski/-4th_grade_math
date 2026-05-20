import { prisma } from '../lib/prisma';

export async function listUsers() {
  return prisma.user.findMany({
    select: { id: true, username: true, email: true, avatar: true, role: true, confirmed: true, createdAt: true },
    orderBy: [{ confirmed: 'asc' }, { createdAt: 'asc' }],
  });
}

export async function confirmUser(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error('Użytkownik nie istnieje');
  return prisma.user.update({
    where: { id: userId },
    data: { confirmed: true },
    select: { id: true, username: true, email: true, avatar: true, role: true, confirmed: true },
  });
}

export async function deleteUser(adminId: string, userId: string) {
  if (adminId === userId) throw new Error('Nie możesz usunąć własnego konta');
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error('Użytkownik nie istnieje');
  if (user.role === 'ADMIN') throw new Error('Nie można usunąć konta administratora');
  await prisma.user.delete({ where: { id: userId } });
}
