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
  icon: string; // nom d'icône Ionicons
};

export const STAT_ICONS: Record<StatKey, string> = {
  FOR: 'barbell',
  END: 'pulse',
  AGI: 'flash',
  MEN: 'sparkles',
  VIT: 'heart',
};

// Quêtes du jour : corps + esprit + santé.
export const DAILY_QUESTS: QuestTemplate[] = [
  { id: 'pushups', title: 'Pompes', target: 30, unit: 'reps', step: 5, xp: 20, stat: 'FOR', icon: 'barbell' },
  { id: 'squats', title: 'Squats', target: 40, unit: 'reps', step: 10, xp: 20, stat: 'FOR', icon: 'body' },
  { id: 'cardio', title: 'Marche ou course', target: 3, unit: 'km', step: 0.5, xp: 25, stat: 'END', icon: 'walk' },
  { id: 'stretch', title: 'Étirements', target: 10, unit: 'min', step: 5, xp: 15, stat: 'AGI', icon: 'accessibility' },
  { id: 'meditate', title: 'Méditation / respiration', target: 10, unit: 'min', step: 5, xp: 20, stat: 'MEN', icon: 'leaf' },
  { id: 'water', title: 'Boire de l’eau', target: 2, unit: 'L', step: 0.5, xp: 10, stat: 'VIT', icon: 'water' },
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
  icon: 'skull',
};
export const PENALTY_XP_LOSS = 50;

export type PortalRank = 'E' | 'D' | 'C' | 'B' | 'A' | 'S';

export type Portal = {
  id: string;
  name: string;
  tier: PortalRank;
  description: string;
  durationDays: number;
  xp: number;
  stat: StatKey;
  statGain: number;
  minLevel: number;
};

// Les "portails" : défis plus longs avec une limite de temps.
export const PORTALS: Portal[] = [
  { id: 'p1', name: 'Portail de la Vigilance', tier: 'E', description: '3 jours de suite : se coucher avant 23 h et dormir au moins 7 h.', durationDays: 3, xp: 120, stat: 'VIT', statGain: 2, minLevel: 1 },
  { id: 'p2', name: 'Portail du Centenaire', tier: 'E', description: '100 pompes en une seule journée.', durationDays: 1, xp: 100, stat: 'FOR', statGain: 2, minLevel: 1 },
  { id: 'p3', name: 'Portail du Silence', tier: 'D', description: 'Pendant 5 jours : aucun réseau social avant midi.', durationDays: 5, xp: 200, stat: 'MEN', statGain: 3, minLevel: 3 },
  { id: 'p4', name: 'Portail des Dix Mille', tier: 'D', description: '10 000 pas par jour pendant 5 jours.', durationDays: 5, xp: 220, stat: 'END', statGain: 3, minLevel: 3 },
  { id: 'p5', name: 'Portail du Sucre Brisé', tier: 'C', description: '7 jours sans sucre ajouté ni soda.', durationDays: 7, xp: 350, stat: 'VIT', statGain: 4, minLevel: 5 },
  { id: 'p6', name: 'Portail du Fer', tier: 'B', description: 'Pendant 10 jours d’affilée : 1 min de gainage et 50 squats sautés.', durationDays: 10, xp: 500, stat: 'FOR', statGain: 5, minLevel: 8 },
  { id: 'p7', name: 'Portail de l’Aube', tier: 'A', description: 'Pendant 14 jours : lever à 6 h, sport, puis 10 min d’écriture dans un journal.', durationDays: 14, xp: 900, stat: 'MEN', statGain: 8, minLevel: 12 },
  { id: 'p8', name: 'Portail du Titan', tier: 'S', description: '30 jours sans manquer une seule quête journalière.', durationDays: 30, xp: 2000, stat: 'END', statGain: 15, minLevel: 20 },
];

// Rangs du joueur, du plus faible (E) au plus fort (S), puis l'ultime : rang Nation.
export const RANKS = [
  { minLevel: 1, name: 'Rang E' },
  { minLevel: 5, name: 'Rang D' },
  { minLevel: 10, name: 'Rang C' },
  { minLevel: 18, name: 'Rang B' },
  { minLevel: 28, name: 'Rang A' },
  { minLevel: 40, name: 'Rang S' },
  { minLevel: 60, name: 'Rang Nation' },
];

// Accorde un mot au pluriel : plural(2, 'quête') → « 2 quêtes ».
export const plural = (n: number, word: string, pluralWord = word + 's') =>
  `${n} ${Math.abs(n) >= 2 ? pluralWord : word}`;

export const xpForLevel = (level: number) => 100 + (level - 1) * 50;
export const rankFor = (level: number) =>
  [...RANKS].reverse().find((r) => level >= r.minLevel)!.name;
