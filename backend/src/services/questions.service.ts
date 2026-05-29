import { prisma } from '../lib/prisma';
import {
  generateConversionQuestion,
  checkConversionAnswer,
  getConversionByKey,
} from './conversions.service';

type Operation = 'MULTIPLY' | 'DIVIDE';
type Mode = 'LEARN' | 'CHALLENGE';
export type Category = 'MULTIPLICATION' | 'UNIT_CONVERSION';

const ALL_PAIRS: [number, number][] = [];
for (let a = 2; a <= 10; a++) {
  for (let b = 2; b <= 10; b++) {
    if (a * b <= 100) ALL_PAIRS.push([a, b]);
  }
}

interface MultiplyQuestion {
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
    where: { userId, isCorrect: false, category: 'MULTIPLICATION' },
    _count: { id: true },
    having: { id: { _count: { gte: 2 } } },
  });
  return new Set(groups.map((g) => `${g.operandA}x${g.operandB}`));
}

async function generateMultiplyQuestion(userId: string, _mode: Mode): Promise<MultiplyQuestion> {
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

export async function generateQuestion(userId: string, mode: Mode, category: Category = 'MULTIPLICATION') {
  if (category === 'UNIT_CONVERSION') {
    return generateConversionQuestion(userId);
  }
  return generateMultiplyQuestion(userId, mode);
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
  operation: string,
  givenAnswer: number,
  mode: Mode,
  sessionId: string | null,
  category: Category = 'MULTIPLICATION',
  conversionKey?: string,
) {
  if (category === 'UNIT_CONVERSION' && conversionKey) {
    return checkConversionAnswer(userId, conversionKey, operandA, givenAnswer, mode, sessionId);
  }

  const op = operation as Operation;
  const correctAnswer =
    op === 'MULTIPLY' ? operandA * operandB : Math.round(operandA / operandB);
  const isCorrect = givenAnswer === correctAnswer;

  await prisma.answer.create({
    data: {
      userId,
      operandA,
      operandB,
      operation: op,
      givenAnswer,
      isCorrect,
      mode,
      sessionId: sessionId ?? undefined,
      category: 'MULTIPLICATION',
    },
  });

  const hint = !isCorrect ? buildHint(op, operandA, operandB) : null;
  return { isCorrect, correctAnswer, hint };
}

export async function getWeakAreas(userId: string, category: Category = 'MULTIPLICATION') {
  if (category === 'UNIT_CONVERSION') {
    const groups = await prisma.answer.groupBy({
      by: ['conversionKey'],
      where: { userId, isCorrect: false, category: 'UNIT_CONVERSION' },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 10,
    });
    return groups
      .filter(g => g.conversionKey)
      .map(g => ({
        operandA: 0,
        operandB: 0,
        operation: 'CONVERT',
        wrongCount: g._count.id,
        conversionKey: g.conversionKey as string,
        conversionLabel: getConversionByKey(g.conversionKey as string)?.label ?? g.conversionKey,
      }));
  }

  const groups = await prisma.answer.groupBy({
    by: ['operandA', 'operandB', 'operation'],
    where: { userId, isCorrect: false, category: 'MULTIPLICATION' },
    _count: { id: true },
    having: { id: { _count: { gte: 2 } } },
    orderBy: { _count: { id: 'desc' } },
    take: 10,
  });
  return groups.map(g => ({
    operandA: g.operandA,
    operandB: g.operandB,
    operation: g.operation,
    wrongCount: g._count.id,
  }));
}
