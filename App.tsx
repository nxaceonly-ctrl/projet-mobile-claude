import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
  useFonts,
} from '@expo-google-fonts/plus-jakarta-sans';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Modal, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Button, Card, IconName, RoundButton, Txt } from './src/components/ui';
import { DAILY_QUESTS } from './src/data';
import PortalsScreen from './src/screens/PortalsScreen';
import QuestsScreen from './src/screens/QuestsScreen';
import StatusScreen from './src/screens/StatusScreen';
import { GameProvider, useGame } from './src/store';
import { colors, fonts, gradients } from './src/theme';

const TABS: { key: TabKey; icon: IconName }[] = [
  { key: 'quests', icon: 'home' },
  { key: 'portals', icon: 'planet' },
  { key: 'status', icon: 'person' },
];
type TabKey = 'quests' | 'portals' | 'status';

// Fenêtre "système" par-dessus l'écran (niveau gagné, pénalité...).
function NoticeModal() {
  const { notice, dismissNotice } = useGame();
  return (
    <Modal visible={!!notice} transparent animationType="fade" onRequestClose={dismissNotice}>
      <View style={styles.backdrop}>
        {notice && (
          <Card title={notice.title} tone={notice.tone} style={styles.modalCard}>
            {notice.lines.map((l, i) => (
              <Txt key={i} size={16} weight={i === 0 ? 'semibold' : 'regular'} style={{ textAlign: 'center', marginVertical: 3 }}>
                {l}
              </Txt>
            ))}
            <View style={{ marginTop: 16 }}>
              <Button label="OK" onPress={dismissNotice} />
            </View>
          </Card>
        )}
      </View>
    </Modal>
  );
}

// Rappel du jour (cloche).
function ReminderModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { state } = useGame();
  const left = DAILY_QUESTS.filter((q) => (state.progress[q.id] ?? 0) < q.target);
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Card title="RAPPELS" style={styles.modalCard}>
          {state.penalty.active && <Txt color={colors.danger} weight="semibold" style={{ marginBottom: 8 }}>⚠ Pénalité en cours</Txt>}
          {left.length === 0 ? (
            <Txt style={{ textAlign: 'center' }}>Toutes les quêtes du jour sont terminées. Bien joué !</Txt>
          ) : (
            <>
              <Txt dim style={{ marginBottom: 8 }}>Il te reste {left.length} quête(s) avant minuit :</Txt>
              {left.map((q) => (
                <Txt key={q.id} style={{ marginVertical: 2 }}>• {q.title}</Txt>
              ))}
            </>
          )}
        </Card>
      </Pressable>
    </Modal>
  );
}

// Menu (nom du joueur, réinitialisation).
function MenuModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { state, setName, resetAll } = useGame();
  const [draft, setDraft] = useState(state.name);
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} onShow={() => setDraft(state.name)}>
      <View style={styles.backdrop}>
        <Card title="MENU" style={styles.modalCard}>
          <Txt dim size={12} style={{ marginBottom: 6 }}>Nom du joueur</Txt>
          <TextInput value={draft} onChangeText={setDraft} maxLength={20} style={styles.input} placeholderTextColor={colors.textFaint} />
          <View style={{ gap: 10, marginTop: 14 }}>
            <Button label="Enregistrer" icon="checkmark" onPress={() => { setName(draft); onClose(); }} />
            <Button
              label="Réinitialiser la partie"
              variant="danger"
              icon="trash"
              onPress={() =>
                Alert.alert('Tout effacer ?', 'Ta progression sera perdue.', [
                  { text: 'Annuler', style: 'cancel' },
                  { text: 'Effacer', style: 'destructive', onPress: () => { resetAll(); onClose(); } },
                ])
              }
            />
            <Button label="Fermer" variant="secondary" onPress={onClose} />
          </View>
        </Card>
      </View>
    </Modal>
  );
}

function Main() {
  const { ready } = useGame();
  const [tab, setTab] = useState<TabKey>('quests');
  const [menu, setMenu] = useState(false);
  const [reminder, setReminder] = useState(false);

  return (
    <LinearGradient colors={gradients.bg} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        {!ready ? (
          <ActivityIndicator color={colors.glow} style={{ flex: 1 }} />
        ) : (
          <>
            <View style={styles.header}>
              <RoundButton icon="notifications" onPress={() => setReminder(true)} />
              <Txt style={styles.brand}>ASCENDANT</Txt>
              <RoundButton icon="menu" onPress={() => setMenu(true)} />
            </View>
            <View style={{ flex: 1 }}>
              {tab === 'quests' && <QuestsScreen />}
              {tab === 'portals' && <PortalsScreen />}
              {tab === 'status' && <StatusScreen />}
            </View>
          </>
        )}
      </SafeAreaView>

      {/* barre d'onglets flottante */}
      <SafeAreaView edges={['bottom']} style={styles.tabWrap} pointerEvents="box-none">
        <View style={styles.tabBar}>
          {TABS.map((t) => {
            const on = t.key === tab;
            return (
              <Pressable key={t.key} onPress={() => setTab(t.key)} style={[styles.tab, on && styles.tabOn]}>
                <Ionicons name={on ? t.icon : (`${t.icon}-outline` as IconName)} size={22} color={on ? '#fff' : colors.textDim} />
              </Pressable>
            );
          })}
        </View>
      </SafeAreaView>

      <NoticeModal />
      <ReminderModal visible={reminder} onClose={() => setReminder(false)} />
      <MenuModal visible={menu} onClose={() => setMenu(false)} />
    </LinearGradient>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });
  if (!fontsLoaded) return <View style={{ flex: 1, backgroundColor: colors.bgTop }} />;
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
  halo: {
    position: 'absolute',
    top: -120,
    alignSelf: 'center',
    width: 360,
    height: 260,
    borderRadius: 180,
    backgroundColor: 'rgba(30,123,255,0.12)',
  },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18, paddingVertical: 8 },
  brand: { fontFamily: fonts.extrabold, color: colors.glow, letterSpacing: 4, fontSize: 15, textShadowColor: colors.primary, textShadowRadius: 10 },
  tabWrap: { position: 'absolute', left: 0, right: 0, bottom: 0, alignItems: 'center' },
  tabBar: {
    flexDirection: 'row',
    gap: 14,
    padding: 8,
    marginBottom: 12,
    borderRadius: 999,
    backgroundColor: '#0E1220',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 10,
  },
  tab: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  tabOn: { backgroundColor: colors.primary, shadowColor: colors.primary, shadowOpacity: 0.8, shadowRadius: 12 },
  backdrop: { flex: 1, backgroundColor: 'rgba(3,6,16,0.8)', justifyContent: 'center', padding: 22 },
  modalCard: { backgroundColor: '#101A36', width: '100%' },
  input: {
    borderWidth: 1,
    borderColor: colors.cardBorder,
    backgroundColor: 'rgba(0,0,0,0.25)',
    color: colors.text,
    fontFamily: fonts.medium,
    fontSize: 16,
    padding: 12,
    borderRadius: 12,
  },
});
