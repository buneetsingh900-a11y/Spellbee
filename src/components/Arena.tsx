import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Question,
  RoundConfig,
  QuestionAnswerRecord,
  RoundResult,
  DifficultyLevel,
} from '../types';
import {
  Volume2,
  HelpCircle,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Flame,
} from 'lucide-react';
import {
  playCorrectSound,
  playWrongSound,
  playTickSound,
  playFanfareSound,
  speakStatement,
  speakWordSlowly,
  stopSpeaking,
} from '../utils/audio';

interface ArenaProps {
  questions: Question[];
  config: RoundConfig;
  onFinishRound: (result: RoundResult) => void;
  onExitRound: () => void;
  onIncrementAudioCount: () => void;
}

export const Arena: React.FC<ArenaProps> = ({
  questions,
  config,
  onFinishRound,
  onExitRound,
  onIncrementAudioCount,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(config.timerSeconds);
  const [isPaused, setIsPaused] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [score, setScore] = useState(0);
  const [answersRecord, setAnswersRecord] = useState<QuestionAnswerRecord[]>([]);

  const questionStartTimeRef = useRef<number>(Date.now());
  const timerIntervalRef = useRef<number | null>(null);
  const autoAdvanceTimeoutRef = useRef<number | null>(null);

  const currentQuestion = questions[currentIndex] || questions[0];
  const isTimed = config.timerSeconds > 0;

  // Speak current statement
  const speakCurrent = useCallback(() => {
    if (!currentQuestion) return;
    setIsSpeaking(true);
    onIncrementAudioCount();
    speakStatement(currentQuestion.statement, () => {
      setIsSpeaking(false);
    });
  }, [currentQuestion, onIncrementAudioCount]);

  // Reset per-question state when currentIndex changes
  useEffect(() => {
    setSelectedOptionIndex(null);
    setIsAnswered(false);
    setShowHint(false);
    setTimeLeft(config.timerSeconds);
    questionStartTimeRef.current = Date.now();

    if (config.autoSpeak && !isPaused) {
      const timer = setTimeout(() => {
        speakCurrent();
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, config.timerSeconds, config.autoSpeak, isPaused, speakCurrent]);

  // Clean up speech on unmount
  useEffect(() => {
    return () => {
      stopSpeaking();
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (autoAdvanceTimeoutRef.current) clearTimeout(autoAdvanceTimeoutRef.current);
    };
  }, []);

  // Answer selection handler
  const handleSelectOption = useCallback(
    (optionIndex: number, isTimeout = false) => {
      if (isAnswered || isPaused) return;

      stopSpeaking();
      setIsSpeaking(false);
      setIsAnswered(true);
      setSelectedOptionIndex(optionIndex);

      const timeTaken = Math.max(
        1,
        Math.round((Date.now() - questionStartTimeRef.current) / 1000)
      );

      const isCorrect = !isTimeout && optionIndex === currentQuestion.correctIndex;

      let nextStreak = currentStreak;
      if (isCorrect) {
        nextStreak = currentStreak + 1;
        setCurrentStreak(nextStreak);
        if (nextStreak > maxStreak) {
          setMaxStreak(nextStreak);
        }
        setScore((prev) => prev + 1);

        if (nextStreak >= 5 && nextStreak % 5 === 0) {
          playFanfareSound();
        } else {
          playCorrectSound();
        }
      } else {
        setCurrentStreak(0);
        playWrongSound();
      }

      const answerRecord: QuestionAnswerRecord = {
        questionId: currentQuestion.id,
        statement: currentQuestion.statement,
        targetWord: currentQuestion.targetWord,
        options: currentQuestion.options,
        selectedIndex: optionIndex,
        correctIndex: currentQuestion.correctIndex,
        isCorrect,
        timeTakenSeconds: timeTaken,
        difficulty: currentQuestion.difficulty,
        category: currentQuestion.category,
        phoneticOrSyllables: currentQuestion.phoneticOrSyllables,
        memoryTip: currentQuestion.memoryTip,
      };

      setAnswersRecord((prev) => [...prev, answerRecord]);

      // If auto-advance is enabled, move to next after 2.5s
      if (config.autoAdvance) {
        autoAdvanceTimeoutRef.current = window.setTimeout(() => {
          handleNextQuestion();
        }, 2200);
      }
    },
    [isAnswered, isPaused, currentQuestion, currentStreak, maxStreak, config.autoAdvance]
  );

  // Timer countdown loop
  useEffect(() => {
    if (!isTimed || isPaused || isAnswered) {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      return;
    }

    timerIntervalRef.current = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerIntervalRef.current as number);
          // Auto submit as timed out
          handleSelectOption(-1, true);
          return 0;
        }

        // Play subtle tick for last 5 seconds
        if (prev <= 6) {
          playTickSound();
        }

        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isTimed, isPaused, isAnswered, handleSelectOption]);

  // Next question or finish round
  const handleNextQuestion = () => {
    if (autoAdvanceTimeoutRef.current) clearTimeout(autoAdvanceTimeoutRef.current);

    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // Round Complete!
      const totalAnswers = answersRecord.length;
      const correctCount = score;
      const accuracy = totalAnswers > 0 ? Math.round((correctCount / totalAnswers) * 100) : 0;
      const honeyPotsEarned = correctCount * 2 + (maxStreak >= 5 ? 5 : 0);

      const result: RoundResult = {
        id: `round-${Date.now()}`,
        timestamp: Date.now(),
        score: correctCount,
        totalQuestions: questions.length,
        accuracy,
        durationSeconds: answersRecord.reduce((acc, a) => acc + a.timeTakenSeconds, 0),
        streakMax: maxStreak,
        difficulty: config.difficulty,
        category: config.category,
        honeyPotsEarned,
        answers: answersRecord,
      };

      onFinishRound(result);
    }
  };

  // Keyboard navigation (1, 2, 3, 4 or A, B, C, D, Space for speak)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isPaused) return;

      if (!isAnswered) {
        if (e.key === '1' || e.key === 'a' || e.key === 'A') handleSelectOption(0);
        else if (e.key === '2' || e.key === 'b' || e.key === 'B') handleSelectOption(1);
        else if (e.key === '3' || e.key === 'c' || e.key === 'C') handleSelectOption(2);
        else if (e.key === '4' || e.key === 'd' || e.key === 'D') handleSelectOption(3);
      } else {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleNextQuestion();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPaused, isAnswered, handleSelectOption]);

  // Formatted timer percentage
  const timerPercentage = isTimed ? (timeLeft / config.timerSeconds) * 100 : 100;
  const isTimeRunningOut = isTimed && timeLeft <= 5;

  const difficultyBadgeMap: Record<DifficultyLevel, { label: string; icon: string }> = {
    junior: { label: 'Junior Bee', icon: '🌱' },
    champ: { label: 'Champ Bee', icon: '🚀' },
    grand: { label: 'Grand Bee', icon: '👑' },
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-4 sm:py-6">
      {/* Top HUD Card */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-amber-200/80 shadow-xs mb-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          {/* Progress Indicator */}
          <div className="flex items-center gap-2">
            <span className="font-display font-bold text-amber-950 text-base sm:text-lg">
              Word {currentIndex + 1} of {questions.length}
            </span>
            <span className="text-slate-300">·</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-amber-100/70 text-amber-800">
              {difficultyBadgeMap[currentQuestion.difficulty]?.icon}{' '}
              {difficultyBadgeMap[currentQuestion.difficulty]?.label}
            </span>
            <span className="hidden sm:inline text-slate-300">·</span>
            <span className="hidden sm:inline text-xs text-slate-500 font-medium">
              {currentQuestion.categoryLabel}
            </span>
          </div>

          {/* Right Side HUD Controls */}
          <div className="flex items-center gap-3">
            {/* Streak Counter */}
            {currentStreak > 1 && (
              <div className="flex items-center gap-1 px-2.5 py-1 bg-amber-500 text-amber-950 font-bold rounded-lg text-xs sm:text-sm animate-bounce shadow-xs">
                <Flame className="w-4 h-4 fill-amber-300 text-amber-900" />
                <span>{currentStreak} Streak!</span>
              </div>
            )}

            {/* Score */}
            <div className="text-xs sm:text-sm font-bold text-slate-700 tabular-nums">
              Score: <span className="text-amber-600 font-extrabold">{score}</span>
            </div>

            {/* Pause Button */}
            <button
              onClick={() => setIsPaused((prev) => !prev)}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
              title={isPaused ? 'Resume Round' : 'Pause Round'}
            >
              {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Question Progress Bar */}
        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden mb-2">
          <div
            className="bg-amber-400 h-full rounded-full transition-all duration-300"
            style={{ width: `${((currentIndex + (isAnswered ? 1 : 0)) / questions.length) * 100}%` }}
          />
        </div>

        {/* Timed Round Countdown Bar */}
        {isTimed && (
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-3 text-xs">
            <span className="font-semibold text-slate-500 flex items-center gap-1.5">
              <span>Time Left:</span>
              <span
                className={`font-mono tabular-nums font-bold text-sm ${
                  isTimeRunningOut ? 'text-rose-600 animate-pulse' : 'text-slate-700'
                }`}
              >
                {timeLeft}s
              </span>
            </span>

            <div className="flex-1 max-w-xs bg-slate-100 rounded-full h-2 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-1000 ${
                  isTimeRunningOut
                    ? 'bg-rose-500 animate-pulse'
                    : timeLeft <= 10
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                }`}
                style={{ width: `${timerPercentage}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Main Statement Stage */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-amber-200 shadow-sm relative overflow-hidden mb-6">
        {/* Subtle decorative honeycomb element */}
        <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-amber-100/40 pointer-events-none" />

        {/* Audio Speaker & Clue Buttons Row */}
        <div className="flex items-center justify-between gap-2 mb-5">
          <div className="flex items-center gap-2">
            <button
              onClick={speakCurrent}
              disabled={isSpeaking}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-xs ${
                isSpeaking
                  ? 'bg-amber-500 text-amber-950 ring-2 ring-amber-300'
                  : 'bg-amber-100/80 hover:bg-amber-200/80 text-amber-900 border border-amber-300'
              }`}
            >
              <Volume2 className={`w-4 h-4 ${isSpeaking ? 'animate-bounce' : ''}`} />
              <span>{isSpeaking ? 'Reading Aloud...' : 'Read Aloud 🔊'}</span>
            </button>

            {currentQuestion.definitionOrClue && (
              <button
                onClick={() => setShowHint((prev) => !prev)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold text-xs text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 transition-colors"
              >
                <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
                <span>{showHint ? 'Hide Clue' : 'Need a Clue?'}</span>
              </button>
            )}
          </div>

          <span className="text-xs text-slate-400 font-medium hidden sm:inline">
            Use keys 1-4 or click an option
          </span>
        </div>

        {/* Revealed Clue Card */}
        {showHint && (
          <div className="p-3.5 rounded-xl bg-amber-50/90 border border-amber-200 text-amber-900 text-xs sm:text-sm mb-5 animate-in fade-in duration-200">
            <span className="font-bold">🐝 Bee Clue: </span>
            <span>{currentQuestion.definitionOrClue}</span>
          </div>
        )}

        {/* The Statement Prompt */}
        <div className="min-h-24 flex items-center justify-center text-center my-2 sm:my-4 px-2">
          <h1 className="font-display font-medium text-xl sm:text-2xl md:text-3xl text-slate-900 leading-relaxed max-w-3xl">
            {currentQuestion.statement.includes('_____') ? (
              <>
                {currentQuestion.statement.split('_____')[0]}
                <span className="inline-block px-3 py-1 mx-1.5 border-2 border-dashed border-amber-400 bg-amber-50/80 rounded-xl font-bold text-amber-900 underline decoration-amber-400 decoration-wavy decoration-2">
                  {isAnswered
                    ? currentQuestion.targetWord
                    : ' ? ? ? '}
                </span>
                {currentQuestion.statement.split('_____')[1]}
              </>
            ) : (
              currentQuestion.statement
            )}
          </h1>
        </div>
      </div>

      {/* 4 Interactive Option Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4 mb-6">
        {currentQuestion.options.map((option, idx) => {
          const letter = ['A', 'B', 'C', 'D'][idx];
          const isSelected = selectedOptionIndex === idx;
          const isCorrectOption = idx === currentQuestion.correctIndex;

          let btnStyle = 'bg-white hover:bg-amber-50/60 border-slate-200 hover:border-amber-400 text-slate-800 shadow-xs hover:shadow-md';

          if (isAnswered) {
            if (isCorrectOption) {
              btnStyle = 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold ring-2 ring-emerald-400 shadow-sm';
            } else if (isSelected) {
              btnStyle = 'bg-rose-50 border-rose-400 text-rose-950 font-bold';
            } else {
              btnStyle = 'bg-slate-50 border-slate-200 text-slate-400 opacity-60';
            }
          }

          return (
            <button
              key={`${currentQuestion.id}-opt-${idx}`}
              type="button"
              disabled={isAnswered || isPaused}
              onClick={() => handleSelectOption(idx)}
              className={`p-4 sm:p-5 rounded-2xl border-2 flex items-center justify-between text-left transition-all transform active:scale-98 min-h-16 ${btnStyle}`}
            >
              <div className="flex items-center gap-3.5">
                <span
                  className={`w-8 h-8 rounded-xl flex items-center justify-center font-display font-bold text-sm shrink-0 transition-colors ${
                    isAnswered && isCorrectOption
                      ? 'bg-emerald-500 text-white'
                      : isAnswered && isSelected
                      ? 'bg-rose-500 text-white'
                      : 'bg-amber-100 text-amber-900'
                  }`}
                >
                  {letter}
                </span>

                <span className="font-display font-bold text-lg sm:text-xl tracking-wide">
                  {option}
                </span>
              </div>

              {isAnswered && (
                <div>
                  {isCorrectOption ? (
                    <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                  ) : isSelected ? (
                    <XCircle className="w-6 h-6 text-rose-500 shrink-0" />
                  ) : null}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Immediate Educational Feedback Banner */}
      {isAnswered && (
        <div
          className={`p-5 sm:p-6 rounded-2xl border animate-in slide-in-from-bottom-2 duration-200 ${
            selectedOptionIndex === currentQuestion.correctIndex
              ? 'bg-emerald-50/90 border-emerald-300 text-emerald-950'
              : 'bg-amber-50/90 border-amber-300 text-amber-950'
          }`}
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xl">
                  {selectedOptionIndex === currentQuestion.correctIndex ? '🌟' : '💡'}
                </span>
                <h3 className="font-display font-bold text-lg">
                  {selectedOptionIndex === currentQuestion.correctIndex
                    ? 'Super Buzz! That is Correct!'
                    : `Correct Word: ${currentQuestion.targetWord}`}
                </h3>
              </div>

              {/* Syllables breakdown & Tip */}
              <div className="space-y-1 text-xs sm:text-sm text-slate-700">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-900">Syllables:</span>
                  <span className="font-mono bg-white px-2 py-0.5 rounded-md border border-slate-200 text-slate-800">
                    {currentQuestion.phoneticOrSyllables}
                  </span>
                  <button
                    onClick={() => speakWordSlowly(currentQuestion.targetWord)}
                    className="p-1 rounded-md text-amber-700 hover:bg-amber-100 transition-colors"
                    title="Pronounce word slowly"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {currentQuestion.memoryTip && (
                  <p className="text-slate-600 italic">
                    <span className="font-semibold not-italic">Memory Trick: </span>
                    {currentQuestion.memoryTip}
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={handleNextQuestion}
              className="w-full sm:w-auto px-6 py-3 bg-linear-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-amber-950 font-bold rounded-xl shadow-md flex items-center justify-center gap-2 transition-all transform active:scale-95 shrink-0 text-sm"
            >
              <span>{currentIndex + 1 < questions.length ? 'Next Word' : 'See Round Results'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Paused State Modal Overlay */}
      {isPaused && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center border border-amber-200 shadow-2xl">
            <div className="w-14 h-14 rounded-2xl bg-amber-100 text-3xl mx-auto flex items-center justify-center mb-4">
              ⏸️
            </div>
            <h3 className="font-display font-bold text-xl text-slate-900 mb-1">Round Paused</h3>
            <p className="text-xs sm:text-sm text-slate-500 mb-6">
              Take a breath! Your timer is frozen.
            </p>

            <div className="space-y-2">
              <button
                onClick={() => setIsPaused(false)}
                className="w-full py-2.5 px-4 bg-amber-400 hover:bg-amber-300 text-amber-950 font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 text-sm"
              >
                <Play className="w-4 h-4" />
                <span>Resume Round</span>
              </button>

              <button
                onClick={onExitRound}
                className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-colors text-sm"
              >
                Quit to Menu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
