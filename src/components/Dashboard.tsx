import React, { useState } from 'react';
import { PlayerProfile, RoundResult } from '../types';
import { BADGE_DEFINITIONS } from '../data/badges';
import {
  Trophy,
  Target,
  Flame,
  Clock,
  Compass,
  Layers,
  Sparkles,
  Calendar,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowUpRight,
  TrendingUp,
} from 'lucide-react';
import { BeeAvatar } from './BeeAvatar';

interface DashboardProps {
  profile: PlayerProfile;
  rounds: RoundResult[];
  onStartNewRound: () => void;
  onGoToClinic: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  profile,
  rounds,
  onStartNewRound,
  onGoToClinic,
}) => {
  const [selectedRound, setSelectedRound] = useState<RoundResult | null>(null);

  // Computed metrics
  const totalQuestions = profile.totalQuestionsAnswered;
  const totalCorrect = profile.totalCorrect;
  const overallAccuracy =
    totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

  // Breakdown by tier
  const tierStats = {
    junior: { attempted: 0, correct: 0 },
    champ: { attempted: 0, correct: 0 },
    grand: { attempted: 0, correct: 0 },
  };

  rounds.forEach((r) => {
    r.answers.forEach((ans) => {
      if (tierStats[ans.difficulty]) {
        tierStats[ans.difficulty].attempted += 1;
        if (ans.isCorrect) tierStats[ans.difficulty].correct += 1;
      }
    });
  });

  const getTierAccuracy = (tier: 'junior' | 'champ' | 'grand') => {
    const s = tierStats[tier];
    return s.attempted > 0 ? Math.round((s.correct / s.attempted) * 100) : 0;
  };

  const unlockedBadgeSet = new Set(profile.unlockedBadgeIds || []);

  const formatDuration = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    if (mins === 0) return `${secs}s`;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 animate-in fade-in duration-300">
      {/* Child Player Profile Banner */}
      <div className="bg-linear-to-r from-amber-400 via-amber-300 to-amber-200 rounded-3xl p-6 sm:p-8 border border-amber-300 shadow-sm mb-6 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4 text-center sm:text-left">
          <BeeAvatar avatarId={profile.avatar} size="xl" showAnimation={true} />
          <div>
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <h1 className="font-display font-bold text-2xl sm:text-3xl text-amber-950 tracking-tight">
                {profile.name}
              </h1>
              <span className="bg-white/80 text-amber-900 text-xs font-bold px-2.5 py-0.5 rounded-full border border-amber-300">
                Level {profile.level}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-amber-900/80 mt-1 max-w-md">
              Welcome back to your spelling hive! Keep buzzing through timed rounds to collect honey
              pots and master tricky words.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onStartNewRound}
            className="flex items-center gap-2 px-5 py-3 bg-amber-950 hover:bg-slate-900 text-white font-bold rounded-2xl shadow-md transition-all transform active:scale-95 text-sm"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Launch Timed Round</span>
          </button>
        </div>
      </div>

      {/* 4 Quantitative KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-5 border border-amber-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Total Solved</span>
            <Target className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-3xl font-display font-bold text-slate-900 tabular-nums">
            {totalQuestions}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            <span className="text-emerald-600 font-bold">{totalCorrect}</span> correct answers
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-amber-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Overall Accuracy</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-display font-bold text-emerald-600 tabular-nums">
            {overallAccuracy}%
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Across {profile.totalRounds} completed rounds
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-amber-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Best Streak</span>
            <Flame className="w-4 h-4 text-amber-500 fill-amber-300" />
          </div>
          <div className="text-3xl font-display font-bold text-amber-600 tabular-nums">
            {profile.bestStreak}
          </div>
          <div className="text-xs text-slate-400 mt-1">Consecutive correct answers</div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-amber-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Honey Pots</span>
            <span className="text-lg">🍯</span>
          </div>
          <div className="text-3xl font-display font-bold text-amber-500 tabular-nums">
            {profile.honeyPots}
          </div>
          <div className="text-xs text-slate-400 mt-1">Available reward tokens</div>
        </div>
      </div>

      {/* 2-Column Split: Difficulty Mastery & Category Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Difficulty Mastery Tiers */}
        <div className="bg-white rounded-3xl p-6 border border-amber-200 shadow-xs">
          <h2 className="font-display font-bold text-lg text-slate-900 mb-1">
            Spelling Tier Mastery
          </h2>
          <p className="text-xs text-slate-500 mb-5">
            Accuracy track record across grade-level challenge tiers.
          </p>

          <div className="space-y-4">
            {/* Junior Bee */}
            <div>
              <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                <span className="flex items-center gap-1.5 text-slate-800">
                  <span>🌱</span> Junior Bee (Ages 6-8)
                </span>
                <span className="tabular-nums text-slate-600">
                  {getTierAccuracy('junior')}% ({tierStats.junior.correct}/
                  {tierStats.junior.attempted})
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${getTierAccuracy('junior')}%` }}
                />
              </div>
            </div>

            {/* Champ Bee */}
            <div>
              <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                <span className="flex items-center gap-1.5 text-slate-800">
                  <span>🚀</span> Champ Bee (Ages 9-11)
                </span>
                <span className="tabular-nums text-slate-600">
                  {getTierAccuracy('champ')}% ({tierStats.champ.correct}/
                  {tierStats.champ.attempted})
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-amber-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${getTierAccuracy('champ')}%` }}
                />
              </div>
            </div>

            {/* Grand Bee */}
            <div>
              <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                <span className="flex items-center gap-1.5 text-slate-800">
                  <span>👑</span> Grand Bee (Ages 12+ Masters)
                </span>
                <span className="tabular-nums text-slate-600">
                  {getTierAccuracy('grand')}% ({tierStats.grand.correct}/
                  {tierStats.grand.attempted})
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-purple-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${getTierAccuracy('grand')}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Honey Jar Tricky Words Callout */}
        <div className="bg-linear-to-br from-amber-50 to-orange-50 rounded-3xl p-6 border border-amber-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-amber-950 font-bold flex items-center justify-center text-xl mb-3 shadow-xs">
              🍯
            </div>
            <h2 className="font-display font-bold text-lg text-slate-900 mb-1">
              Honey Jar Practice Clinic
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
              Whenever you encounter a tricky spelling word, it is safely stored in your Honey Jar.
              Replaying missed words helps cement long-term spelling memory!
            </p>
          </div>

          <button
            onClick={onGoToClinic}
            className="flex items-center justify-between w-full p-3.5 bg-white hover:bg-amber-100/50 rounded-2xl border border-amber-300 font-bold text-amber-950 transition-all text-xs sm:text-sm shadow-xs"
          >
            <span>Open Honey Jar Clinic ➔</span>
            <ArrowUpRight className="w-4 h-4 text-amber-600" />
          </button>
        </div>
      </div>

      {/* Achievement Badges Showcase */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-amber-200 shadow-xs mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-display font-bold text-xl text-slate-900">
              Spelling Badges & Medals
            </h2>
            <p className="text-xs text-slate-500">
              Unlock unique trophies by completing timed rounds and streaks.
            </p>
          </div>
          <span className="text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
            {unlockedBadgeSet.size} / {BADGE_DEFINITIONS.length} Unlocked
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {BADGE_DEFINITIONS.map((badge) => {
            const isUnlocked = unlockedBadgeSet.has(badge.id);

            return (
              <div
                key={badge.id}
                className={`p-3.5 rounded-2xl border text-center transition-all ${
                  isUnlocked
                    ? 'bg-amber-50/70 border-amber-300 shadow-xs'
                    : 'bg-slate-50/60 border-slate-200 opacity-50 grayscale'
                }`}
                title={badge.description}
              >
                <div className="text-3xl mb-1.5">{badge.icon}</div>
                <div className="font-display font-bold text-xs sm:text-sm text-slate-900 truncate">
                  {badge.title}
                </div>
                <div className="text-[11px] text-slate-500 line-clamp-2 mt-0.5 leading-snug">
                  {badge.description}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Rounds History Log */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-amber-200 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-display font-bold text-xl text-slate-900">Recent Rounds History</h2>
            <p className="text-xs text-slate-500">
              Detailed record of your latest timed spelling sessions.
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-400">
            {rounds.length} Total Sessions
          </span>
        </div>

        {rounds.length === 0 ? (
          <div className="py-12 text-center text-slate-400">
            <span className="text-4xl block mb-2">🐝</span>
            <p className="text-sm font-semibold text-slate-600">No rounds recorded yet!</p>
            <p className="text-xs text-slate-400 mt-1">
              Start your first round in the Timed Arena to track your progress here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="pb-3">Date</th>
                  <th className="pb-3">Difficulty</th>
                  <th className="pb-3 text-center">Score</th>
                  <th className="pb-3 text-center">Accuracy</th>
                  <th className="pb-3 text-center">Best Streak</th>
                  <th className="pb-3 text-center">Duration</th>
                  <th className="pb-3 text-right">Review</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rounds.slice(0, 10).map((r) => {
                  const dateStr = new Date(r.timestamp).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <tr key={r.id} className="hover:bg-amber-50/40 transition-colors">
                      <td className="py-3 font-medium text-slate-700">{dateStr}</td>
                      <td className="py-3 capitalize text-slate-600">
                        {r.difficulty === 'all' ? 'Mixed' : r.difficulty} Bee
                      </td>
                      <td className="py-3 text-center font-bold text-slate-900 tabular-nums">
                        {r.score}/{r.totalQuestions}
                      </td>
                      <td className="py-3 text-center">
                        <span
                          className={`font-bold tabular-nums ${
                            r.accuracy >= 80
                              ? 'text-emerald-600'
                              : r.accuracy >= 60
                              ? 'text-amber-600'
                              : 'text-rose-600'
                          }`}
                        >
                          {r.accuracy}%
                        </span>
                      </td>
                      <td className="py-3 text-center tabular-nums font-semibold text-slate-600">
                        {r.streakMax} 🔥
                      </td>
                      <td className="py-3 text-center tabular-nums text-slate-500">
                        {formatDuration(r.durationSeconds)}
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => setSelectedRound(r)}
                          className="px-2.5 py-1 text-xs font-semibold text-amber-900 bg-amber-100 hover:bg-amber-200 rounded-lg transition-colors"
                        >
                          Details
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Review Modal for a specific past round */}
      {selectedRound && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 border border-amber-200 shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-display font-bold text-xl text-slate-900">
                  Round Review Details
                </h3>
                <span className="text-xs text-slate-400">
                  {new Date(selectedRound.timestamp).toLocaleString()} · Score:{' '}
                  {selectedRound.score}/{selectedRound.totalQuestions} (
                  {selectedRound.accuracy}%)
                </span>
              </div>
              <button
                onClick={() => setSelectedRound(null)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              {selectedRound.answers.map((ans, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-xl border text-xs sm:text-sm ${
                    ans.isCorrect
                      ? 'bg-emerald-50/50 border-emerald-200'
                      : 'bg-rose-50/50 border-rose-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-display font-bold text-slate-900">
                      {ans.targetWord}{' '}
                      <span className="font-mono font-normal text-slate-500 text-xs">
                        ({ans.phoneticOrSyllables})
                      </span>
                    </span>
                    <span className="font-semibold text-slate-400">{ans.timeTakenSeconds}s</span>
                  </div>
                  <p className="text-slate-600 mb-1">{ans.statement}</p>
                  {!ans.isCorrect && (
                    <div className="text-rose-700">
                      Picked:{' '}
                      <span className="line-through font-bold">
                        {ans.selectedIndex >= 0 ? ans.options[ans.selectedIndex] : 'Timed out'}
                      </span>{' '}
                      · Correct:{' '}
                      <span className="font-bold text-emerald-700">
                        {ans.options[ans.correctIndex]}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
