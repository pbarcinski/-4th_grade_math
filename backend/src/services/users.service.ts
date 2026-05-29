import { prisma } from '../lib/prisma';
import { getWeakAreas as getWeakAreasForCategory, type Category } from './questions.service';

export async function getProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, username: true, email: true, avatar: true, role: true, confirmed: true, createdAt: true },
  });
  if (!user) throw new Error('Użytkownik nie istnieje');

  const [totalAnswered, totalCorrect, bestSession] = await Promise.all([
    prisma.answer.count({ where: { userId } }),
    prisma.answer.count({ where: { userId, isCorrect: true } }),
    prisma.challengeSession.findFirst({
      where: { userId, completed: true },
      orderBy: { score: 'desc' },
      select: { score: true },
    }),
  ]);

  return {
    ...user,
    stats: {
      totalAnswered,
      totalCorrect,
      accuracy: totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0,
      bestChallengeScore: bestSession?.score ?? 0,
    },
  };
}

export async function getWeakAreas(userId: string, category: Category = 'MULTIPLICATION') {
  return getWeakAreasForCategory(userId, category);
}

const VALID_AVATARS = ['🐱','🐶','🦊','🐰','🐹','🦔','🐻','🐼','🐨','🐯','🦁','🐺','🦄','🐸','🐧','🦜','🦩','🦦','🐢','🐙','🦋','🐬','🦈','🐘'];

export async function updateAvatar(userId: string, avatar: string) {
  if (!VALID_AVATARS.includes(avatar)) throw new Error('Nieprawidłowy awatar');
  return prisma.user.update({
    where: { id: userId },
    data: { avatar },
    select: { id: true, username: true, email: true, avatar: true, role: true, confirmed: true },
  });
}

export async function getSessions(userId: string, page: number, limit: number) {
  const skip = (page - 1) * limit;
  const [sessions, total] = await Promise.all([
    prisma.challengeSession.findMany({
      where: { userId, completed: true },
      orderBy: { startedAt: 'desc' },
      skip,
      take: limit,
      select: { id: true, startedAt: true, score: true, totalAsked: true, durationSecs: true },
    }),
    prisma.challengeSession.count({ where: { userId, completed: true } }),
  ]);
  return { sessions, total, page, limit };
}
