import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Dimensions, Easing, Platform, Pressable, StyleSheet, View } from 'react-native';
import { Txt } from '../components/ui';
import { rankFor } from '../data';
import { useGame } from '../store';
import { colors, fonts, gradients } from '../theme';

const native = Platform.OS !== 'web';
const { width: W, height: H } = Dimensions.get('window');

// Petites particules lumineuses qui montent dans le fond.
function Particles() {
  const dots = useMemo(
    () =>
      Array.from({ length: 18 }, () => ({
        x: Math.random() * W,
        size: 2 + Math.random() * 3,
        delay: Math.random() * 2500,
        duration: 3000 + Math.random() * 3000,
        anim: new Animated.Value(0),
      })),
    [],
  );
  useEffect(() => {
    dots.forEach((d) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(d.delay),
          Animated.timing(d.anim, { toValue: 1, duration: d.duration, easing: Easing.linear, useNativeDriver: native }),
        ]),
      ).start(),
    );
  }, [dots]);
  return (
    <>
      {dots.map((d, i) => (
        <Animated.View
          key={i}
          style={{
            position: 'absolute',
            left: d.x,
            bottom: 0,
            width: d.size,
            height: d.size,
            borderRadius: d.size,
            backgroundColor: colors.glow,
            opacity: d.anim.interpolate({ inputRange: [0, 0.2, 0.8, 1], outputRange: [0, 0.9, 0.6, 0] }),
            transform: [{ translateY: d.anim.interpolate({ inputRange: [0, 1], outputRange: [0, -H * 0.9] }) }],
          }}
        />
      ))}
    </>
  );
}

// Écran d'ouverture : le "système" s'éveille et reconnaît le joueur.
export default function IntroScreen({ onDone }: { onDone: () => void }) {
  const { state } = useGame();
  const lines = useMemo(
    () => [
      'Signal détecté…',
      'Analyse du corps et de l’esprit… OK',
      `Joueur reconnu : ${state.name}`,
      `Niveau ${state.level} · ${rankFor(state.level)}`,
    ],
    [state.name, state.level],
  );

  const line = useRef(new Animated.Value(0)).current; // trait lumineux horizontal
  const open = useRef(new Animated.Value(0)).current; // ouverture verticale de la fenêtre
  const titleGlow = useRef(new Animated.Value(0)).current;
  const bar = useRef(new Animated.Value(0)).current;
  const flash = useRef(new Animated.Value(0)).current;
  const fade = useRef(new Animated.Value(1)).current;
  const [typed, setTyped] = useState<string[]>([]);
  const [showWelcome, setShowWelcome] = useState(false);
  const finished = useRef(false);

  const finish = () => {
    if (finished.current) return;
    finished.current = true;
    Animated.sequence([
      Animated.timing(flash, { toValue: 1, duration: 140, useNativeDriver: native }),
      Animated.parallel([
        Animated.timing(flash, { toValue: 0, duration: 450, useNativeDriver: native }),
        Animated.timing(fade, { toValue: 0, duration: 450, useNativeDriver: native }),
      ]),
    ]).start(() => onDone());
  };

  useEffect(() => {
    // 1) trait lumineux, 2) la fenêtre s'ouvre, 3) le titre clignote
    Animated.sequence([
      Animated.delay(250),
      Animated.timing(line, { toValue: 1, duration: 450, easing: Easing.out(Easing.cubic), useNativeDriver: native }),
      Animated.timing(open, { toValue: 1, duration: 380, easing: Easing.out(Easing.back(1.2)), useNativeDriver: native }),
      Animated.sequence([
        Animated.timing(titleGlow, { toValue: 1, duration: 80, useNativeDriver: native }),
        Animated.timing(titleGlow, { toValue: 0.2, duration: 80, useNativeDriver: native }),
        Animated.timing(titleGlow, { toValue: 1, duration: 80, useNativeDriver: native }),
        Animated.timing(titleGlow, { toValue: 0.4, duration: 60, useNativeDriver: native }),
        Animated.timing(titleGlow, { toValue: 1, duration: 120, useNativeDriver: native }),
      ]),
    ]).start(() => startTyping());

    // 4) texte tapé lettre par lettre
    let timer: ReturnType<typeof setInterval> | undefined;
    const startTyping = () => {
      let li = 0;
      let ci = 0;
      timer = setInterval(() => {
        if (li >= lines.length) {
          clearInterval(timer);
          setShowWelcome(true);
          Animated.timing(bar, { toValue: 1, duration: 900, easing: Easing.inOut(Easing.quad), useNativeDriver: false }).start(() =>
            setTimeout(finish, 450),
          );
          return;
        }
        ci += 1;
        const current = lines[li].slice(0, ci);
        setTyped((t) => {
          const next = [...t];
          next[li] = current;
          return next;
        });
        if (ci >= lines[li].length) {
          li += 1;
          ci = 0;
        }
      }, 28);
    };
    return () => {
      if (timer) clearInterval(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Animated.View style={[StyleSheet.absoluteFill, { opacity: fade, zIndex: 100 }]}>
      <Pressable style={{ flex: 1 }} onPress={finish}>
        <LinearGradient colors={['#02040A', '#060C1E', '#0B0A1E']} style={styles.root}>
          <Particles />

          {/* trait lumineux qui s'étire */}
          <Animated.View
            style={[
              styles.line,
              {
                opacity: open.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }),
                transform: [{ scaleX: line }],
              },
            ]}
          />

          {/* fenêtre système */}
          <Animated.View style={[styles.window, { opacity: open, transform: [{ scaleY: open }] }]}>
            <Animated.View style={[styles.titleFrame, { opacity: titleGlow }]}>
              <Txt style={styles.title}>SYSTÈME</Txt>
            </Animated.View>

            <View style={styles.console}>
              {typed.map((t, i) => (
                <Txt key={i} size={15} weight={i >= 2 ? 'semibold' : 'regular'} color={i >= 2 ? colors.text : colors.textDim} style={{ marginVertical: 3 }}>
                  <Txt color={colors.glow} weight="bold">› </Txt>
                  {t}
                </Txt>
              ))}
            </View>

            <View style={styles.barTrack}>
              <Animated.View style={{ height: '100%', width: bar.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) }}>
                <LinearGradient colors={gradients.primary} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ flex: 1 }} />
              </Animated.View>
            </View>

            {showWelcome && (
              <Txt weight="extrabold" size={18} color={colors.glow} style={styles.welcome}>
                ÉVEIL TERMINÉ
              </Txt>
            )}
          </Animated.View>

          <Txt dim size={11} style={styles.skip}>Touchez pour passer</Txt>

          {/* flash final */}
          <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: '#BFDBFF', opacity: flash }]} />
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  line: {
    position: 'absolute',
    width: '86%',
    height: 2,
    backgroundColor: colors.glow,
    shadowColor: colors.glow,
    shadowOpacity: 1,
    shadowRadius: 12,
  },
  window: {
    width: '100%',
    maxWidth: 420,
    borderWidth: 1.5,
    borderColor: 'rgba(111,180,255,0.6)',
    backgroundColor: 'rgba(14, 30, 70, 0.55)',
    borderRadius: 18,
    padding: 22,
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOpacity: 0.8,
    shadowRadius: 30,
    elevation: 12,
  },
  titleFrame: {
    borderWidth: 1.5,
    borderColor: 'rgba(111,180,255,0.7)',
    paddingHorizontal: 26,
    paddingVertical: 8,
    backgroundColor: 'rgba(30,123,255,0.12)',
    marginBottom: 18,
  },
  title: {
    fontFamily: fonts.extrabold,
    fontSize: 24,
    letterSpacing: 6,
    color: colors.glow,
    textShadowColor: colors.primary,
    textShadowRadius: 14,
  },
  console: { alignSelf: 'stretch', minHeight: 116 },
  barTrack: {
    alignSelf: 'stretch',
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginTop: 16,
  },
  welcome: { marginTop: 16, letterSpacing: 4, textShadowColor: colors.primary, textShadowRadius: 12 },
  skip: { position: 'absolute', bottom: 48, letterSpacing: 1 },
});
