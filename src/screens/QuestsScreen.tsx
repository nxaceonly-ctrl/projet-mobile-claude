import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { DAILY_QUESTS, PENALTY_QUEST, STAT_LABELS } from '../data';
import { useGame } from '../store';
import { colors, fonts } from '../theme';
import { Card, IconBadge, IconName, ProgressBar, RoundButton, Tile, Txt } from '../components/ui';

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
  const parts = [Math.floor(ms / 3_600_000), Math.floor((ms % 3_600_000) / 60_000), Math.floor((ms % 60_000) / 1000)];
  return { text: parts.map((n) => String(n).padStart(2, '0')).join(':'), urgent: ms < 3 * 3_600_000 };
}

const fmt = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(1));

export default function QuestsScreen() {
  const { state, addProgress, addPenaltyProgress } = useGame();
  const countdown = useCountdown();
  const doneCount = DAILY_QUESTS.filter((q) => (state.progress[q.id] ?? 0) >= q.target).length;
  const locked = state.penalty.active;

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {locked && (
        <Card title="PÉNALITÉ" tone="danger">
          <Txt dim style={{ textAlign: 'center', marginBottom: 14 }}>
            Tu as manqué tes quêtes d'hier. Termine cette épreuve pour débloquer celles d'aujourd'hui.
          </Txt>
          <Tile style={styles.row}>
            <IconBadge name="skull" tone="danger" />
            <View style={{ flex: 1 }}>
              <Txt weight="semibold" size={15}>{PENALTY_QUEST.title}</Txt>
              <Txt dim size={12}>
                {state.penalty.progress} / {PENALTY_QUEST.target} {PENALTY_QUEST.unit}
              </Txt>
              <ProgressBar value={state.penalty.progress} max={PENALTY_QUEST.target} tone="danger" />
            </View>
            <RoundButton icon="add" size={38} onPress={() => addPenaltyProgress(PENALTY_QUEST.step)} />
          </Tile>
        </Card>
      )}

      <Card title="QUÊTES DU JOUR">
        <View style={styles.timerBox}>
          <Txt dim size={12} style={{ letterSpacing: 1 }}>TEMPS RESTANT</Txt>
          <Txt style={[styles.timer, countdown.urgent && { color: colors.danger, textShadowColor: colors.danger }]}>
            {countdown.text}
          </Txt>
          <View style={styles.chips}>
            <View style={styles.chip}>
              <Txt size={12} weight="semibold">✓ {doneCount}/{DAILY_QUESTS.length}</Txt>
            </View>
            <View style={styles.chip}>
              <Txt size={12} weight="semibold">🔥 Série {state.streak}</Txt>
            </View>
          </View>
        </View>

        {DAILY_QUESTS.map((q) => {
          const p = state.progress[q.id] ?? 0;
          const done = p >= q.target;
          return (
            <Tile key={q.id} style={[styles.row, locked && { opacity: 0.35 }, done && styles.tileDone]}>
              <IconBadge name={(done ? 'checkmark' : q.icon) as IconName} tone={done ? 'success' : 'info'} />
              <View style={{ flex: 1 }}>
                <Txt weight="semibold" size={15} color={done ? colors.success : colors.text}>{q.title}</Txt>
                <Txt dim size={12}>
                  {fmt(p)} / {fmt(q.target)} {q.unit} · +{q.xp} XP · {STAT_LABELS[q.stat]}
                </Txt>
                <ProgressBar value={p} max={q.target} tone={done ? 'success' : 'info'} />
              </View>
              <View style={{ gap: 6 }}>
                <RoundButton icon="add" size={34} disabled={locked || done} onPress={() => addProgress(q.id, q.step)} />
                <RoundButton icon="remove" size={34} disabled={locked || p <= 0} onPress={() => addProgress(q.id, -q.step)} />
              </View>
            </Tile>
          );
        })}

        <Txt dim size={12} style={{ marginTop: 6, textAlign: 'center' }}>
          Tout doit être terminé avant minuit, sinon une pénalité s'applique.
        </Txt>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 18, paddingBottom: 120 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  tileDone: { borderColor: 'rgba(61,220,151,0.3)' },
  timerBox: { alignItems: 'center', marginBottom: 16 },
  timer: {
    fontFamily: fonts.extrabold,
    fontSize: 44,
    color: colors.glow,
    letterSpacing: 2,
    textShadowColor: colors.primary,
    textShadowRadius: 16,
    marginVertical: 2,
  },
  chips: { flexDirection: 'row', gap: 8, marginTop: 6 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
});
