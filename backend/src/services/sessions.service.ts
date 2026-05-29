import { prisma } from '../lib/prisma';

type Category = 'MULTIPLICATION' | 'UNIT_CONVERSION';

export async function createSession(userId: string, durationSecs: number = 60, category: Category = 'MULTIPLICATION') {
  const session = await prisma.challengeSession.create({
    data: { userId, durationSecs, category },
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

export async function getLeaderboard(durationSecs: number = 60, category: Category = 'MULTIPLICATION') {
  const rows = await prisma.challengeSession.findMany({
    where: { completed: true, durationSecs, category },
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

export async function getPersonalBest(userId: string, category: Category = 'MULTIPLICATION') {
  return prisma.challengeSession.findFirst({
    where: { userId, completed: true, category },
    orderBy: { score: 'desc' },
    select: { score: true, totalAsked: true, startedAt: true },
  });
}
