import React, { useState } from 'react';
import { PlayerProfile } from '../types';
import { AVATAR_OPTIONS, BeeAvatar } from './BeeAvatar';
import { User, Volume2, Sparkles, RotateCcw, ShieldAlert, Check } from 'lucide-react';

interface ProfileSettingsProps {
  profile: PlayerProfile;
  onUpdateProfile: (updated: Partial<PlayerProfile>) => void;
  onResetAllData: () => void;
  isMuted: boolean;
  onToggleSound: () => void;
}

export const ProfileSettings: React.FC<ProfileSettingsProps> = ({
  profile,
  onUpdateProfile,
  onResetAllData,
  isMuted,
  onToggleSound,
}) => {
  const [name, setName] = useState(profile.name);
  const [selectedAvatar, setSelectedAvatar] = useState(profile.avatar);
  const [isSaved, setIsSaved] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      name: name.trim() || 'Spelling Champion',
      avatar: selectedAvatar,
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-amber-200 shadow-sm">
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-slate-900 tracking-tight mb-2">
          Player Profile & Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mb-8">
          Personalize your bee speller identity, avatar, sound preferences, and learning data.
        </p>

        <form onSubmit={handleSave} className="space-y-6">
          {/* Child Name */}
          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-2">
              Child / Speller Name
            </label>
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={30}
                placeholder="e.g. Leo the Bee"
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:border-amber-400 focus:ring-2 focus:ring-amber-200"
              />
            </div>
          </div>

          {/* Avatar Choice */}
          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-3">
              Choose Your Bee Mascot Avatar
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {AVATAR_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setSelectedAvatar(opt.id)}
                  className={`p-3 rounded-2xl border flex flex-col items-center text-center transition-all ${
                    selectedAvatar === opt.id
                      ? 'bg-amber-100 border-amber-400 ring-2 ring-amber-300 shadow-xs'
                      : 'bg-slate-50/70 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <BeeAvatar avatarId={opt.id} size="md" className="mb-2" />
                  <span className="font-display font-bold text-xs text-slate-900 block truncate w-full">
                    {opt.name}
                  </span>
                  <span className="text-[10px] text-slate-500 font-normal line-clamp-1">
                    {opt.role}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Sound Preferences */}
          <div className="pt-4 border-t border-slate-100">
            <h3 className="text-sm font-semibold text-slate-800 mb-3">Game Audio Settings</h3>
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-amber-50/60 border border-amber-200/80">
              <div className="flex items-center gap-2.5">
                <Volume2 className="w-5 h-5 text-amber-600" />
                <div>
                  <div className="font-semibold text-xs sm:text-sm text-slate-900">
                    Sound Effects & Fanfares
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Web Audio synthesized chimes on correct choices and countdown ticks
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={onToggleSound}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  isMuted
                    ? 'bg-slate-200 text-slate-700'
                    : 'bg-amber-400 text-amber-950 font-bold shadow-xs'
                }`}
              >
                {isMuted ? 'Muted' : 'Sound On'}
              </button>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            {isSaved && (
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1.5 animate-in fade-in">
                <Check className="w-4 h-4" /> Profile Updated!
              </span>
            )}
            <div className="ml-auto">
              <button
                type="submit"
                className="px-6 py-2.5 bg-amber-400 hover:bg-amber-300 text-amber-950 font-bold rounded-xl shadow-xs transition-transform active:scale-95 text-sm"
              >
                Save Profile
              </button>
            </div>
          </div>
        </form>

        {/* Reset Progress Section (Parents / Re-start) */}
        <div className="mt-12 pt-6 border-t border-rose-100">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-display font-bold text-sm text-rose-900 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-rose-500" />
                <span>Parental Reset Zone</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Clear all rounds history, honey jar missed words, and custom question cards.
              </p>
            </div>

            {!showResetConfirm ? (
              <button
                type="button"
                onClick={() => setShowResetConfirm(true)}
                className="px-3.5 py-1.5 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 font-semibold text-xs transition-colors shrink-0"
              >
                Reset Progress
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onResetAllData();
                    setShowResetConfirm(false);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs"
                >
                  Confirm Reset
                </button>
                <button
                  type="button"
                  onClick={() => setShowResetConfirm(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
