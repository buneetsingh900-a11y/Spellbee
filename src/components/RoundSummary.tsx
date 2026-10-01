import React, { useEffect } from 'react';
import { RoundResult, Badge } from '../types';
import confetti from 'canvas-confetti';
import {
  Trophy,
  RotateCcw,
  LayoutDashboard,
  CheckCircle2,
  XCircle,
  Volume2,
  ArrowRight,
  Flame,
  Clock,
  Sparkles,
  HeartHandshake,
} from 'lucide-react';
import { speakWordSlowly } from '../utils/audio';

interface RoundSummaryProps {
  result: RoundResult;
  unlockedBadges: Badge[];
  onPlayAgain: () => void;
  onGoToDashboard: () => void;
  onGoToClinic: () => void;
}

export const RoundSummary: React.FC<RoundSummaryProps> = ({
  result,
  unlockedBadges,
  onPlayAgain,
  onGoToDashboard,
  onGoToClinic,
}) => {
  useEffect(() => {
    // Fire celebratory confetti if child scored well!
    if (result.accuracy >= 60) {
      try {
        confetti({
          particleCount: result.accuracy === 100 ? 120 : 60,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#F59E0B', '#FBBF24', '#10B981', '#38BDF8', '#EC4899'],
        });
      } catch {
        // ignore if canvas-confetti fails
      }
    }
  }, [result.accuracy]);

  const starCount = result.accuracy >= 90 ? 3 : result.accuracy >= 70 ? 2 : 1;
  const missedCount = result.totalQuestions - result.score;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 animate-in fade-in duration-300">
      {/* Top Victory Card */}
      <div className="bg-linear-to-b from-amber-50 to-white rounded-3xl p-6 sm:p-10 border border-amber-200 shadow-sm text-center mb-6 relative overflow-hidden">
        {/* Star Rating Badges */}
        <div className="flex items-center justify-center gap-2 mb-3">
          {[1, 2, 3].map((star) => (
            <span
              key={star}
              className={`text-3xl sm:text-4xl transition-transform ${
                star <= starCount ? 'scale-110 drop-shadow-sm' : 'grayscale opacity-30'
              }`}
            >
              ⭐
            </span>
          ))}
        </div>

        <h1 className="font-display font-bold text-2xl sm:text-4xl text-slate-900 tracking-tight mb-2">
          {result.accuracy === 100
            ? 'Incredible! Perfect Hive Score!'
            : result.accuracy >= 75
            ? 'Fantastic Spelling Champion!'
            : 'Great Effort! Keep Buzzing!'}
        </h1>

        <p className="text-sm sm:text-base text-slate-600 max-w-lg mx-auto mb-6">
          You conquered {result.score} out of {result.totalQuestions} words correctly with a best
          streak of {result.streakMax} in a row.
        </p>

        {/* 4 Quantitative Result Tiles */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto mb-6 text-left">
          <div className="bg-white p-3.5 rounded-2xl border border-amber-200/80 shadow-xs">
            <span className="text-xs font-semibold text-slate-500 block mb-0.5">Accuracy</span>
            <div className="text-2xl font-display font-bold text-amber-600 tabular-nums">
              {result.accuracy}%
            </div>
            <span className="text-[11px] text-slate-400">
              {result.score}/{result.totalQuestions} correct
            </span>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-amber-200/80 shadow-xs">
            <span className="text-xs font-semibold text-slate-500 block mb-0.5">Honey Pots</span>
            <div className="text-2xl font-display font-bold text-amber-500 flex items-center gap-1 tabular-nums">
              <span>+{result.honeyPotsEarned}</span>
              <span className="text-base">🍯</span>
            </div>
            <span className="text-[11px] text-slate-400">Reward bonus</span>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-amber-200/80 shadow-xs">
            <span className="text-xs font-semibold text-slate-500 block mb-0.5">Best Streak</span>
            <div className="text-2xl font-display font-bold text-amber-600 flex items-center gap-1 tabular-nums">
              <span>{result.streakMax}</span>
              <Flame className="w-5 h-5 text-amber-500 fill-amber-300" />
            </div>
            <span className="text-[11px] text-slate-400">Consecutive</span>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-amber-200/80 shadow-xs">
            <span className="text-xs font-semibold text-slate-500 block mb-0.5">Total Time</span>
            <div className="text-2xl font-display font-bold text-slate-700 flex items-center gap-1 tabular-nums">
              <span>{result.durationSeconds}s</span>
              <Clock className="w-4 h-4 text-slate-400" />
            </div>
            <span className="text-[11px] text-slate-400">
              ~{Math.round(result.durationSeconds / result.totalQuestions)}s per word
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={onPlayAgain}
            className="flex items-center gap-2 px-6 py-3 bg-linear-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-amber-950 font-bold rounded-xl shadow-md transition-all transform active:scale-95 text-sm"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Play Next Round</span>
          </button>

          {missedCount > 0 && (
            <button
              onClick={onGoToClinic}
              className="flex items-center gap-2 px-5 py-3 bg-white hover:bg-amber-50 text-amber-900 border border-amber-300 font-bold rounded-xl shadow-xs transition-colors text-sm"
            >
              <HeartHandshake className="w-4 h-4 text-amber-600" />
              <span>Practice Missed Words ({missedCount})</span>
            </button>
          )}

          <button
            onClick={onGoToDashboard}
            className="flex items-center gap-2 px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-colors text-sm"
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>View Dashboard</span>
          </button>
        </div>
      </div>

      {/* Newly Unlocked Badges Alert (if any) */}
      {unlockedBadges.length > 0 && (
        <div className="bg-amber-100/90 border border-amber-300 rounded-2xl p-5 mb-6 shadow-xs animate-in slide-in-from-top duration-300">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🎉</span>
            <div>
              <h3 className="font-display font-bold text-amber-950 text-base sm:text-lg">
                New Achievement Unlocked!
              </h3>
              <div className="flex flex-wrap gap-3 mt-1.5">
                {unlockedBadges.map((badge) => (
                  <div
                    key={badge.id}
                    className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-amber-200 text-xs shadow-xs font-semibold text-slate-800"
                  >
                    <span className="text-base">{badge.icon}</span>
                    <span>{badge.title}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Round Review List */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-amber-200 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-display font-bold text-xl text-slate-900">
              Round Question Review
            </h2>
            <p className="text-xs text-slate-500">
              Review every word, syllables breakdown, and spelling clues.
            </p>
          </div>
          <span className="text-xs font-bold text-slate-500">
            {result.answers.length} Total Words
          </span>
        </div>

        <div className="space-y-3">
          {result.answers.map((ans, idx) => (
            <div
              key={`${ans.questionId}-${idx}`}
              className={`p-4 rounded-2xl border transition-all ${
                ans.isCorrect
                  ? 'bg-emerald-50/40 border-emerald-200'
                  : 'bg-rose-50/40 border-rose-200'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {ans.isCorrect ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    ) : (
                      <XCircle className="w-5 h-5 text-rose-500 shrink-0" />
                    )}

                    <span className="font-display font-bold text-slate-900 text-base sm:text-lg">
                      {ans.targetWord}
                    </span>

                    <button
                      onClick={() => speakWordSlowly(ans.targetWord)}
                      className="p-1 rounded-md text-amber-700 hover:bg-amber-100 transition-colors"
                      title="Listen to word"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>

                    <span className="text-xs font-mono text-slate-500 bg-white/80 px-2 py-0.5 rounded border border-slate-200">
                      {ans.phoneticOrSyllables}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-600 mb-2">
                    {ans.statement}
                  </p>

                  {!ans.isCorrect && (
                    <div className="text-xs text-rose-700 font-medium mb-1">
                      Your answer:{' '}
                      <span className="line-through font-bold">
                        {ans.selectedIndex >= 0 ? ans.options[ans.selectedIndex] : 'Timed out'}
                      </span>{' '}
                      · Correct:{' '}
                      <span className="font-bold text-emerald-700">
                        {ans.options[ans.correctIndex]}
                      </span>
                    </div>
                  )}

                  {ans.memoryTip && (
                    <p className="text-xs text-slate-500 italic">
                      💡 Tip: {ans.memoryTip}
                    </p>
                  )}
                </div>

                <div className="text-right text-xs text-slate-400 shrink-0">
                  <span>{ans.timeTakenSeconds}s</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
