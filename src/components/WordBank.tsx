import React, { useState } from 'react';
import { Question, DifficultyLevel, QuestionCategory } from '../types';
import {
  Search,
  Plus,
  Volume2,
  Trash2,
  BookOpen,
  Sparkles,
  Check,
  X,
} from 'lucide-react';
import { speakWordSlowly } from '../utils/audio';

interface WordBankProps {
  questions: Question[];
  onAddCustomQuestion: (q: Question) => void;
  onDeleteCustomQuestion: (id: string) => void;
}

export const WordBank: React.FC<WordBankProps> = ({
  questions,
  onAddCustomQuestion,
  onDeleteCustomQuestion,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [tierFilter, setTierFilter] = useState<'all' | DifficultyLevel>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Custom Question Form state
  const [formStatement, setFormStatement] = useState('');
  const [formTargetWord, setFormTargetWord] = useState('');
  const [formOptionA, setFormOptionA] = useState('');
  const [formOptionB, setFormOptionB] = useState('');
  const [formOptionC, setFormOptionC] = useState('');
  const [formOptionD, setFormOptionD] = useState('');
  const [formCorrectIndex, setFormCorrectIndex] = useState(0);
  const [formSyllables, setFormSyllables] = useState('');
  const [formMemoryTip, setFormMemoryTip] = useState('');
  const [formDifficulty, setFormDifficulty] = useState<DifficultyLevel>('junior');

  const filtered = questions.filter((q) => {
    const matchesSearch =
      q.targetWord.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.statement.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTier = tierFilter === 'all' || q.difficulty === tierFilter;
    return matchesSearch && matchesTier;
  });

  const handleSaveCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formStatement || !formTargetWord || !formOptionA || !formOptionB) return;

    const options: [string, string, string, string] = [
      formOptionA.trim(),
      formOptionB.trim(),
      formOptionC.trim() || 'Option 3',
      formOptionD.trim() || 'Option 4',
    ];

    const newQ: Question = {
      id: `custom-${Date.now()}`,
      statement: formStatement.trim(),
      targetWord: formTargetWord.trim(),
      options,
      correctIndex: formCorrectIndex,
      definitionOrClue: `Spelling word: ${formTargetWord}`,
      phoneticOrSyllables: formSyllables.trim() || formTargetWord.trim(),
      memoryTip: formMemoryTip.trim() || undefined,
      difficulty: formDifficulty,
      category: 'fill-blank',
      categoryLabel: 'Custom List',
    };

    onAddCustomQuestion(newQ);
    setIsAddModalOpen(false);

    // Reset form
    setFormStatement('');
    setFormTargetWord('');
    setFormOptionA('');
    setFormOptionB('');
    setFormOptionC('');
    setFormOptionD('');
    setFormSyllables('');
    setFormMemoryTip('');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-slate-900 tracking-tight flex items-center gap-2.5">
            <BookOpen className="w-7 h-7 text-amber-500" />
            <span>Spelling Word Library</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Browse all {questions.length} active words or add custom spelling lists for school tests.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-amber-950 font-bold rounded-xl shadow-xs transition-all transform active:scale-95 text-xs sm:text-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add Custom Word</span>
        </button>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row items-center gap-3 mb-6">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search word or statement..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm focus:outline-hidden focus:border-amber-400 focus:ring-2 focus:ring-amber-200"
          />
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-amber-50/80 rounded-xl border border-amber-200 w-full sm:w-auto overflow-x-auto">
          {[
            { id: 'all', label: 'All Tiers' },
            { id: 'junior', label: 'Junior' },
            { id: 'champ', label: 'Champ' },
            { id: 'grand', label: 'Grand' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTierFilter(t.id as 'all' | DifficultyLevel)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                tierFilter === t.id
                  ? 'bg-amber-400 text-amber-950 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Words Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((q) => {
          const isCustom = q.id.startsWith('custom-');

          return (
            <div
              key={q.id}
              className="bg-white rounded-2xl p-5 border border-amber-200/80 shadow-xs flex flex-col justify-between hover:border-amber-300 transition-all"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-display font-bold text-lg text-slate-900">
                      {q.targetWord}
                    </span>
                    <button
                      onClick={() => speakWordSlowly(q.targetWord)}
                      className="p-1 rounded-md text-amber-700 hover:bg-amber-100 transition-colors"
                      title="Pronounce word"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 capitalize">
                      {q.difficulty}
                    </span>
                    {isCustom && (
                      <button
                        onClick={() => onDeleteCustomQuestion(q.id)}
                        className="p-1 text-slate-400 hover:text-rose-500 rounded"
                        title="Delete custom word"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="text-xs font-mono text-slate-500 mb-2.5">
                  Syllables: {q.phoneticOrSyllables}
                </div>

                <p className="text-xs text-slate-600 line-clamp-2 mb-3 bg-amber-50/40 p-2 rounded-lg">
                  {q.statement}
                </p>

                {q.memoryTip && (
                  <p className="text-[11px] text-amber-900 italic mb-2">
                    💡 {q.memoryTip}
                  </p>
                )}
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span>{q.categoryLabel}</span>
                <span className="font-bold text-emerald-600">
                  Answer: {q.options[q.correctIndex]}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Custom Question Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 border border-amber-200 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
              <h2 className="font-display font-bold text-xl text-slate-900">
                Add Custom Spelling Statement
              </h2>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-full hover:bg-slate-100 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCustom} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Target Word (The word child must spell correctly)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. dolphin"
                  value={formTargetWord}
                  onChange={(e) => setFormTargetWord(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-amber-400 focus:ring-1 focus:ring-amber-300"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Statement (Use "_____" where the word fits)
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="e.g. The playful _____ leaped out of the sparkling ocean waves."
                  value={formStatement}
                  onChange={(e) => setFormStatement(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-amber-400 focus:ring-1 focus:ring-amber-300"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  4 Choice Options (Check the radio button for the correct one)
                </label>
                <div className="space-y-2">
                  {[
                    { val: formOptionA, setVal: setFormOptionA, idx: 0, placeholder: 'Option A (e.g. dolphin)' },
                    { val: formOptionB, setVal: setFormOptionB, idx: 1, placeholder: 'Option B (e.g. dolfin)' },
                    { val: formOptionC, setVal: setFormOptionC, idx: 2, placeholder: 'Option C (e.g. dolphen)' },
                    { val: formOptionD, setVal: setFormOptionD, idx: 3, placeholder: 'Option D (e.g. dolphine)' },
                  ].map((opt) => (
                    <div key={opt.idx} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="correctOpt"
                        checked={formCorrectIndex === opt.idx}
                        onChange={() => setFormCorrectIndex(opt.idx)}
                        className="w-4 h-4 text-amber-500 focus:ring-amber-400 cursor-pointer"
                        title="Mark as correct answer"
                      />
                      <input
                        type="text"
                        required={opt.idx < 2}
                        placeholder={opt.placeholder}
                        value={opt.val}
                        onChange={(e) => opt.setVal(e.target.value)}
                        className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 focus:border-amber-400 text-xs sm:text-sm"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Syllables (e.g. dol·phin)
                  </label>
                  <input
                    type="text"
                    placeholder="dol·phin"
                    value={formSyllables}
                    onChange={(e) => setFormSyllables(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Difficulty Tier
                  </label>
                  <select
                    value={formDifficulty}
                    onChange={(e) => setFormDifficulty(e.target.value as DifficultyLevel)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 capitalize"
                  >
                    <option value="junior">Junior Bee (6-8)</option>
                    <option value="champ">Champ Bee (9-11)</option>
                    <option value="grand">Grand Bee (12+)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Memory Trick / Hint (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Uses 'ph' for the f sound!"
                  value={formMemoryTip}
                  onChange={(e) => setFormMemoryTip(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-400 hover:bg-amber-300 text-amber-950 font-bold rounded-xl shadow-xs"
                >
                  Save Word to Bank
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
