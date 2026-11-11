import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { ActivityIndicator, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { SysButton, SystemWindow, Txt } from './src/components/ui';
import PortalsScreen from './src/screens/PortalsScreen';
import QuestsScreen from './src/screens/QuestsScreen';
import StatusScreen from './src/screens/StatusScreen';
import { GameProvider, useGame } from './src/store';
import { colors } from './src/theme';

const TABS = [
  { key: 'quests', label: 'QUÊTES', icon: '◆' },
  { key: 'portals', label: 'PORTAILS', icon: '◎' },
  { key: 'status', label: 'STATUT', icon: '▲' },
] as const;
type TabKey = (typeof TABS)[number]['key'];

// Fenêtre "système" qui s'affiche par-dessus l'écran (niveau gagné, pénalité...).
function NoticeModal() {
  const { notice, dismissNotice } = useGame();
  return (
    <Modal visible={!!notice} transparent animationType="fade" onRequestClose={dismissNotice}>
      <View style={styles.backdrop}>
        {notice && (
          <SystemWindow title={notice.title} tone={notice.tone} style={{ width: '100%' }}>
            {notice.lines.map((l, i) => (
              <Txt key={i} style={{ textAlign: 'center', marginVertical: 3, fontSize: 16 }}>
                {l}
              </Txt>
            ))}
            <View style={{ marginTop: 12 }}>
              <SysButton label="OK" tone={notice.tone} onPress={dismissNotice} />
            </View>
          </SystemWindow>
        )}
      </View>
    </Modal>
  );
}

function Main() {
  const { ready } = useGame();
  const [tab, setTab] = useState<TabKey>('quests');

  if (!ready) {
    return (
      <View style={[styles.root, { justifyContent: 'center' }]}>
        <ActivityIndicator color={colors.glow} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <Text style={styles.brand}>ASCENDANT</Text>
      <View style={{ flex: 1 }}>
        {tab === 'quests' && <QuestsScreen />}
        {tab === 'portals' && <PortalsScreen />}
        {tab === 'status' && <StatusScreen />}
      </View>
      <View style={styles.tabBar}>
        {TABS.map((t) => {
          const on = t.key === tab;
          return (
            <Pressable key={t.key} style={styles.tab} onPress={() => setTab(t.key)}>
              <Text style={[styles.tabIcon, on && styles.tabOn]}>{t.icon}</Text>
              <Text style={[styles.tabLabel, on && styles.tabOn]}>{t.label}</Text>
            </Pressable>
          );
        })}
      </View>
      <NoticeModal />
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <GameProvider>
        <StatusBar style="light" />
        <Main />
      </GameProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  brand: {
    color: colors.glow,
    fontFamily: 'monospace',
    fontWeight: '800',
    letterSpacing: 6,
    textAlign: 'center',
    fontSize: 18,
    paddingVertical: 10,
    textShadowColor: colors.glow,
    textShadowRadius: 12,
  },
  tabBar: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.panel },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 10 },
  tabIcon: { color: colors.textDim, fontSize: 18 },
  tabLabel: { color: colors.textDim, fontFamily: 'monospace', fontSize: 11, letterSpacing: 2, marginTop: 2 },
  tabOn: { color: colors.glow },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'center', padding: 24 },
});
