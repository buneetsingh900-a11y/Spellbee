import React, { useState } from 'react';
import { RoundConfig, DifficultyLevel, QuestionCategory } from '../types';
import { Sparkles, Clock, Compass, Layers, Volume2, X } from 'lucide-react';

interface SetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartRound: (config: RoundConfig) => void;
  initialConfig?: RoundConfig;
}

export const SetupModal: React.FC<SetupModalProps> = ({
  isOpen,
  onClose,
  onStartRound,
  initialConfig,
}) => {
  const [difficulty, setDifficulty] = useState<'all' | DifficultyLevel>(
    initialConfig?.difficulty || 'junior'
  );
  const [questionCount, setQuestionCount] = useState<number>(initialConfig?.questionCount || 10);
  const [timerSeconds, setTimerSeconds] = useState<number>(initialConfig?.timerSeconds ?? 30);
  const [category, setCategory] = useState<'all' | QuestionCategory>(initialConfig?.category || 'all');
  const [autoSpeak, setAutoSpeak] = useState<boolean>(initialConfig?.autoSpeak ?? true);
  const [autoAdvance, setAutoAdvance] = useState<boolean>(initialConfig?.autoAdvance ?? false);

  if (!isOpen) return null;

  const handleStart = () => {
    onStartRound({
      difficulty,
      questionCount,
      timerSeconds,
      category,
      autoSpeak,
      autoAdvance,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-amber-200 overflow-hidden relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-amber-400/90 text-2xl flex items-center justify-center shadow-xs">
            🐝
          </div>
          <div>
            <h2 className="font-display font-bold text-2xl text-slate-900 tracking-tight">
              Start a New SpellBee Round
            </h2>
            <p className="text-sm text-slate-500">
              Customize questions, challenge timer, and difficulty tier.
            </p>
          </div>
        </div>

        <div className="space-y-5 text-sm text-slate-700">
          {/* Difficulty Tier */}
          <div>
            <label className="flex items-center gap-2 font-semibold text-slate-800 mb-2">
              <Compass className="w-4 h-4 text-amber-600" />
              <span>Select Difficulty Tier</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'all', label: 'All Levels', desc: 'Mixed pool', icon: '🌈' },
                { id: 'junior', label: 'Junior Bee', desc: 'Ages 6-8', icon: '🌱' },
                { id: 'champ', label: 'Champ Bee', desc: 'Ages 9-11', icon: '🚀' },
                { id: 'grand', label: 'Grand Bee', desc: 'Ages 12+ Masters', icon: '👑' },
              ].map((tier) => (
                <button
                  key={tier.id}
                  type="button"
                  onClick={() => setDifficulty(tier.id as 'all' | DifficultyLevel)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    difficulty === tier.id
                      ? 'bg-amber-100 border-amber-400 text-amber-950 font-bold ring-2 ring-amber-300'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <div className="text-xl mb-1">{tier.icon}</div>
                  <div className="font-display font-bold text-xs sm:text-sm">{tier.label}</div>
                  <div className="text-[11px] text-slate-500 font-normal">{tier.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Question Count */}
          <div>
            <label className="flex items-center gap-2 font-semibold text-slate-800 mb-2">
              <Layers className="w-4 h-4 text-amber-600" />
              <span>Number of Statements</span>
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[5, 10, 15, 20].map((count) => (
                <button
                  key={count}
                  type="button"
                  onClick={() => setQuestionCount(count)}
                  className={`py-2 px-3 rounded-xl border font-bold text-center text-sm transition-all ${
                    questionCount === count
                      ? 'bg-amber-400 text-amber-950 border-amber-500 shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {count} Words
                </button>
              ))}
            </div>
          </div>

          {/* Timed Round Speed */}
          <div>
            <label className="flex items-center gap-2 font-semibold text-slate-800 mb-2">
              <Clock className="w-4 h-4 text-amber-600" />
              <span>Timer per Statement</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { seconds: 0, label: 'Untimed / Relaxed', desc: 'No rush, zero timer pressure' },
                { seconds: 30, label: '30s Standard', desc: 'Great balanced challenge' },
                { seconds: 15, label: '15s Speedy Stinger', desc: 'Fast reflex challenge!' },
              ].map((opt) => (
                <button
                  key={opt.seconds}
                  type="button"
                  onClick={() => setTimerSeconds(opt.seconds)}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    timerSeconds === opt.seconds
                      ? 'bg-amber-100 border-amber-400 text-amber-950 font-bold ring-2 ring-amber-300'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <div className="font-semibold text-xs sm:text-sm">{opt.label}</div>
                  <div className="text-[11px] text-slate-500 font-normal">{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Pronunciation & Assist Options */}
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <label className="flex items-center justify-between cursor-pointer select-none py-1">
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-amber-600" />
                <span className="font-medium text-xs sm:text-sm">Auto-Pronounce Sentences</span>
              </div>
              <input
                type="checkbox"
                checked={autoSpeak}
                onChange={(e) => setAutoSpeak(e.target.checked)}
                className="w-4 h-4 text-amber-500 rounded-sm focus:ring-amber-400 cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer select-none py-1">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span className="font-medium text-xs sm:text-sm">Auto-Advance after 2s</span>
              </div>
              <input
                type="checkbox"
                checked={autoAdvance}
                onChange={(e) => setAutoAdvance(e.target.checked)}
                className="w-4 h-4 text-amber-500 rounded-sm focus:ring-amber-400 cursor-pointer"
              />
            </label>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-3 mt-7 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleStart}
            className="flex items-center gap-2 px-6 py-2.5 bg-linear-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-amber-950 font-bold rounded-xl shadow-md transition-all transform active:scale-95 text-sm"
          >
            <Sparkles className="w-4 h-4 text-amber-900" />
            <span>Launch Round ➔</span>
          </button>
        </div>
      </div>
    </div>
  );
};
