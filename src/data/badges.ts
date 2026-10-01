import { Badge, PlayerProfile, RoundResult } from '../types';

export const BADGE_DEFINITIONS: Badge[] = [
  {
    id: 'first-buzz',
    title: 'First Buzz',
    description: 'Completed your very first SpellBee round!',
    icon: '🐝',
    rarity: 'bronze',
  },
  {
    id: 'perfect-round',
    title: 'Perfect Hive',
    description: 'Achieved 100% accuracy in a complete round!',
    icon: '🏆',
    rarity: 'gold',
  },
  {
    id: 'speedy-stinger',
    title: 'Speedy Stinger',
    description: 'Answered a question correctly in under 4 seconds!',
    icon: '⚡',
    rarity: 'silver',
  },
  {
    id: 'streak-5',
    title: 'Five-in-a-Row',
    description: 'Answered 5 questions correctly in a row!',
    icon: '🔥',
    rarity: 'bronze',
  },
  {
    id: 'streak-10',
    title: 'Honeycomb Fire',
    description: 'Reached a super streak of 10 consecutive correct answers!',
    icon: '🌟',
    rarity: 'gold',
  },
  {
    id: 'junior-star',
    title: 'Junior Bee Star',
    description: 'Completed 3 Junior Bee challenges with great scores!',
    icon: '🌱',
    rarity: 'bronze',
  },
  {
    id: 'champ-explorer',
    title: 'Champ Explorer',
    description: 'Conquered words in the Champ Bee tier!',
    icon: '🚀',
    rarity: 'silver',
  },
  {
    id: 'grand-champion',
    title: 'Grand Master Bee',
    description: 'Scored 80% or higher in the Grand Bee competition!',
    icon: '👑',
    rarity: 'diamond',
  },
  {
    id: 'clinic-doctor',
    title: 'Spelling Doctor',
    description: 'Mastered 3 tricky words from the Honey Jar clinic!',
    icon: '🩹',
    rarity: 'silver',
  },
  {
    id: 'honey-hoarder',
    title: 'Honey Pot Tycoon',
    description: 'Gathered over 150 golden honey pots from quizzes!',
    icon: '🍯',
    rarity: 'silver',
  },
  {
    id: 'golden-ear',
    title: 'Pronouncer Friend',
    description: 'Listened to the Pronouncer Bee speak words 5 times!',
    icon: '🎧',
    rarity: 'bronze',
  },
  {
    id: 'century-club',
    title: 'Century Speller',
    description: 'Answered 50 questions correctly in total!',
    icon: '🎯',
    rarity: 'diamond',
  },
];

export function checkNewBadges(
  profile: PlayerProfile,
  latestRound: RoundResult,
  totalPronunciationsUsed: number,
  masteredWordsCount: number
): Badge[] {
  const newlyUnlocked: Badge[] = [];
  const currentUnlocked = new Set(profile.unlockedBadgeIds || []);

  const evaluateBadge = (badgeId: string, condition: boolean) => {
    if (!currentUnlocked.has(badgeId) && condition) {
      const badge = BADGE_DEFINITIONS.find((b) => b.id === badgeId);
      if (badge) {
        newlyUnlocked.push(badge);
      }
    }
  };

  evaluateBadge('first-buzz', profile.totalRounds >= 1);
  evaluateBadge('perfect-round', latestRound.accuracy === 100 && latestRound.totalQuestions >= 5);
  evaluateBadge(
    'speedy-stinger',
    latestRound.answers.some((a) => a.isCorrect && a.timeTakenSeconds <= 4)
  );
  evaluateBadge('streak-5', latestRound.streakMax >= 5 || profile.bestStreak >= 5);
  evaluateBadge('streak-10', latestRound.streakMax >= 10 || profile.bestStreak >= 10);
  evaluateBadge('junior-star', profile.totalRounds >= 3);
  evaluateBadge('champ-explorer', latestRound.difficulty === 'champ' && latestRound.accuracy >= 70);
  evaluateBadge('grand-champion', latestRound.difficulty === 'grand' && latestRound.accuracy >= 80);
  evaluateBadge('clinic-doctor', masteredWordsCount >= 3);
  evaluateBadge('honey-hoarder', profile.honeyPots >= 150);
  evaluateBadge('golden-ear', totalPronunciationsUsed >= 5);
  evaluateBadge('century-club', profile.totalCorrect >= 50);

  return newlyUnlocked;
}
