import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { PORTALS, STAT_LABELS } from '../data';
import { useGame } from '../store';
import { colors } from '../theme';
import { Button, Card, confirmAction, Segmented, Tile, Txt } from '../components/ui';

const TIER_COLORS: Record<string, string> = {
  E: '#8C97B2',
  D: '#6FB4FF',
  C: '#3DDC97',
  B: '#E8B44C',
  A: '#FF6B9A',
  S: '#A98BFF',
};

function remaining(endsAt: number) {
  const ms = Math.max(0, endsAt - Date.now());
  return `${Math.floor(ms / 86_400_000)} j ${Math.floor((ms % 86_400_000) / 3_600_000)} h`;
}

export default function PortalsScreen() {
  const { state, enterPortal, clearPortal, abandonPortal } = useGame();
  const [tab, setTab] = useState<'open' | 'cleared'>('open');
  const active = state.activePortal ? PORTALS.find((p) => p.id === state.activePortal!.id) : null;
  const cleared = PORTALS.filter((p) => state.clearedPortals.includes(p.id));

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {active && state.activePortal && (
        <Card title="PORTAIL ACTIF" tone="gold">
          <View style={{ alignItems: 'center' }}>
            <View style={styles.portalIcon}>
              <Ionicons name="planet" size={30} color={colors.gold} />
            </View>
            <Txt weight="bold" size={20} color={colors.gold} style={{ textAlign: 'center' }}>{active.name}</Txt>
            <Txt dim style={{ textAlign: 'center', marginTop: 4 }}>{active.description}</Txt>
            <View style={styles.timeChip}>
              <Ionicons name="time-outline" size={14} color={colors.gold} />
              <Txt size={13} weight="semibold" color={colors.gold}>Fermeture dans {remaining(state.activePortal.endsAt)}</Txt>
            </View>
          </View>
          <View style={{ gap: 10, marginTop: 14 }}>
            <Button label="Défi réussi" icon="checkmark-circle" onPress={clearPortal} />
            <Button
              label="Abandonner"
              variant="danger"
              onPress={() =>
                confirmAction('Abandonner le portail ?', 'Tu perdras de l’XP.', 'Abandonner', abandonPortal)
              }
            />
          </View>
        </Card>
      )}

      <Card title="PORTAILS">
        <Segmented
          value={tab}
          onChange={setTab}
          options={[
            { value: 'open', label: 'Détectés', icon: 'scan' },
            { value: 'cleared', label: `Conquis (${cleared.length})`, icon: 'trophy' },
          ]}
        />

        {tab === 'cleared' && cleared.length === 0 && (
          <View style={styles.empty}>
            <Ionicons name="ribbon" size={64} color={colors.primary} />
            <Txt weight="bold" size={20} style={{ textAlign: 'center', marginTop: 12 }}>Aucun portail conquis</Txt>
            <Txt dim style={{ textAlign: 'center', marginTop: 4 }}>Tes victoires apparaîtront ici.</Txt>
          </View>
        )}

        {(tab === 'open' ? PORTALS : cleared).map((p) => {
          const locked = state.level < p.minLevel;
          const c = TIER_COLORS[p.tier];
          return (
            <Tile key={p.id} style={locked ? { opacity: 0.6 } : undefined}>
              <View style={styles.tileHead}>
                <View style={[styles.tier, { borderColor: c + '66', backgroundColor: c + '1A' }]}>
                  <Txt weight="extrabold" size={12} color={c}>RANG {p.tier}</Txt>
                </View>
                {locked && <Ionicons name="lock-closed" size={16} color={colors.textFaint} />}
                {!locked && state.clearedPortals.includes(p.id) && <Ionicons name="trophy" size={16} color={colors.gold} />}
              </View>
              <Txt weight="bold" size={16} style={{ marginTop: 8 }}>{p.name}</Txt>
              <Txt dim size={13} style={{ marginTop: 2 }}>{p.description}</Txt>
              <Txt dim size={12} style={{ marginTop: 6 }}>
                {p.durationDays} j · +{p.xp} XP · +{p.statGain} {STAT_LABELS[p.stat]}
              </Txt>
              {tab === 'open' && (
                <View style={{ marginTop: 12 }}>
                  <Button
                    label={locked ? `Niveau ${p.minLevel} requis` : 'Entrer dans le portail'}
                    icon={locked ? 'lock-closed' : 'enter'}
                    variant={locked ? 'secondary' : 'primary'}
                    disabled={locked || !!state.activePortal}
                    onPress={() => enterPortal(p.id)}
                  />
                </View>
              )}
            </Tile>
          );
        })}
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 18, paddingBottom: 120 },
  tileHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  tier: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  empty: { alignItems: 'center', paddingVertical: 40 },
  portalIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: 'rgba(232,180,76,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  timeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(232,180,76,0.12)',
  },
});
