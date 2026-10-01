import React from 'react';
import { ActiveView, PlayerProfile } from '../types';
import { Volume2, VolumeX, Sparkles, Trophy, BookOpen, HeartHandshake } from 'lucide-react';
import { BeeAvatar } from './BeeAvatar';

interface NavbarProps {
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  profile: PlayerProfile;
  isMuted: boolean;
  onToggleSound: () => void;
  onOpenNewGameModal: () => void;
  missedCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeView,
  setActiveView,
  profile,
  isMuted,
  onToggleSound,
  onOpenNewGameModal,
  missedCount,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-amber-200/80 shadow-xs px-4 sm:px-8 py-3.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Zone 1: Brand Title (One line, characterful display font) */}
        <button
          onClick={() => setActiveView('arena')}
          className="flex items-center gap-2.5 text-left group focus-visible:outline-amber-500 rounded-lg"
          title="Return to Arena"
        >
          <div className="w-9 h-9 rounded-xl bg-amber-400 flex items-center justify-center shadow-xs text-amber-950 font-bold group-hover:rotate-6 transition-transform">
            🐝
          </div>
          <span className="font-display font-bold text-xl sm:text-2xl text-slate-900 tracking-tight whitespace-nowrap">
            SpellBee <span className="text-amber-600 font-semibold">Junior</span>
          </span>
        </button>

        {/* Zone 2: Navigation Links (Clean single-line labels) */}
        <nav className="hidden md:flex items-center gap-1 sm:gap-2 bg-amber-50/70 p-1 rounded-xl border border-amber-200/60">
          <button
            onClick={() => setActiveView('arena')}
            className={`px-3.5 py-1.5 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
              activeView === 'arena'
                ? 'bg-amber-400 text-amber-950 font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-amber-100/50'
            }`}
          >
            Timed Arena
          </button>

          <button
            onClick={() => setActiveView('clinic')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
              activeView === 'clinic'
                ? 'bg-amber-400 text-amber-950 font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-amber-100/50'
            }`}
          >
            <span>Honey Jar Clinic</span>
            {missedCount > 0 && (
              <span className="inline-flex items-center justify-center px-1.5 py-0.2 text-[11px] font-bold bg-rose-500 text-white rounded-full">
                {missedCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveView('dashboard')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
              activeView === 'dashboard'
                ? 'bg-amber-400 text-amber-950 font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-amber-100/50'
            }`}
          >
            <Trophy className="w-4 h-4 text-amber-600" />
            <span>Progress & Badges</span>
          </button>

          <button
            onClick={() => setActiveView('wordbank')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
              activeView === 'wordbank'
                ? 'bg-amber-400 text-amber-950 font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-amber-100/50'
            }`}
          >
            <BookOpen className="w-4 h-4 text-amber-600" />
            <span>Word Bank</span>
          </button>
        </nav>

        {/* Zone 3: Primary Actions (Honey Pots, Sound Toggle, Start Game / Profile) */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Honey Pots Counter */}
          <div
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-100/80 border border-amber-200 text-amber-950 text-xs sm:text-sm font-bold tabular-nums"
            title="Golden Honey Pots collected from right answers!"
          >
            <span className="text-base">🍯</span>
            <span>{profile.honeyPots}</span>
          </div>

          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            aria-label={isMuted ? 'Unmute sounds' : 'Mute sounds'}
            className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-amber-100/60 transition-colors"
            title={isMuted ? 'Sound effects muted' : 'Sound effects on'}
          >
            {isMuted ? <VolumeX className="w-5 h-5 text-slate-400" /> : <Volume2 className="w-5 h-5 text-amber-600" />}
          </button>

          {/* Start New Round CTA */}
          <button
            onClick={onOpenNewGameModal}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-bold text-amber-950 bg-linear-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-400 border border-amber-400 rounded-xl shadow-xs transition-all transform active:scale-95 whitespace-nowrap"
          >
            <Sparkles className="w-4 h-4 text-amber-800" />
            <span>New Round</span>
          </button>

          {/* Child Profile Avatar Icon */}
          <button
            onClick={() => setActiveView('settings')}
            className="p-0.5 rounded-xl hover:ring-2 hover:ring-amber-400 transition-all shrink-0"
            title={`Child Profile: ${profile.name}`}
          >
            <BeeAvatar avatarId={profile.avatar} size="sm" />
          </button>
        </div>
      </div>

      {/* Mobile Secondary Navigation Row */}
      <div className="flex md:hidden items-center justify-around pt-2.5 mt-2 border-t border-amber-100 text-xs font-semibold text-slate-600">
        <button
          onClick={() => setActiveView('arena')}
          className={`py-1 px-2 rounded-md ${activeView === 'arena' ? 'text-amber-800 bg-amber-100 font-bold' : ''}`}
        >
          Arena
        </button>
        <button
          onClick={() => setActiveView('clinic')}
          className={`py-1 px-2 rounded-md relative ${activeView === 'clinic' ? 'text-amber-800 bg-amber-100 font-bold' : ''}`}
        >
          Honey Jar
          {missedCount > 0 && (
            <span className="ml-1 px-1 py-0.2 bg-rose-500 text-white text-[10px] rounded-full">
              {missedCount}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveView('dashboard')}
          className={`py-1 px-2 rounded-md ${activeView === 'dashboard' ? 'text-amber-800 bg-amber-100 font-bold' : ''}`}
        >
          Progress
        </button>
        <button
          onClick={() => setActiveView('wordbank')}
          className={`py-1 px-2 rounded-md ${activeView === 'wordbank' ? 'text-amber-800 bg-amber-100 font-bold' : ''}`}
        >
          Words
        </button>
      </div>
    </header>
  );
};
