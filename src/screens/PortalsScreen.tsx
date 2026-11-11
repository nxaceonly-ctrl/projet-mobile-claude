import React from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { PORTALS, STAT_LABELS } from '../data';
import { useGame } from '../store';
import { colors } from '../theme';
import { SysButton, SystemWindow, Txt } from '../components/ui';

const TIER_COLORS: Record<string, string> = {
  I: '#4FA3FF',
  II: '#3DDC97',
  III: '#FFB547',
  IV: '#FF6B9A',
  V: '#B98CFF',
};

function remaining(endsAt: number) {
  const ms = Math.max(0, endsAt - Date.now());
  const d = Math.floor(ms / 86_400_000);
  const h = Math.floor((ms % 86_400_000) / 3_600_000);
  return `${d} j ${h} h`;
}

export default function PortalsScreen() {
  const { state, enterPortal, clearPortal, abandonPortal } = useGame();
  const active = state.activePortal ? PORTALS.find((p) => p.id === state.activePortal!.id) : null;

  return (
    <ScrollView contentContainerStyle={styles.content}>
      {active && state.activePortal && (
        <SystemWindow title="PORTAIL EN COURS" tone="success">
          <Txt style={styles.name}>{active.name}</Txt>
          <Txt dim>{active.description}</Txt>
          <Txt style={{ marginTop: 8, color: colors.warning }}>Fermeture dans : {remaining(state.activePortal.endsAt)}</Txt>
          <View style={styles.row}>
            <SysButton tone="success" label="DÉFI RÉUSSI" onPress={clearPortal} />
            <SysButton
              tone="danger"
              label="ABANDONNER"
              onPress={() =>
                Alert.alert('Abandonner le portail ?', 'Tu perdras de l’XP.', [
                  { text: 'Annuler', style: 'cancel' },
                  { text: 'Abandonner', style: 'destructive', onPress: abandonPortal },
                ])
              }
            />
          </View>
        </SystemWindow>
      )}

      <SystemWindow title="PORTAILS DÉTECTÉS">
        <Txt dim style={{ marginBottom: 6 }}>
          Un seul portail à la fois. S’il n’est pas terminé à temps, il se referme et tu perds de l’XP.
        </Txt>
        {PORTALS.map((p) => {
          const locked = state.level < p.minLevel;
          const cleared = state.clearedPortals.includes(p.id);
          const tierColor = TIER_COLORS[p.tier];
          return (
            <View key={p.id} style={[styles.portal, { borderLeftColor: tierColor }, locked && { opacity: 0.4 }]}>
              <Txt style={[styles.tier, { color: tierColor }]}>
                RANG {p.tier} {cleared ? '· CONQUIS ×' + state.clearedPortals.filter((c) => c === p.id).length : ''}
              </Txt>
              <Txt style={styles.name}>{p.name}</Txt>
              <Txt dim>{p.description}</Txt>
              <Txt dim style={{ marginTop: 4 }}>
                {p.durationDays} j · +{p.xp} XP · +{p.statGain} {STAT_LABELS[p.stat]}
              </Txt>
              <View style={{ marginTop: 8, alignSelf: 'flex-start' }}>
                <SysButton
                  small
                  label={locked ? `NIVEAU ${p.minLevel} REQUIS` : 'ENTRER'}
                  disabled={locked || !!state.activePortal}
                  onPress={() => enterPortal(p.id)}
                />
              </View>
            </View>
          );
        })}
      </SystemWindow>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 40 },
  row: { flexDirection: 'row', gap: 10, marginTop: 12, flexWrap: 'wrap' },
  portal: { borderLeftWidth: 3, paddingLeft: 10, paddingVertical: 10, marginTop: 10, backgroundColor: colors.panelAlt, borderRadius: 4 },
  tier: { fontFamily: 'monospace', fontWeight: '700', fontSize: 12, letterSpacing: 2 },
  name: { fontSize: 16, fontWeight: '700', marginVertical: 2 },
});
