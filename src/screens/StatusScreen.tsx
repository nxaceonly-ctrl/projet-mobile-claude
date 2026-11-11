import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { rankFor, STAT_LABELS, StatKey, xpForLevel } from '../data';
import { useGame } from '../store';
import { colors } from '../theme';
import { ProgressBar, SysButton, SystemWindow, Txt } from '../components/ui';

export default function StatusScreen() {
  const { state, spendPoint, setName, resetAll } = useGame();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(state.name);
  const need = xpForLevel(state.level);

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <SystemWindow title="STATUT">
        {editing ? (
          <View style={styles.row}>
            <TextInput value={draft} onChangeText={setDraft} style={styles.input} maxLength={20} autoFocus />
            <SysButton small label="OK" onPress={() => { setName(draft); setEditing(false); }} />
          </View>
        ) : (
          <Txt style={styles.name}>{state.name}</Txt>
        )}
        {!editing && <SysButton small label="Changer de nom" onPress={() => { setDraft(state.name); setEditing(true); }} />}

        <View style={styles.levelBox}>
          <Txt dim>NIVEAU</Txt>
          <Txt style={styles.level}>{state.level}</Txt>
          <Txt style={{ color: colors.gold, letterSpacing: 2 }}>Titre : {rankFor(state.level)}</Txt>
        </View>
        <Txt dim>
          XP {state.xp} / {need}
        </Txt>
        <ProgressBar value={state.xp} max={need} />
        <View style={[styles.row, { marginTop: 12, justifyContent: 'space-between' }]}>
          <Txt dim>Série actuelle : {state.streak} 🔥</Txt>
          <Txt dim>Record : {state.bestStreak}</Txt>
        </View>
        <Txt dim>Portails conquis : {state.clearedPortals.length}</Txt>
      </SystemWindow>

      <SystemWindow title="CARACTÉRISTIQUES">
        {state.statPoints > 0 && (
          <Txt style={{ color: colors.gold, marginBottom: 8 }}>Points disponibles : {state.statPoints}</Txt>
        )}
        {(Object.keys(STAT_LABELS) as StatKey[]).map((k) => (
          <View key={k} style={styles.statRow}>
            <Txt style={styles.statKey}>{k}</Txt>
            <Txt style={{ flex: 1 }}>{STAT_LABELS[k]}</Txt>
            <Txt style={styles.statVal}>{state.stats[k]}</Txt>
            <SysButton small label="+" disabled={state.statPoints <= 0} onPress={() => spendPoint(k)} />
          </View>
        ))}
      </SystemWindow>

      <SysButton
        tone="danger"
        label="RÉINITIALISER LA PARTIE"
        onPress={() =>
          Alert.alert('Tout effacer ?', 'Ta progression sera perdue.', [
            { text: 'Annuler', style: 'cancel' },
            { text: 'Effacer', style: 'destructive', onPress: resetAll },
          ])
        }
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 40 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  name: { fontSize: 20, fontWeight: '700', marginBottom: 6 },
  input: { flex: 1, borderWidth: 1, borderColor: colors.border, color: colors.text, padding: 8, borderRadius: 4 },
  levelBox: { alignItems: 'center', marginVertical: 14 },
  level: { fontSize: 56, fontWeight: '800', color: colors.glow, fontFamily: 'monospace' },
  statRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, gap: 10, borderBottomWidth: 1, borderBottomColor: '#16213A' },
  statKey: { fontFamily: 'monospace', fontWeight: '700', color: colors.glow, width: 40 },
  statVal: { fontFamily: 'monospace', fontSize: 18, fontWeight: '700', width: 40, textAlign: 'right' },
});
