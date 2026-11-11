// Contenu du jeu : quêtes journalières, quêtes de pénalité et portails.

export type StatKey = 'FOR' | 'END' | 'AGI' | 'MEN' | 'VIT';

export const STAT_LABELS: Record<StatKey, string> = {
  FOR: 'Force',
  END: 'Endurance',
  AGI: 'Agilité',
  MEN: 'Mental',
  VIT: 'Vitalité',
};

export type QuestTemplate = {
  id: string;
  title: string;
  target: number;
  unit: string;
  step: number; // incrément du bouton +
  xp: number;
  stat: StatKey;
};

// Quêtes du jour : corps + esprit + santé.
export const DAILY_QUESTS: QuestTemplate[] = [
  { id: 'pushups', title: 'Pompes', target: 30, unit: 'reps', step: 5, xp: 20, stat: 'FOR' },
  { id: 'squats', title: 'Squats', target: 40, unit: 'reps', step: 10, xp: 20, stat: 'FOR' },
  { id: 'cardio', title: 'Marche ou course', target: 3, unit: 'km', step: 0.5, xp: 25, stat: 'END' },
  { id: 'stretch', title: 'Étirements', target: 10, unit: 'min', step: 5, xp: 15, stat: 'AGI' },
  { id: 'meditate', title: 'Méditation / respiration', target: 10, unit: 'min', step: 5, xp: 20, stat: 'MEN' },
  { id: 'water', title: "Boire de l'eau", target: 2, unit: 'L', step: 0.5, xp: 10, stat: 'VIT' },
];

// Quête imposée quand les quêtes du jour n'ont pas été terminées à temps.
export const PENALTY_QUEST: QuestTemplate = {
  id: 'penalty',
  title: 'Burpees de rattrapage',
  target: 50,
  unit: 'reps',
  step: 5,
  xp: 0,
  stat: 'END',
};
export const PENALTY_XP_LOSS = 50;

export type Portal = {
  id: string;
  name: string;
  tier: 'I' | 'II' | 'III' | 'IV' | 'V';
  description: string;
  durationDays: number;
  xp: number;
  stat: StatKey;
  statGain: number;
  minLevel: number;
};

// Les "portails" : défis plus longs avec une limite de temps.
export const PORTALS: Portal[] = [
  { id: 'p1', name: 'Portail de la Vigilance', tier: 'I', description: '3 jours de suite : coucher avant 23h et 7h de sommeil.', durationDays: 3, xp: 120, stat: 'VIT', statGain: 2, minLevel: 1 },
  { id: 'p2', name: 'Portail du Centenaire', tier: 'I', description: '100 pompes en une seule journée.', durationDays: 1, xp: 100, stat: 'FOR', statGain: 2, minLevel: 1 },
  { id: 'p3', name: 'Portail du Silence', tier: 'II', description: '5 jours sans réseaux sociaux avant midi.', durationDays: 5, xp: 200, stat: 'MEN', statGain: 3, minLevel: 3 },
  { id: 'p4', name: 'Portail des Dix Mille', tier: 'II', description: '10 000 pas par jour pendant 5 jours.', durationDays: 5, xp: 220, stat: 'END', statGain: 3, minLevel: 3 },
  { id: 'p5', name: 'Portail du Sucre Brisé', tier: 'III', description: '7 jours sans sucre ajouté ni soda.', durationDays: 7, xp: 350, stat: 'VIT', statGain: 4, minLevel: 5 },
  { id: 'p6', name: 'Portail du Fer', tier: 'IV', description: '1 min de gainage + 50 squats sautés, 10 jours d’affilée.', durationDays: 10, xp: 500, stat: 'FOR', statGain: 5, minLevel: 8 },
  { id: 'p7', name: 'Portail de l’Aube', tier: 'V', description: 'Lever à 6h, sport + 10 min de journal, 14 jours.', durationDays: 14, xp: 900, stat: 'MEN', statGain: 8, minLevel: 12 },
];

// Titres de rang, débloqués selon le niveau.
export const RANKS = [
  { minLevel: 1, name: 'Éveillé' },
  { minLevel: 5, name: 'Initié' },
  { minLevel: 10, name: 'Vétéran' },
  { minLevel: 20, name: 'Élite' },
  { minLevel: 35, name: 'Ascendant' },
];

export const xpForLevel = (level: number) => 100 + (level - 1) * 50;
export const rankFor = (level: number) =>
  [...RANKS].reverse().find((r) => level >= r.minLevel)!.name;
