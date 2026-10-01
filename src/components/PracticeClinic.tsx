import React, { useState } from 'react';
import { MissedWordItem } from '../types';
import {
  HeartHandshake,
  CheckCircle2,
  Trash2,
  Volume2,
  Play,
  Sparkles,
  BookOpen,
  Filter,
} from 'lucide-react';
import { speakWordSlowly, speakStatement } from '../utils/audio';

interface PracticeClinicProps {
  missedWords: MissedWordItem[];
  onStartPracticeRound: (words: MissedWordItem[]) => void;
  onMarkMastered: (id: string) => void;
  onDeleteWord: (id: string) => void;
}

export const PracticeClinic: React.FC<PracticeClinicProps> = ({
  missedWords,
  onStartPracticeRound,
  onMarkMastered,
  onDeleteWord,
}) => {
  const [filter, setFilter] = useState<'all' | 'needs-practice' | 'mastered'>('needs-practice');

  const filteredWords = missedWords.filter((item) => {
    if (filter === 'needs-practice') return !item.mastered;
    if (filter === 'mastered') return item.mastered;
    return true;
  });

  const activeNeedsCount = missedWords.filter((w) => !w.mastered).length;

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 animate-in fade-in duration-300">
      {/* Clinic Header */}
      <div className="bg-linear-to-r from-amber-100 via-amber-50 to-orange-50 rounded-3xl p-6 sm:p-8 border border-amber-300 shadow-sm mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">🍯</span>
            <h1 className="font-display font-bold text-2xl sm:text-3xl text-slate-900 tracking-tight">
              Honey Jar Practice Clinic
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 max-w-xl leading-relaxed">
            Every tricky word you miss in timed rounds is gently saved here. Practice them with
            guided clues and pronunciation until you achieve golden mastery!
          </p>
        </div>

        {activeNeedsCount > 0 && (
          <button
            onClick={() => onStartPracticeRound(missedWords.filter((w) => !w.mastered))}
            className="flex items-center gap-2 px-6 py-3 bg-linear-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-amber-950 font-bold rounded-2xl shadow-md transition-all transform active:scale-95 text-sm shrink-0"
          >
            <Play className="w-4 h-4 fill-amber-900" />
            <span>Practice {activeNeedsCount} Tricky Words</span>
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-1.5 p-1 bg-amber-50/80 rounded-xl border border-amber-200">
          <button
            onClick={() => setFilter('needs-practice')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              filter === 'needs-practice'
                ? 'bg-amber-400 text-amber-950 font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Needs Practice ({activeNeedsCount})
          </button>

          <button
            onClick={() => setFilter('mastered')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              filter === 'mastered'
                ? 'bg-amber-400 text-amber-950 font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Mastered ({missedWords.filter((w) => w.mastered).length})
          </button>

          <button
            onClick={() => setFilter('all')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              filter === 'all'
                ? 'bg-amber-400 text-amber-950 font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Words ({missedWords.length})
          </button>
        </div>
      </div>

      {/* Word Cards List */}
      {filteredWords.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-amber-200 shadow-xs">
          <span className="text-4xl block mb-2">🎉</span>
          <h3 className="font-display font-bold text-lg text-slate-800">
            {filter === 'needs-practice'
              ? 'Your Honey Jar is squeaky clean!'
              : 'No words in this view.'}
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-sm mx-auto">
            {filter === 'needs-practice'
              ? 'Awesome job! You have mastered all your tricky spelling words or haven\'t missed any yet.'
              : 'Keep playing in the Timed Arena to build your word list.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredWords.map((item) => (
            <div
              key={item.id}
              className={`p-5 rounded-2xl border transition-all ${
                item.mastered
                  ? 'bg-emerald-50/40 border-emerald-300'
                  : 'bg-white border-amber-200/90 shadow-xs hover:border-amber-300'
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-display font-bold text-xl text-slate-900">
                      {item.word}
                    </span>
                    <button
                      onClick={() => speakWordSlowly(item.word)}
                      className="p-1 rounded-md text-amber-700 hover:bg-amber-100 transition-colors"
                      title="Pronounce word"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                    {item.mastered && (
                      <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2 py-0.5 rounded-full border border-emerald-300">
                        Mastered ⭐
                      </span>
                    )}
                  </div>
                  <div className="text-xs font-mono text-slate-500 mt-0.5">
                    Syllables: {item.phoneticOrSyllables}
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {!item.mastered && (
                    <button
                      onClick={() => onMarkMastered(item.id)}
                      className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 border border-emerald-200 transition-colors"
                      title="Mark as Mastered"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => onDeleteWord(item.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors"
                    title="Remove from Honey Jar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 mb-3 bg-amber-50/50 p-2.5 rounded-xl border border-amber-100/60">
                "{item.statement}"
              </p>

              {item.memoryTip && (
                <div className="text-xs text-amber-900 bg-amber-100/60 p-2 rounded-lg border border-amber-200 mb-3">
                  <span className="font-bold">💡 Memory Trick: </span>
                  <span>{item.memoryTip}</span>
                </div>
              )}

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100">
                <span className="capitalize">{item.difficulty} Bee Tier</span>
                <span>Missed {item.timesMissed} {item.timesMissed === 1 ? 'time' : 'times'}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
