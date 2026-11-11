import React from 'react';
import { Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors, font } from '../theme';

// Fenêtre "système" : panneau sombre, bordure bleue lumineuse, titre en capitales.
export function SystemWindow({
  title,
  children,
  tone = 'info',
  style,
}: {
  title?: string;
  children: React.ReactNode;
  tone?: 'info' | 'success' | 'danger';
  style?: ViewStyle;
}) {
  const accent = tone === 'danger' ? colors.danger : tone === 'success' ? colors.success : colors.border;
  return (
    <View style={[styles.window, { borderColor: accent, shadowColor: accent }, style]}>
      {title ? (
        <View style={[styles.titleBar, { borderBottomColor: accent }]}>
          <Text style={[styles.title, { color: accent }]}>{title}</Text>
        </View>
      ) : null}
      <View style={styles.body}>{children}</View>
    </View>
  );
}

export function ProgressBar({ value, max, color = colors.glow }: { value: number; max: number; color?: string }) {
  const pct = Math.max(0, Math.min(1, max > 0 ? value / max : 0));
  return (
    <View style={styles.barTrack}>
      <View style={[styles.barFill, { width: `${pct * 100}%`, backgroundColor: color, shadowColor: color }]} />
    </View>
  );
}

export function SysButton({
  label,
  onPress,
  disabled,
  tone = 'info',
  small,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  tone?: 'info' | 'success' | 'danger';
  small?: boolean;
}) {
  const accent = tone === 'danger' ? colors.danger : tone === 'success' ? colors.success : colors.glow;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.btn,
        small && styles.btnSmall,
        { borderColor: accent, opacity: disabled ? 0.35 : pressed ? 0.6 : 1 },
      ]}
    >
      <Text style={[styles.btnText, small && { fontSize: 13 }, { color: accent }]}>{label}</Text>
    </Pressable>
  );
}

export const Txt = ({ children, dim, style }: { children: React.ReactNode; dim?: boolean; style?: any }) => (
  <Text style={[{ color: dim ? colors.textDim : colors.text, fontSize: 14 }, style]}>{children}</Text>
);

const styles = StyleSheet.create({
  window: {
    backgroundColor: colors.panel,
    borderWidth: 1.5,
    borderRadius: 6,
    marginBottom: 14,
    shadowOpacity: 0.7,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
    elevation: 6,
  },
  titleBar: { borderBottomWidth: 1, paddingVertical: 8, paddingHorizontal: 12, alignItems: 'center' },
  title: { fontFamily: font.mono, fontWeight: '700', letterSpacing: 3, fontSize: 14 },
  body: { padding: 12 },
  barTrack: { height: 8, backgroundColor: '#16213A', borderRadius: 4, overflow: 'hidden', marginTop: 6 },
  barFill: { height: '100%', borderRadius: 4, shadowOpacity: 1, shadowRadius: 6 },
  btn: { borderWidth: 1, borderRadius: 4, paddingVertical: 10, paddingHorizontal: 16, alignItems: 'center' },
  btnSmall: { paddingVertical: 6, paddingHorizontal: 12, minWidth: 44 },
  btnText: { fontFamily: font.mono, fontWeight: '700', letterSpacing: 1.5, fontSize: 14 },
});
