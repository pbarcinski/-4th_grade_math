import { prisma } from '../lib/prisma';

type Mode = 'LEARN' | 'CHALLENGE';

interface ConversionDef {
  key: string;
  fromUnit: string;
  toUnit: string;
  factor: number;
  multiply: boolean; // true = sourceValue * factor, false = sourceValue / factor
  sourceValues: number[];
  label: string;
}

const CONVERSIONS: ConversionDef[] = [
  // Długości
  { key: 'mm_to_cm', fromUnit: 'mm', toUnit: 'cm', factor: 10, multiply: false, sourceValues: [10,20,30,40,50,60,70,80,90,100,150,200], label: 'mm → cm' },
  { key: 'cm_to_mm', fromUnit: 'cm', toUnit: 'mm', factor: 10, multiply: true,  sourceValues: [1,2,3,4,5,6,7,8,9,10,15,20], label: 'cm → mm' },
  { key: 'cm_to_dm', fromUnit: 'cm', toUnit: 'dm', factor: 10, multiply: false, sourceValues: [10,20,30,40,50,60,70,80,90,100], label: 'cm → dm' },
  { key: 'dm_to_cm', fromUnit: 'dm', toUnit: 'cm', factor: 10, multiply: true,  sourceValues: [1,2,3,4,5,6,7,8,9,10], label: 'dm → cm' },
  { key: 'dm_to_m',  fromUnit: 'dm', toUnit: 'm',  factor: 10, multiply: false, sourceValues: [10,20,30,40,50,60,70,80,90,100], label: 'dm → m' },
  { key: 'm_to_dm',  fromUnit: 'm',  toUnit: 'dm', factor: 10, multiply: true,  sourceValues: [1,2,3,4,5,6,7,8,9,10], label: 'm → dm' },
  { key: 'cm_to_m',  fromUnit: 'cm', toUnit: 'm',  factor: 100, multiply: false, sourceValues: [100,200,300,400,500,600,700,800,900,1000], label: 'cm → m' },
  { key: 'm_to_cm',  fromUnit: 'm',  toUnit: 'cm', factor: 100, multiply: true,  sourceValues: [1,2,3,4,5,6,7,8,9,10], label: 'm → cm' },
  { key: 'm_to_km',  fromUnit: 'm',  toUnit: 'km', factor: 1000, multiply: false, sourceValues: [1000,2000,3000,4000,5000], label: 'm → km' },
  { key: 'km_to_m',  fromUnit: 'km', toUnit: 'm',  factor: 1000, multiply: true,  sourceValues: [1,2,3,4,5,6,7,8,9,10], label: 'km → m' },
  // Wagi
  { key: 'g_to_dag',  fromUnit: 'g',   toUnit: 'dag', factor: 10,  multiply: false, sourceValues: [10,20,30,40,50,60,70,80,90,100,150,200], label: 'g → dag' },
  { key: 'dag_to_g',  fromUnit: 'dag', toUnit: 'g',   factor: 10,  multiply: true,  sourceValues: [1,2,3,4,5,6,7,8,9,10,15,20], label: 'dag → g' },
  { key: 'dag_to_kg', fromUnit: 'dag', toUnit: 'kg',  factor: 100, multiply: false, sourceValues: [100,200,300,400,500,600,700,800,900,1000], label: 'dag → kg' },
  { key: 'kg_to_dag', fromUnit: 'kg',  toUnit: 'dag', factor: 100, multiply: true,  sourceValues: [1,2,3,4,5,6,7,8,9,10], label: 'kg → dag' },
  { key: 'g_to_kg',   fromUnit: 'g',   toUnit: 'kg',  factor: 1000, multiply: false, sourceValues: [1000,2000,3000,4000,5000], label: 'g → kg' },
  { key: 'kg_to_g',   fromUnit: 'kg',  toUnit: 'g',   factor: 1000, multiply: true,  sourceValues: [1,2,3,4,5,6,7,8,9,10], label: 'kg → g' },
];

const CONVERSION_MAP = new Map(CONVERSIONS.map(c => [c.key, c]));

export function getConversionByKey(key: string): ConversionDef | undefined {
  return CONVERSION_MAP.get(key);
}

export function getAllConversionKeys(): string[] {
  return CONVERSIONS.map(c => c.key);
}

export function getConversionLabel(key: string): string {
  return CONVERSION_MAP.get(key)?.label ?? key;
}

async function getWeakConversionSet(userId: string): Promise<Set<string>> {
  const groups = await prisma.answer.groupBy({
    by: ['conversionKey'],
    where: { userId, isCorrect: false, category: 'UNIT_CONVERSION' },
    _count: { id: true },
    having: { id: { _count: { gte: 2 } } },
  });
  return new Set(
    groups
      .filter(g => g.conversionKey !== null)
      .map(g => g.conversionKey as string),
  );
}

export async function generateConversionQuestion(userId: string) {
  const weakSet = await getWeakConversionSet(userId);

  let conv: ConversionDef;
  const weakConvs = CONVERSIONS.filter(c => weakSet.has(c.key));
  if (weakConvs.length > 0 && Math.random() < 0.7) {
    conv = weakConvs[Math.floor(Math.random() * weakConvs.length)];
  } else {
    conv = CONVERSIONS[Math.floor(Math.random() * CONVERSIONS.length)];
  }

  const sourceValue = conv.sourceValues[Math.floor(Math.random() * conv.sourceValues.length)];
  const correctAnswer = conv.multiply ? sourceValue * conv.factor : sourceValue / conv.factor;

  return {
    operandA: sourceValue,
    operandB: 1,
    operation: 'CONVERT' as const,
    display: `${sourceValue} ${conv.fromUnit} = ? ${conv.toUnit}`,
    conversionKey: conv.key,
    fromUnit: conv.fromUnit,
    toUnit: conv.toUnit,
    conversionFactor: conv.factor,
    conversionMultiply: conv.multiply,
    correctAnswer,
  };
}

export async function checkConversionAnswer(
  userId: string,
  conversionKey: string,
  sourceValue: number,
  givenAnswer: number,
  mode: Mode,
  sessionId: string | null,
) {
  const conv = CONVERSION_MAP.get(conversionKey);
  if (!conv) throw new Error(`Unknown conversionKey: ${conversionKey}`);

  const correctAnswer = conv.multiply ? sourceValue * conv.factor : sourceValue / conv.factor;
  const isCorrect = givenAnswer === correctAnswer;

  await prisma.answer.create({
    data: {
      userId,
      operandA: sourceValue,
      operandB: 1,
      operation: 'CONVERT',
      givenAnswer,
      isCorrect,
      mode,
      sessionId: sessionId ?? undefined,
      category: 'UNIT_CONVERSION',
      conversionKey,
    },
  });

  const conversionHint = !isCorrect
    ? { factor: conv.factor, fromUnit: conv.fromUnit, toUnit: conv.toUnit, multiply: conv.multiply }
    : null;

  return { isCorrect, correctAnswer, hint: null, conversionHint };
}
