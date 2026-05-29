import { useState, useCallback, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { questionsApi } from '@/api/questions.api';
import { Question, AnswerResult, Category } from '@/types';
import { FlashCard } from '@/components/learn/FlashCard';
import { AnswerInput } from '@/components/learn/AnswerInput';
import { ClickChoices } from '@/components/learn/ClickChoices';
import { FeedbackBanner } from '@/components/learn/FeedbackBanner';
import { HintPanel } from '@/components/learn/HintPanel';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

type Phase = 'loading' | 'question' | 'feedback';
type AnswerMode = 'type' | 'click';

export function LearnPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const category = (searchParams.get('category') ?? 'MULTIPLICATION') as Category;

  const [phase, setPhase] = useState<Phase>('loading');
  const [question, setQuestion] = useState<Question | null>(null);
  const [result, setResult] = useState<AnswerResult | null>(null);
  const [animKey, setAnimKey] = useState(0);
  const [resetKey, setResetKey] = useState(0);
  const [answerMode, setAnswerMode] = useState<AnswerMode>('type');
  const [submitting, setSubmitting] = useState(false);

  const loadNext = useCallback(async () => {
    setPhase('loading');
    const q = await questionsApi.next('LEARN', undefined, category);
    setQuestion(q);
    setAnimKey(k => k + 1);
    setResetKey(k => k + 1);
    setPhase('question');
  }, [category]);

  useEffect(() => { loadNext(); }, [loadNext]);

  const handleAnswer = async (value: number) => {
    if (!question || submitting) return;
    setSubmitting(true);
    const r = await questionsApi.answer({
      operandA: question.operandA,
      operandB: question.operandB,
      operation: question.operation,
      givenAnswer: value,
      mode: 'LEARN',
      sessionId: null,
      category,
      conversionKey: question.conversionKey,
    });
    setResult(r);
    setPhase('feedback');
    setSubmitting(false);
  };

  const categoryLabel = category === 'UNIT_CONVERSION' ? 'Zamiana miar' : 'Tryb Nauki';

  return (
    <div className="flex flex-col gap-6 max-w-lg mx-auto">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/')} className="p-2 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-all">
          <ArrowLeft size={20} />
        </button>
        <h1 className="font-display text-2xl font-black text-gray-900 dark:text-gray-100">{categoryLabel}</h1>
      </div>

      {phase === 'loading' && (
        <div className="flex justify-center py-20">
          <Spinner />
        </div>
      )}

      {question && phase !== 'loading' && (
        <>
          <FlashCard question={question} animKey={animKey} />

          {phase === 'question' && (
            <div className="flex flex-col gap-4 items-center">
              <div className="flex rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 self-center">
                {(['type', 'click'] as AnswerMode[]).map(m => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setAnswerMode(m)}
                    className={cn(
                      'px-5 py-2 text-sm font-semibold transition-all',
                      answerMode === m
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800',
                    )}
                  >
                    {m === 'type' ? 'Wpisz' : 'Wybierz'}
                  </button>
                ))}
              </div>

              {answerMode === 'type' ? (
                <AnswerInput onSubmit={handleAnswer} resetKey={resetKey} disabled={submitting} />
              ) : (
                <ClickChoices question={question} resetKey={resetKey} onSubmit={handleAnswer} disabled={submitting} />
              )}

              <HintPanel question={question} />
            </div>
          )}

          {phase === 'feedback' && result && (
            <div className="flex flex-col gap-4">
              <FeedbackBanner result={result} operation={question.operation} operandA={question.operandA} question={question} />
              <Button onClick={loadNext} size="lg" className="w-full">
                Następne pytanie →
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
