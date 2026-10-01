export type DifficultyLevel = 'junior' | 'champ' | 'grand';

export type QuestionCategory =
  | 'fill-blank'
  | 'correct-spelling'
  | 'spot-error'
  | 'homophone'
  | 'riddle';

export interface Question {
  id: string;
  statement: string; // The prompt statement, e.g. "The clever detective found a mysterious _____ in the library."
  options: [string, string, string, string]; // 4 distinct options
  correctIndex: number; // 0, 1, 2, or 3
  targetWord: string; // The correct word to learn
  definitionOrClue: string; // Explanatory clue or definition
  phoneticOrSyllables: string; // e.g. "mys·ter·y"
  memoryTip?: string; // e.g. "Remember: There's an 'eye' in mystery, but it's spelled with a 'y'!"
  difficulty: DifficultyLevel;
  category: QuestionCategory;
  categoryLabel: string;
}

export interface RoundConfig {
  questionCount: number; // 5, 10, 15, or 20
  difficulty: 'all' | DifficultyLevel;
  timerSeconds: number; // 0 for untimed, 15 for fast buzz, 30 for standard
  category: 'all' | QuestionCategory;
  autoSpeak: boolean; // whether to automatically pronounce statement when question loads
  autoAdvance: boolean; // whether to advance automatically after answer review
}

export interface QuestionAnswerRecord {
  questionId: string;
  statement: string;
  targetWord: string;
  options: [string, string, string, string];
  selectedIndex: number;
  correctIndex: number;
  isCorrect: boolean;
  timeTakenSeconds: number;
  difficulty: DifficultyLevel;
  category: QuestionCategory;
  phoneticOrSyllables: string;
  memoryTip?: string;
}

export interface RoundResult {
  id: string;
  timestamp: number;
  score: number;
  totalQuestions: number;
  accuracy: number; // 0 - 100
  durationSeconds: number;
  streakMax: number;
  difficulty: 'all' | DifficultyLevel;
  category: 'all' | QuestionCategory;
  honeyPotsEarned: number;
  answers: QuestionAnswerRecord[];
}

export interface MissedWordItem {
  id: string;
  word: string;
  statement: string;
  options: [string, string, string, string];
  correctIndex: number;
  phoneticOrSyllables: string;
  memoryTip?: string;
  difficulty: DifficultyLevel;
  category: QuestionCategory;
  timesMissed: number;
  timesReviewed: number;
  mastered: boolean;
  lastMissedAt: number;
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  rarity: 'bronze' | 'silver' | 'gold' | 'diamond';
  unlockedAt?: number;
}

export interface PlayerProfile {
  id: string;
  name: string;
  avatar: string; // avatar identifier, e.g. 'bee-worker', 'bee-queen', 'bee-detective', 'bee-astronaut'
  honeyPots: number; // game points/currency
  level: number;
  totalRounds: number;
  totalQuestionsAnswered: number;
  totalCorrect: number;
  bestStreak: number;
  totalTimeSpentSeconds: number;
  unlockedBadgeIds: string[];
  createdAt: number;
}

export type ActiveView = 'arena' | 'summary' | 'dashboard' | 'clinic' | 'wordbank' | 'settings';
