import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { questionsApi } from '@/api/questions.api';
import { sessionsApi } from '@/api/sessions.api';
import { useGameStore } from '@/store/gameStore';
import { Question } from '@/types';
import { CountdownTimer } from '@/components/challenge/CountdownTimer';
import { ScoreBadge } from '@/components/challenge/ScoreBadge';
import { ChallengeQuestion } from '@/components/challenge/ChallengeQuestion';
import { ChallengeSetup, AnswerMode, ChallengeDuration } from '@/components/challenge/ChallengeSetup';
import { Spinner } from '@/components/ui/Spinner';

type Phase = 'setup' | 'loading' | 'playing';

export function ChallengePage() {
  const navigate = useNavigate();
  const { startSession, setQuestion, recordAnswer, tick, reset } = useGameStore();
  const [question, setLocalQuestion] = useState<Question | null>(null);
  const [resetKey, setResetKey] = useState(0);
  const [phase, setPhase] = useState<Phase>('setup');
  const [answerMode, setAnswerMode] = useState<AnswerMode>('click');
  const [duration, setDuration] = useState<ChallengeDuration>(60);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const endingRef = useRef(false);

  const fetchNext = useCallback(async (sid: string) => {
    const q = await questionsApi.next('CHALLENGE', sid);
    setLocalQuestion(q);
    setQuestion(q);
    setResetKey(k => k + 1);
  }, [setQuestion]);

  const endChallenge = useCallback(async (sid: string, finalScore: number, finalTotal: number) => {
    if (endingRef.current) return;
    endingRef.current = true;
    if (timerRef.current) clearInterval(timerRef.current);
    await sessionsApi.end(sid, finalScore, finalTotal);
    navigate('/results');
  }, [navigate]);

  const handleStart = useCallback(async (mode: AnswerMode, dur: ChallengeDuration) => {
    setAnswerMode(mode);
    setDuration(dur);
    setPhase('loading');
    reset();
    endingRef.current = false;

    const session = await sessionsApi.start(dur);
    const sid = session.id;
    startSession(sid, dur);
    await fetchNext(sid);
    setPhase('playing');

    timerRef.current = setInterval(() => { tick(); }, 1000);
  }, [reset, startSession, fetchNext, tick]);

  useEffect(() => {
    reset();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const storeTimeLeft = useGameStore(s => s.timeLeft);
  const storeScore = useGameStore(s => s.score);
  const storeTotalAsked = useGameStore(s => s.totalAsked);
  const storeSessionId = useGameStore(s => s.sessionId);

  useEffect(() => {
    if (phase === 'playing' && storeTimeLeft === 0 && storeSessionId && !endingRef.current) {
      endChallenge(storeSessionId, storeScore, storeTotalAsked);
    }
  }, [phase, storeTimeLeft, storeSessionId, storeScore, storeTotalAsked, endChallenge]);

  const handleAnswer = async (value: number) => {
    if (!question || !storeSessionId || endingRef.current) return;
    const result = await questionsApi.answer({
      operandA: question.operandA,
      operandB: question.operandB,
      operation: question.operation,
      givenAnswer: value,
      mode: 'CHALLENGE',
      sessionId: storeSessionId,
    });
    recordAnswer(question, result.isCorrect);
    await fetchNext(storeSessionId);
  };

  if (phase === 'setup') {
    return <ChallengeSetup onStart={handleStart} />;
  }

  if (phase === 'loading') {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Spinner className="w-12 h-12" />
          <p className="text-gray-500 dark:text-gray-400">Przygotowuję challenge...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-lg mx-auto">
      <div className="flex justify-between items-center">
        <ScoreBadge score={storeScore} total={storeTotalAsked} />
        <CountdownTimer timeLeft={storeTimeLeft} total={duration} />
      </div>

      {question && (
        <ChallengeQuestion
          question={question}
          onAnswer={handleAnswer}
          resetKey={resetKey}
          answerMode={answerMode}
        />
      )}
    </div>
  );
}
