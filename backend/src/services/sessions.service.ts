import { prisma } from '../lib/prisma';

export async function createSession(userId: string) {
  const session = await prisma.challengeSession.create({
    data: { userId },
    select: { id: true },
  });
  return session;
}

export async function endSession(
  sessionId: string,
  userId: string,
  score: number,
  totalAsked: number,
) {
  const session = await prisma.challengeSession.findFirst({
    where: { id: sessionId, userId },
  });
  if (!session) throw new Error('Sesja nie istnieje');

  return prisma.challengeSession.update({
    where: { id: sessionId },
    data: { score, totalAsked, completed: true, endedAt: new Date() },
    select: { id: true, score: true, totalAsked: true },
  });
}

export async function getLeaderboard() {
  const rows = await prisma.challengeSession.findMany({
    where: { completed: true },
    orderBy: { score: 'desc' },
    take: 10,
    select: {
      id: true,
      score: true,
      startedAt: true,
      user: { select: { username: true } },
    },
  });
  return rows.map((r, i) => ({
    rank: i + 1,
    username: r.user.username,
    score: r.score,
    achievedAt: r.startedAt,
  }));
}

export async function getPersonalBest(userId: string) {
  return prisma.challengeSession.findFirst({
    where: { userId, completed: true },
    orderBy: { score: 'desc' },
    select: { score: true, totalAsked: true, startedAt: true },
  });
}
