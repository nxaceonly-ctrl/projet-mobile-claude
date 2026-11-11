import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { DAILY_QUESTS, PENALTY_QUEST, STAT_LABELS } from '../data';
import { useGame } from '../store';
import { colors } from '../theme';
import { ProgressBar, SysButton, SystemWindow, Txt } from '../components/ui';

// Temps restant avant minuit (fin des 24h).
function useCountdown() {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const end = new Date(now);
  end.setHours(24, 0, 0, 0);
  const ms = end.getTime() - now;
  const h = Math.floor(ms / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  const s = Math.floor((ms % 60_000) / 1000);
  return { text: [h, m, s].map((n) => String(n).padStart(2, '0')).join(':'), urgent: ms < 3 * 3_600_000 };
}

const fmt = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(1));

export default function QuestsScreen() {
  const { state, addProgress, addPenaltyProgress } = useGame();
  const countdown = useCountdown();
  const doneCount = DAILY_QUESTS.filter((q) => (state.progress[q.id] ?? 0) >= q.target).length;

  return (
    <ScrollView contentContainerStyle={styles.content}>
      {state.penalty.active && (
        <SystemWindow title="⚠ ZONE DE PÉNALITÉ" tone="danger">
          <Txt>Tu as manqué tes quêtes d'hier. Termine cette épreuve pour débloquer celles d'aujourd'hui.</Txt>
          <View style={styles.questRow}>
            <View style={{ flex: 1 }}>
              <Txt style={styles.questTitle}>{PENALTY_QUEST.title}</Txt>
              <Txt dim>
                {state.penalty.progress} / {PENALTY_QUEST.target} {PENALTY_QUEST.unit}
              </Txt>
              <ProgressBar value={state.penalty.progress} max={PENALTY_QUEST.target} color={colors.danger} />
            </View>
            <SysButton small tone="danger" label={`+${PENALTY_QUEST.step}`} onPress={() => addPenaltyProgress(PENALTY_QUEST.step)} />
          </View>
        </SystemWindow>
      )}

      <SystemWindow title="QUÊTES DU JOUR">
        <View style={styles.header}>
          <Txt dim>Temps restant</Txt>
          <Txt style={[styles.timer, countdown.urgent && { color: colors.danger }]}>{countdown.text}</Txt>
          <Txt dim>
            {doneCount}/{DAILY_QUESTS.length} terminées · Série {state.streak} 🔥
          </Txt>
        </View>

        {DAILY_QUESTS.map((q) => {
          const p = state.progress[q.id] ?? 0;
          const done = p >= q.target;
          return (
            <View key={q.id} style={[styles.questRow, state.penalty.active && { opacity: 0.35 }]}>
              <View style={{ flex: 1 }}>
                <Txt style={[styles.questTitle, done && { color: colors.success }]}>
                  {done ? '✓ ' : ''}
                  {q.title}
                </Txt>
                <Txt dim>
                  {fmt(p)} / {fmt(q.target)} {q.unit} · +{q.xp} XP · {STAT_LABELS[q.stat]}
                </Txt>
                <ProgressBar value={p} max={q.target} color={done ? colors.success : colors.glow} />
              </View>
              <View style={styles.btns}>
                <SysButton small label="−" disabled={state.penalty.active || p <= 0} onPress={() => addProgress(q.id, -q.step)} />
                <SysButton small label="+" disabled={state.penalty.active || done} onPress={() => addProgress(q.id, q.step)} />
              </View>
            </View>
          );
        })}

        <Txt dim style={styles.warn}>
          Si toutes les quêtes ne sont pas terminées avant minuit, une pénalité s'applique.
        </Txt>
      </SystemWindow>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 40 },
  header: { alignItems: 'center', marginBottom: 8 },
  timer: { fontFamily: 'monospace', fontSize: 34, fontWeight: '700', color: colors.glow, marginVertical: 4 },
  questRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#16213A', gap: 10 },
  questTitle: { fontSize: 16, fontWeight: '600' },
  btns: { flexDirection: 'row', gap: 6 },
  warn: { marginTop: 10, fontSize: 12, textAlign: 'center' },
});
