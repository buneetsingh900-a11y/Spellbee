import { PlayerProfile, RoundResult, MissedWordItem, Question, QuestionAnswerRecord } from '../types';
import { INITIAL_QUESTIONS } from '../data/questions';

const PROFILE_KEY = 'spellbee_player_profile';
const ROUNDS_KEY = 'spellbee_rounds_history';
const MISSED_WORDS_KEY = 'spellbee_missed_words';
const CUSTOM_QUESTIONS_KEY = 'spellbee_custom_questions';
const AUDIO_LISTEN_COUNT_KEY = 'spellbee_audio_listen_count';

export const DEFAULT_PROFILE: PlayerProfile = {
  id: 'player-1',
  name: 'Buzz Champion',
  avatar: 'bee-worker',
  honeyPots: 20,
  level: 1,
  totalRounds: 0,
  totalQuestionsAnswered: 0,
  totalCorrect: 0,
  bestStreak: 0,
  totalTimeSpentSeconds: 0,
  unlockedBadgeIds: [],
  createdAt: Date.now(),
};

export function loadPlayerProfile(): PlayerProfile {
  if (typeof window === 'undefined') return DEFAULT_PROFILE;
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) return DEFAULT_PROFILE;
    return { ...DEFAULT_PROFILE, ...JSON.parse(raw) };
  } catch (e) {
    console.error('Failed to load profile', e);
    return DEFAULT_PROFILE;
  }
}

export function savePlayerProfile(profile: PlayerProfile): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch (e) {
    console.error('Failed to save profile', e);
  }
}

export function loadRoundsHistory(): RoundResult[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(ROUNDS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Failed to load rounds', e);
    return [];
  }
}

export function saveRoundResult(result: RoundResult): RoundResult[] {
  if (typeof window === 'undefined') return [];
  try {
    const existing = loadRoundsHistory();
    const updated = [result, ...existing].slice(0, 50); // Keep last 50 rounds
    localStorage.setItem(ROUNDS_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('Failed to save round', e);
    return [];
  }
}

export function loadMissedWords(): MissedWordItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(MISSED_WORDS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Failed to load missed words', e);
    return [];
  }
}

export function saveMissedWords(words: MissedWordItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(MISSED_WORDS_KEY, JSON.stringify(words));
  } catch (e) {
    console.error('Failed to save missed words', e);
  }
}

/**
 * Record wrong answers from a round into the Honey Jar (missed words)
 */
export function recordMissedAnswers(answers: QuestionAnswerRecord[], allQuestions: Question[]): void {
  const existing = loadMissedWords();
  const map = new Map<string, MissedWordItem>(existing.map((item) => [item.word.toLowerCase(), item]));

  answers.forEach((ans) => {
    if (!ans.isCorrect) {
      const q = allQuestions.find((item) => item.id === ans.questionId);
      const wordKey = ans.targetWord.toLowerCase();
      const existingItem = map.get(wordKey);

      if (existingItem) {
        existingItem.timesMissed += 1;
        existingItem.mastered = false;
        existingItem.lastMissedAt = Date.now();
      } else {
        map.set(wordKey, {
          id: `missed-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          word: ans.targetWord,
          statement: ans.statement,
          options: ans.options,
          correctIndex: ans.correctIndex,
          phoneticOrSyllables: ans.phoneticOrSyllables || q?.phoneticOrSyllables || ans.targetWord,
          memoryTip: ans.memoryTip || q?.memoryTip,
          difficulty: ans.difficulty,
          category: ans.category,
          timesMissed: 1,
          timesReviewed: 0,
          mastered: false,
          lastMissedAt: Date.now(),
        });
      }
    }
  });

  saveMissedWords(Array.from(map.values()));
}

export function markMissedWordMastered(wordId: string): MissedWordItem[] {
  const items = loadMissedWords();
  const updated = items.map((item) =>
    item.id === wordId ? { ...item, mastered: true, timesReviewed: item.timesReviewed + 1 } : item
  );
  saveMissedWords(updated);
  return updated;
}

export function deleteMissedWord(wordId: string): MissedWordItem[] {
  const items = loadMissedWords();
  const updated = items.filter((item) => item.id !== wordId);
  saveMissedWords(updated);
  return updated;
}

export function loadCustomQuestions(): Question[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(CUSTOM_QUESTIONS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveCustomQuestion(q: Question): Question[] {
  const existing = loadCustomQuestions();
  const updated = [q, ...existing];
  try {
    localStorage.setItem(CUSTOM_QUESTIONS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save custom question', e);
  }
  return updated;
}

export function deleteCustomQuestion(id: string): Question[] {
  const existing = loadCustomQuestions();
  const updated = existing.filter((q) => q.id !== id);
  try {
    localStorage.setItem(CUSTOM_QUESTIONS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to delete custom question', e);
  }
  return updated;
}

export function getAudioListenCount(): number {
  if (typeof window === 'undefined') return 0;
  try {
    return parseInt(localStorage.getItem(AUDIO_LISTEN_COUNT_KEY) || '0', 10);
  } catch {
    return 0;
  }
}

export function incrementAudioListenCount(): number {
  const curr = getAudioListenCount() + 1;
  try {
    localStorage.setItem(AUDIO_LISTEN_COUNT_KEY, curr.toString());
  } catch {
    // ignore
  }
  return curr;
}

/**
 * Combines built-in questions and custom questions
 */
export function getAllAvailableQuestions(): Question[] {
  const custom = loadCustomQuestions();
  return [...INITIAL_QUESTIONS, ...custom];
}

/**
 * Clear all progress (for parent/kid reset)
 */
export function resetAllData(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(PROFILE_KEY);
  localStorage.removeItem(ROUNDS_KEY);
  localStorage.removeItem(MISSED_WORDS_KEY);
  localStorage.removeItem(CUSTOM_QUESTIONS_KEY);
  localStorage.removeItem(AUDIO_LISTEN_COUNT_KEY);
}
