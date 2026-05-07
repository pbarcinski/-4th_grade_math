import { prisma } from '../lib/prisma';

type Operation = 'MULTIPLY' | 'DIVIDE';
type Mode = 'LEARN' | 'CHALLENGE';

const ALL_PAIRS: [number, number][] = [];
for (let a = 2; a <= 10; a++) {
  for (let b = 2; b <= 10; b++) {
    if (a * b <= 100) ALL_PAIRS.push([a, b]);
  }
}

interface Question {
  operandA: number;
  operandB: number;
  operation: Operation;
  display: string;
}

function pickWeighted(pairs: [number, number][], weakSet: Set<string>): [number, number] {
  const weakPairs = pairs.filter(([a, b]) => weakSet.has(`${a}x${b}`));
  if (weakPairs.length > 0 && Math.random() < 0.7) {
    return weakPairs[Math.floor(Math.random() * weakPairs.length)];
  }
  return pairs[Math.floor(Math.random() * pairs.length)];
}

async function getWeakSet(userId: string): Promise<Set<string>> {
  const groups = await prisma.answer.groupBy({
    by: ['operandA', 'operandB'],
    where: { userId, isCorrect: false },
    _count: { id: true },
    having: { id: { _count: { gte: 2 } } },
  });
  return new Set(groups.map((g) => `${g.operandA}x${g.operandB}`));
}

export async function generateQuestion(userId: string, _mode: Mode): Promise<Question> {
  const weakSet = await getWeakSet(userId);

  const useMultiply = Math.random() < 0.6;
  const [a, b] = pickWeighted(ALL_PAIRS, weakSet);

  if (useMultiply) {
    return { operandA: a, operandB: b, operation: 'MULTIPLY', display: `${a} × ${b} = ?` };
  } else {
    const product = a * b;
    const divideByA = Math.random() < 0.5;
    const dividend = product;
    const divisor = divideByA ? a : b;
    return { operandA: dividend, operandB: divisor, operation: 'DIVIDE', display: `${dividend} ÷ ${divisor} = ?` };
  }
}

function buildHint(operation: Operation, operandA: number, operandB: number): number[] {
  if (operation === 'MULTIPLY') {
    return Array.from({ length: 10 }, (_, i) => operandA * (i + 1));
  } else {
    return Array.from({ length: 10 }, (_, i) => operandB * (i + 1));
  }
}

export async function checkAnswer(
  userId: string,
  operandA: number,
  operandB: number,
  operation: Operation,
  givenAnswer: number,
  mode: Mode,
  sessionId: string | null,
) {
  const correctAnswer =
    operation === 'MULTIPLY' ? operandA * operandB : Math.round(operandA / operandB);
  const isCorrect = givenAnswer === correctAnswer;

  await prisma.answer.create({
    data: {
      userId,
      operandA,
      operandB,
      operation,
      givenAnswer,
      isCorrect,
      mode,
      sessionId: sessionId ?? undefined,
    },
  });

  const hint = !isCorrect ? buildHint(operation, operandA, operandB) : null;
  return { isCorrect, correctAnswer, hint };
}
