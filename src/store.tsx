import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import {
  DAILY_QUESTS,
  PENALTY_QUEST,
  PENALTY_XP_LOSS,
  PORTALS,
  StatKey,
  xpForLevel,
} from './data';

const STORAGE_KEY = 'ascendant:v1';
const DAILY_BONUS_XP = 50;
const PORTAL_FAIL_XP_LOSS = 30;
const POINTS_PER_LEVEL = 3;

export type GameState = {
  name: string;
  level: number;
  xp: number;
  statPoints: number;
  stats: Record<StatKey, number>;
  day: string; // jour des quêtes en cours (AAAA-MM-JJ, heure locale)
  progress: Record<string, number>;
  dailyCleared: boolean;
  streak: number;
  bestStreak: number;
  penalty: { active: boolean; progress: number };
  activePortal: { id: string; endsAt: number } | null;
  clearedPortals: string[];
};

export const todayKey = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const initialState = (): GameState => ({
  name: 'Joueur',
  level: 1,
  xp: 0,
  statPoints: 0,
  stats: { FOR: 10, END: 10, AGI: 10, MEN: 10, VIT: 10 },
  day: todayKey(),
  progress: {},
  dailyCleared: false,
  streak: 0,
  bestStreak: 0,
  penalty: { active: false, progress: 0 },
  activePortal: null,
  clearedPortals: [],
});

export type Notice = { title: string; lines: string[]; tone: 'info' | 'success' | 'danger' };

// Ajoute de l'XP et gère les montées de niveau.
function gainXp(s: GameState, amount: number, notices: Notice[]): GameState {
  let { level, xp, statPoints } = s;
  const stats = { ...s.stats };
  xp += amount;
  let ups = 0;
  while (xp >= xpForLevel(level)) {
    xp -= xpForLevel(level);
    level += 1;
    statPoints += POINTS_PER_LEVEL;
    ups += 1;
    (Object.keys(stats) as StatKey[]).forEach((k) => (stats[k] += 1));
  }
  if (ups > 0) {
    notices.push({
      title: 'NIVEAU SUPÉRIEUR',
      lines: [`Tu passes au niveau ${level} !`, `+${ups * POINTS_PER_LEVEL} points de stats à répartir.`],
      tone: 'success',
    });
  }
  return { ...s, level, xp, statPoints, stats };
}

function loseXp(s: GameState, amount: number): GameState {
  return { ...s, xp: Math.max(0, s.xp - amount) };
}

// Vérifie le passage à un nouveau jour et l'expiration du portail.
function tick(s: GameState, notices: Notice[]): GameState {
  let next = s;
  const today = todayKey();
  if (next.day !== today) {
    if (!next.dailyCleared) {
      next = loseXp(next, PENALTY_XP_LOSS);
      next = { ...next, streak: 0, penalty: { active: true, progress: 0 } };
      notices.push({
        title: 'PÉNALITÉ',
        lines: [
          "Les quêtes du jour n'ont pas été terminées.",
          `-${PENALTY_XP_LOSS} XP. Série remise à zéro.`,
          `Termine "${PENALTY_QUEST.title}" pour débloquer les quêtes.`,
        ],
        tone: 'danger',
      });
    }
    next = { ...next, day: today, progress: {}, dailyCleared: false };
  }
  if (next.activePortal && Date.now() > next.activePortal.endsAt) {
    const portal = PORTALS.find((p) => p.id === next.activePortal!.id);
    next = loseXp({ ...next, activePortal: null }, PORTAL_FAIL_XP_LOSS);
    notices.push({
      title: 'PORTAIL FERMÉ',
      lines: [`${portal?.name ?? 'Portail'} : temps écoulé.`, `-${PORTAL_FAIL_XP_LOSS} XP.`],
      tone: 'danger',
    });
  }
  return next;
}

type Ctx = {
  state: GameState;
  ready: boolean;
  notice: Notice | null;
  dismissNotice: () => void;
  addProgress: (questId: string, delta: number) => void;
  addPenaltyProgress: (delta: number) => void;
  spendPoint: (stat: StatKey) => void;
  enterPortal: (id: string) => void;
  clearPortal: () => void;
  abandonPortal: () => void;
  setName: (name: string) => void;
  resetAll: () => void;
};

const GameContext = createContext<Ctx | null>(null);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<GameState>(initialState);
  const [ready, setReady] = useState(false);
  const [queue, setQueue] = useState<Notice[]>([]);
  const loaded = useRef(false);

  // Applique une transformation d'état qui peut produire des messages "système".
  const stateRef = useRef(state);
  const update = useCallback((fn: (s: GameState, notices: Notice[]) => GameState) => {
    const notices: Notice[] = [];
    const next = fn(stateRef.current, notices);
    if (next === stateRef.current) return;
    stateRef.current = next;
    setState(next);
    if (notices.length) setQueue((q) => [...q, ...notices]);
  }, []);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        const saved = raw ? { ...initialState(), ...JSON.parse(raw) } : initialState();
        update(() => saved);
        update(tick);
      })
      .finally(() => {
        loaded.current = true;
        setReady(true);
      });
    const id = setInterval(() => update(tick), 30_000);
    return () => clearInterval(id);
  }, [update]);

  useEffect(() => {
    if (loaded.current) AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch(() => {});
  }, [state]);

  const addProgress = (questId: string, delta: number) =>
    update((s, notices) => {
      if (s.penalty.active) return s;
      const quest = DAILY_QUESTS.find((q) => q.id === questId)!;
      const before = s.progress[questId] ?? 0;
      const after = Math.max(0, Math.min(quest.target, before + delta));
      let next: GameState = { ...s, progress: { ...s.progress, [questId]: after } };
      if (before < quest.target && after >= quest.target) {
        next = gainXp(next, quest.xp, notices);
      }
      const allDone = DAILY_QUESTS.every((q) => (next.progress[q.id] ?? 0) >= q.target);
      if (allDone && !next.dailyCleared) {
        const streak = next.streak + 1;
        next = { ...next, dailyCleared: true, streak, bestStreak: Math.max(streak, next.bestStreak) };
        notices.push({
          title: 'QUÊTES DU JOUR TERMINÉES',
          lines: [`Bonus : +${DAILY_BONUS_XP} XP`, `Série : ${streak} jour(s)`],
          tone: 'success',
        });
        next = gainXp(next, DAILY_BONUS_XP, notices);
      }
      return next;
    });

  const addPenaltyProgress = (delta: number) =>
    update((s, notices) => {
      if (!s.penalty.active) return s;
      const progress = Math.max(0, Math.min(PENALTY_QUEST.target, s.penalty.progress + delta));
      if (progress >= PENALTY_QUEST.target) {
        notices.push({ title: 'PÉNALITÉ LEVÉE', lines: ['Les quêtes du jour sont débloquées.'], tone: 'info' });
        return { ...s, penalty: { active: false, progress: 0 } };
      }
      return { ...s, penalty: { active: true, progress } };
    });

  const spendPoint = (stat: StatKey) =>
    update((s) =>
      s.statPoints <= 0 ? s : { ...s, statPoints: s.statPoints - 1, stats: { ...s.stats, [stat]: s.stats[stat] + 1 } },
    );

  const enterPortal = (id: string) =>
    update((s, notices) => {
      const portal = PORTALS.find((p) => p.id === id)!;
      if (s.activePortal || s.level < portal.minLevel) return s;
      notices.push({
        title: 'PORTAIL OUVERT',
        lines: [portal.name, `Tu as ${portal.durationDays} jour(s) pour le terminer.`],
        tone: 'info',
      });
      return { ...s, activePortal: { id, endsAt: Date.now() + portal.durationDays * 86_400_000 } };
    });

  const clearPortal = () =>
    update((s, notices) => {
      if (!s.activePortal) return s;
      const portal = PORTALS.find((p) => p.id === s.activePortal!.id)!;
      let next: GameState = {
        ...s,
        activePortal: null,
        clearedPortals: [...s.clearedPortals, portal.id],
        stats: { ...s.stats, [portal.stat]: s.stats[portal.stat] + portal.statGain },
      };
      notices.push({
        title: 'PORTAIL CONQUIS',
        lines: [portal.name, `+${portal.xp} XP`, `+${portal.statGain} ${portal.stat}`],
        tone: 'success',
      });
      next = gainXp(next, portal.xp, notices);
      return next;
    });

  const abandonPortal = () =>
    update((s, notices) => {
      if (!s.activePortal) return s;
      notices.push({ title: 'PORTAIL ABANDONNÉ', lines: [`-${PORTAL_FAIL_XP_LOSS} XP`], tone: 'danger' });
      return loseXp({ ...s, activePortal: null }, PORTAL_FAIL_XP_LOSS);
    });

  const setName = (name: string) => update((s) => ({ ...s, name: name.trim() || 'Joueur' }));
  const resetAll = () => update(() => initialState());

  return (
    <GameContext.Provider
      value={{
        state,
        ready,
        notice: queue[0] ?? null,
        dismissNotice: () => setQueue((q) => q.slice(1)),
        addProgress,
        addPenaltyProgress,
        spendPoint,
        enterPortal,
        clearPortal,
        abandonPortal,
        setName,
        resetAll,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame doit être utilisé dans GameProvider');
  return ctx;
}
