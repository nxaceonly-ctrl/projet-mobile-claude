import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { plural, rankFor, STAT_ICONS, STAT_LABELS, StatKey, xpForLevel } from '../data';
import { useGame } from '../store';
import { colors, fonts, gradients } from '../theme';
import { Card, IconBadge, IconName, ProgressBar, RoundButton, Tile, Txt } from '../components/ui';

export default function StatusScreen() {
  const { state, spendPoint } = useGame();
  const need = xpForLevel(state.level);

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Card title="STATUT">
        <View style={{ alignItems: 'center' }}>
          <LinearGradient colors={gradients.primary} style={styles.avatarRing}>
            <View style={styles.avatar}>
              <Txt style={styles.level}>{state.level}</Txt>
              <Txt dim size={11} weight="semibold" style={{ letterSpacing: 2 }}>NIVEAU</Txt>
            </View>
          </LinearGradient>
          <Txt weight="bold" size={22} style={{ marginTop: 12 }}>{state.name}</Txt>
          <View style={styles.rankChip}>
            <Ionicons name="medal" size={14} color={colors.gold} />
            <Txt weight="semibold" size={13} color={colors.gold}>{rankFor(state.level)}</Txt>
          </View>
        </View>

        <View style={{ marginTop: 18 }}>
          <View style={styles.between}>
            <Txt dim size={12}>Expérience</Txt>
            <Txt size={12} weight="semibold">{state.xp} / {need} XP</Txt>
          </View>
          <ProgressBar value={state.xp} max={need} />
        </View>

        <View style={styles.statsRow}>
          {[
            { label: 'Série', value: state.streak, icon: 'flame' },
            { label: 'Record', value: state.bestStreak, icon: 'trophy' },
            { label: 'Portails', value: state.clearedPortals.length, icon: 'planet' },
          ].map((s) => (
            <Tile key={s.label} style={styles.miniTile}>
              <Ionicons name={s.icon as IconName} size={18} color={colors.glow} />
              <Txt weight="extrabold" size={20}>{s.value}</Txt>
              <Txt dim size={11}>{s.label}</Txt>
            </Tile>
          ))}
        </View>
      </Card>

      <Card title="CARACTÉRISTIQUES">
        {state.statPoints > 0 && (
          <View style={styles.pointsBanner}>
            <Ionicons name="sparkles" size={16} color={colors.gold} />
            <Txt weight="semibold" color={colors.gold}>{plural(state.statPoints, 'point')} à répartir</Txt>
          </View>
        )}
        {(Object.keys(STAT_LABELS) as StatKey[]).map((k) => (
          <Tile key={k} style={styles.statRow}>
            <IconBadge name={STAT_ICONS[k] as IconName} />
            <View style={{ flex: 1 }}>
              <Txt weight="semibold" size={15}>{STAT_LABELS[k]}</Txt>
              <Txt dim size={11} style={{ letterSpacing: 1.5 }}>{k}</Txt>
            </View>
            <Txt weight="extrabold" size={22} style={{ marginRight: 8 }}>{state.stats[k]}</Txt>
            {state.statPoints > 0 && <RoundButton icon="add" size={34} onPress={() => spendPoint(k)} />}
          </Tile>
        ))}
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 18, paddingBottom: 120 },
  avatarRing: { width: 124, height: 124, borderRadius: 62, padding: 3 },
  avatar: { flex: 1, borderRadius: 60, backgroundColor: colors.bgMid, alignItems: 'center', justifyContent: 'center' },
  level: { fontFamily: fonts.extrabold, fontSize: 44, color: colors.text, lineHeight: 50 },
  rankChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(232,180,76,0.45)',
    backgroundColor: 'rgba(232,180,76,0.1)',
  },
  between: { flexDirection: 'row', justifyContent: 'space-between' },
  statsRow: { flexDirection: 'row', gap: 10, marginTop: 16 },
  miniTile: { flex: 1, alignItems: 'center', gap: 2, marginBottom: 0 },
  statRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  pointsBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    justifyContent: 'center',
    padding: 10,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: colors.goldBg,
    borderWidth: 1,
    borderColor: 'rgba(232,180,76,0.4)',
  },
});
