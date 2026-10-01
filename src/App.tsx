import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  ActiveView,
  Question,
  RoundConfig,
  RoundResult,
  PlayerProfile,
  MissedWordItem,
  Badge,
  DifficultyLevel,
} from './types';
import {
  loadPlayerProfile,
  savePlayerProfile,
  loadRoundsHistory,
  saveRoundResult,
  loadMissedWords,
  saveMissedWords,
  recordMissedAnswers,
  markMissedWordMastered,
  deleteMissedWord,
  getAllAvailableQuestions,
  saveCustomQuestion,
  deleteCustomQuestion,
  resetAllData,
  incrementAudioListenCount,
  getAudioListenCount,
} from './utils/storage';
import { isSoundMuted, setSoundMuted } from './utils/audio';
import { checkNewBadges } from './data/badges';
import { Navbar } from './components/Navbar';
import { Arena } from './components/Arena';
import { RoundSummary } from './components/RoundSummary';
import { Dashboard } from './components/Dashboard';
import { PracticeClinic } from './components/PracticeClinic';
import { WordBank } from './components/WordBank';
import { ProfileSettings } from './components/ProfileSettings';
import { SetupModal } from './components/SetupModal';
import { BeeAvatar } from './components/BeeAvatar';
import {
  Sparkles,
  Play,
  Flame,
  Award,
  BookOpen,
  ArrowRight,
  Volume2,
  Clock,
  Shield,
  Layers,
} from 'lucide-react';

export default function App() {
  const [activeView, setActiveView] = useState<ActiveView>('arena');
  const [profile, setProfile] = useState<PlayerProfile>(() => loadPlayerProfile());
  const [rounds, setRounds] = useState<RoundResult[]>(() => loadRoundsHistory());
  const [missedWords, setMissedWords] = useState<MissedWordItem[]>(() => loadMissedWords());
  const [questions, setQuestions] = useState<Question[]>(() => getAllAvailableQuestions());
  const [isMuted, setIsMuted] = useState<boolean>(() => isSoundMuted());
  const [isSetupModalOpen, setIsSetupModalOpen] = useState(false);

  // Active Game State
  const [isGameActive, setIsGameActive] = useState(false);
  const [activeRoundQuestions, setActiveRoundQuestions] = useState<Question[]>([]);
  const [currentRoundConfig, setCurrentRoundConfig] = useState<RoundConfig>({
    questionCount: 10,
    difficulty: 'junior',
    timerSeconds: 30,
    category: 'all',
    autoSpeak: true,
    autoAdvance: false,
  });

  // Summary State
  const [latestRoundResult, setLatestRoundResult] = useState<RoundResult | null>(null);
  const [newlyUnlockedBadges, setNewlyUnlockedBadges] = useState<Badge[]>([]);

  // Sound toggle handler
  const handleToggleSound = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    setSoundMuted(nextMuted);
  };

  // Seed demo data if brand new user has no rounds, so the dashboard looks vibrant right away
  useEffect(() => {
    if (rounds.length === 0 && profile.totalRounds === 0) {
      // First turn experience: provide a welcoming starting profile
      const seededProfile: PlayerProfile = {
        ...profile,
        honeyPots: 15,
        level: 1,
      };
      setProfile(seededProfile);
      savePlayerProfile(seededProfile);
    }
  }, [rounds.length, profile]);

  // Start a new configured round
  const handleStartRound = useCallback(
    (config: RoundConfig) => {
      setCurrentRoundConfig(config);

      // Filter question pool
      let eligible = [...questions];
      if (config.difficulty !== 'all') {
        eligible = eligible.filter((q) => q.difficulty === config.difficulty);
      }
      if (config.category !== 'all') {
        eligible = eligible.filter((q) => q.category === config.category);
      }

      // If pool is empty or small, fallback to all questions
      if (eligible.length === 0) {
        eligible = [...questions];
      }

      // Shuffle using Fisher-Yates
      const shuffled = [...eligible];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }

      const selected = shuffled.slice(0, Math.min(config.questionCount, shuffled.length));

      setActiveRoundQuestions(selected);
      setIsGameActive(true);
      setActiveView('arena');
    },
    [questions]
  );

  // Start targeted practice quiz from Honey Jar missed words
  const handleStartPracticeRound = (wordsToPractice: MissedWordItem[]) => {
    if (wordsToPractice.length === 0) return;

    // Convert missed words into question format
    const practiceQuestions: Question[] = wordsToPractice.map((w, i) => ({
      id: `practice-${w.id}-${i}`,
      statement: w.statement,
      options: w.options,
      correctIndex: w.correctIndex,
      targetWord: w.word,
      definitionOrClue: `Practice word: ${w.word}`,
      phoneticOrSyllables: w.phoneticOrSyllables,
      memoryTip: w.memoryTip,
      difficulty: w.difficulty,
      category: w.category,
      categoryLabel: 'Honey Jar Practice',
    }));

    // Shuffle practice words
    for (let i = practiceQuestions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [practiceQuestions[i], practiceQuestions[j]] = [
        practiceQuestions[j],
        practiceQuestions[i],
      ];
    }

    const practiceConfig: RoundConfig = {
      questionCount: practiceQuestions.length,
      difficulty: 'all',
      timerSeconds: 0, // untimed relaxed for practice clinic
      category: 'all',
      autoSpeak: true,
      autoAdvance: false,
    };

    setCurrentRoundConfig(practiceConfig);
    setActiveRoundQuestions(practiceQuestions);
    setIsGameActive(true);
    setActiveView('arena');
  };

  // Complete a game round
  const handleFinishRound = (result: RoundResult) => {
    setIsGameActive(false);

    // Save round in history
    const updatedRounds = saveRoundResult(result);
    setRounds(updatedRounds);

    // Record missed words into Honey Jar
    recordMissedAnswers(result.answers, questions);
    setMissedWords(loadMissedWords());

    // Update Player Profile stats
    const totalCorrect = profile.totalCorrect + result.score;
    const totalQuestions = profile.totalQuestionsAnswered + result.totalQuestions;
    const honeyPots = profile.honeyPots + result.honeyPotsEarned;
    const bestStreak = Math.max(profile.bestStreak, result.streakMax);
    const totalRounds = profile.totalRounds + 1;
    const level = Math.floor(honeyPots / 30) + 1;
    const totalTime = profile.totalTimeSpentSeconds + result.durationSeconds;

    const audioListenCount = getAudioListenCount();
    const masteredWordsCount = missedWords.filter((w) => w.mastered).length;

    const updatedProfile: PlayerProfile = {
      ...profile,
      totalCorrect,
      totalQuestionsAnswered: totalQuestions,
      honeyPots,
      bestStreak,
      totalRounds,
      level,
      totalTimeSpentSeconds: totalTime,
    };

    // Evaluate badges
    const newBadges = checkNewBadges(
      updatedProfile,
      result,
      audioListenCount,
      masteredWordsCount
    );

    if (newBadges.length > 0) {
      const allUnlockedIds = Array.from(
        new Set([...(profile.unlockedBadgeIds || []), ...newBadges.map((b) => b.id)])
      );
      updatedProfile.unlockedBadgeIds = allUnlockedIds;
    }

    setProfile(updatedProfile);
    savePlayerProfile(updatedProfile);

    // Set summary states
    setLatestRoundResult(result);
    setNewlyUnlockedBadges(newBadges);
    setActiveView('summary');
  };

  // Profile update
  const handleUpdateProfile = (updated: Partial<PlayerProfile>) => {
    const next = { ...profile, ...updated };
    setProfile(next);
    savePlayerProfile(next);
  };

  // Reset all data
  const handleResetAllData = () => {
    resetAllData();
    window.location.reload();
  };

  // Missed words actions
  const handleMarkMastered = (id: string) => {
    const updated = markMissedWordMastered(id);
    setMissedWords(updated);
    // Award 5 bonus honey pots for mastering a tricky word!
    const nextProf = { ...profile, honeyPots: profile.honeyPots + 5 };
    setProfile(nextProf);
    savePlayerProfile(nextProf);
  };

  const handleDeleteMissedWord = (id: string) => {
    const updated = deleteMissedWord(id);
    setMissedWords(updated);
  };

  // Custom question additions
  const handleAddCustomQuestion = (q: Question) => {
    saveCustomQuestion(q);
    setQuestions(getAllAvailableQuestions());
  };

  const handleDeleteCustomQuestion = (id: string) => {
    deleteCustomQuestion(id);
    setQuestions(getAllAvailableQuestions());
  };

  const missedCount = useMemo(() => missedWords.filter((w) => !w.mastered).length, [missedWords]);

  return (
    <div className="min-h-screen bg-[#FFFDF7] flex flex-col text-slate-800">
      {/* Top Bar Navigation Contract */}
      <Navbar
        activeView={activeView}
        setActiveView={(v) => {
          if (isGameActive && v !== 'arena') {
            if (window.confirm('Do you want to leave the active round?')) {
              setIsGameActive(false);
              setActiveView(v);
            }
          } else {
            setActiveView(v);
          }
        }}
        profile={profile}
        isMuted={isMuted}
        onToggleSound={handleToggleSound}
        onOpenNewGameModal={() => setIsSetupModalOpen(true)}
        missedCount={missedCount}
      />

      {/* Main Content View Switcher */}
      <main className="flex-1 pb-16">
        {activeView === 'arena' && isGameActive && (
          <Arena
            questions={activeRoundQuestions}
            config={currentRoundConfig}
            onFinishRound={handleFinishRound}
            onExitRound={() => setIsGameActive(false)}
            onIncrementAudioCount={incrementAudioListenCount}
          />
        )}

        {activeView === 'arena' && !isGameActive && (
          /* Arena Home Launcher */
          <div className="max-w-5xl mx-auto px-4 py-8 sm:py-12 animate-in fade-in duration-300">
            {/* Hero Card */}
            <div className="bg-linear-to-b from-amber-200/60 via-amber-100/40 to-white rounded-3xl p-6 sm:p-12 border border-amber-300/80 shadow-sm text-center relative overflow-hidden mb-8">
              <div className="max-w-2xl mx-auto">
                {/* Floating Bee Mascot */}
                <div className="flex justify-center mb-4">
                  <BeeAvatar
                    avatarId={profile.avatar}
                    size="xl"
                    showAnimation={true}
                    className="shadow-md"
                  />
                </div>

                <h1 className="font-display font-bold text-3xl sm:text-5xl text-slate-900 tracking-tight mb-3">
                  Welcome to <span className="text-amber-600">SpellBee Junior!</span>
                </h1>

                <p className="text-sm sm:text-base text-slate-600 leading-relaxed mb-6">
                  Hear random statements, solve missing letters and sound-alike homophones, beat
                  the countdown timer, and collect golden honey pots!
                </p>

                {/* Primary Quick Start CTAs */}
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <button
                    onClick={() =>
                      handleStartRound({
                        questionCount: 10,
                        difficulty: 'junior',
                        timerSeconds: 30,
                        category: 'all',
                        autoSpeak: true,
                        autoAdvance: false,
                      })
                    }
                    className="flex items-center gap-2.5 px-6 py-3.5 bg-linear-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-amber-950 font-bold rounded-2xl shadow-md transition-all transform active:scale-95 text-base sm:text-lg"
                  >
                    <Play className="w-5 h-5 fill-amber-950" />
                    <span>Quick Play (10 Words)</span>
                  </button>

                  <button
                    onClick={() => setIsSetupModalOpen(true)}
                    className="flex items-center gap-2 px-5 py-3.5 bg-white hover:bg-amber-50 text-slate-700 font-bold rounded-2xl border border-amber-300 shadow-xs transition-colors text-sm sm:text-base"
                  >
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    <span>Customize Round</span>
                  </button>
                </div>
              </div>
            </div>

            {/* 3 Difficulty Tiers Cards */}
            <div className="mb-8">
              <h2 className="font-display font-bold text-xl text-slate-900 mb-4 flex items-center gap-2">
                <span>🐝</span>
                <span>Choose a Challenge Tier</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Junior Bee Card */}
                <div className="bg-white rounded-3xl p-6 border border-emerald-200 shadow-xs hover:border-emerald-400 transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-3xl">🌱</span>
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                        Ages 6-8 · Grades 1-2
                      </span>
                    </div>
                    <h3 className="font-display font-bold text-xl text-slate-900 mb-1">
                      Junior Bee
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500 mb-4 leading-relaxed">
                      Everyday words, clear phonics, compound words, and friendly context clues.
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      handleStartRound({
                        questionCount: 10,
                        difficulty: 'junior',
                        timerSeconds: 30,
                        category: 'all',
                        autoSpeak: true,
                        autoAdvance: false,
                      })
                    }
                    className="w-full py-2.5 px-4 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-bold rounded-xl border border-emerald-300 transition-colors text-xs sm:text-sm flex items-center justify-center gap-1.5"
                  >
                    <span>Play Junior Bee</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Champ Bee Card */}
                <div className="bg-white rounded-3xl p-6 border border-amber-200 shadow-xs hover:border-amber-400 transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-3xl">🚀</span>
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                        Ages 9-11 · Grades 3-5
                      </span>
                    </div>
                    <h3 className="font-display font-bold text-xl text-slate-900 mb-1">
                      Champ Bee
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500 mb-4 leading-relaxed">
                      Double consonants, silent vowels, scientific vocabulary, and sound-alikes.
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      handleStartRound({
                        questionCount: 10,
                        difficulty: 'champ',
                        timerSeconds: 25,
                        category: 'all',
                        autoSpeak: true,
                        autoAdvance: false,
                      })
                    }
                    className="w-full py-2.5 px-4 bg-amber-50 hover:bg-amber-100 text-amber-950 font-bold rounded-xl border border-amber-300 transition-colors text-xs sm:text-sm flex items-center justify-center gap-1.5"
                  >
                    <span>Play Champ Bee</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Grand Bee Card */}
                <div className="bg-white rounded-3xl p-6 border border-purple-200 shadow-xs hover:border-purple-400 transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-3xl">👑</span>
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-900 border border-purple-300">
                        Ages 12+ · Bee Masters
                      </span>
                    </div>
                    <h3 className="font-display font-bold text-xl text-slate-900 mb-1">
                      Grand Bee
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500 mb-4 leading-relaxed">
                      National competition-level words, French/Greek roots, and intricate spelling rules.
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      handleStartRound({
                        questionCount: 10,
                        difficulty: 'grand',
                        timerSeconds: 20,
                        category: 'all',
                        autoSpeak: true,
                        autoAdvance: false,
                      })
                    }
                    className="w-full py-2.5 px-4 bg-purple-50 hover:bg-purple-100 text-purple-900 font-bold rounded-xl border border-purple-300 transition-colors text-xs sm:text-sm flex items-center justify-center gap-1.5"
                  >
                    <span>Play Grand Bee</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Practice Banner if child has missed words */}
            {missedCount > 0 && (
              <div className="bg-linear-to-r from-amber-50 to-orange-50 rounded-2xl p-5 border border-amber-300 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-400 text-amber-950 font-bold flex items-center justify-center text-xl shrink-0">
                    🍯
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-slate-900 text-sm sm:text-base">
                      You have {missedCount} words in your Honey Jar
                    </h4>
                    <p className="text-xs text-slate-600">
                      Replay tricky words until you master them and earn bonus honey pots!
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleStartPracticeRound(missedWords.filter((w) => !w.mastered))}
                  className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-amber-950 font-bold rounded-xl text-xs sm:text-sm transition-all transform active:scale-95 shrink-0 shadow-xs"
                >
                  Start Practice Quiz ➔
                </button>
              </div>
            )}
          </div>
        )}

        {activeView === 'summary' && latestRoundResult && (
          <RoundSummary
            result={latestRoundResult}
            unlockedBadges={newlyUnlockedBadges}
            onPlayAgain={() => handleStartRound(currentRoundConfig)}
            onGoToDashboard={() => setActiveView('dashboard')}
            onGoToClinic={() => setActiveView('clinic')}
          />
        )}

        {activeView === 'dashboard' && (
          <Dashboard
            profile={profile}
            rounds={rounds}
            onStartNewRound={() => {
              setIsGameActive(false);
              setIsSetupModalOpen(true);
            }}
            onGoToClinic={() => setActiveView('clinic')}
          />
        )}

        {activeView === 'clinic' && (
          <PracticeClinic
            missedWords={missedWords}
            onStartPracticeRound={handleStartPracticeRound}
            onMarkMastered={handleMarkMastered}
            onDeleteWord={handleDeleteMissedWord}
          />
        )}

        {activeView === 'wordbank' && (
          <WordBank
            questions={questions}
            onAddCustomQuestion={handleAddCustomQuestion}
            onDeleteCustomQuestion={handleDeleteCustomQuestion}
          />
        )}

        {activeView === 'settings' && (
          <ProfileSettings
            profile={profile}
            onUpdateProfile={handleUpdateProfile}
            onResetAllData={handleResetAllData}
            isMuted={isMuted}
            onToggleSound={handleToggleSound}
          />
        )}
      </main>

      {/* Setup Round Modal */}
      <SetupModal
        isOpen={isSetupModalOpen}
        onClose={() => setIsSetupModalOpen(false)}
        onStartRound={handleStartRound}
        initialConfig={currentRoundConfig}
      />
    </div>
  );
}
