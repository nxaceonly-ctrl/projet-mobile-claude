import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Pressable, StyleProp, StyleSheet, Text, TextStyle, View, ViewStyle } from 'react-native';
import { colors, fonts, gradients, radius } from '../theme';

export type IconName = React.ComponentProps<typeof Ionicons>['name'];
type Tone = 'info' | 'success' | 'danger' | 'gold';

const toneColor = (tone: Tone) =>
  tone === 'danger' ? colors.danger : tone === 'success' ? colors.success : tone === 'gold' ? colors.gold : colors.glow;

// Texte avec la police de l'app.
export function Txt({
  children,
  dim,
  weight = 'regular',
  size = 14,
  color,
  style,
}: {
  children: React.ReactNode;
  dim?: boolean;
  weight?: keyof typeof fonts;
  size?: number;
  color?: string;
  style?: TextStyle | TextStyle[] | any;
}) {
  return (
    <Text style={[{ color: color ?? (dim ? colors.textDim : colors.text), fontFamily: fonts[weight], fontSize: size }, style]}>
      {children}
    </Text>
  );
}

// Titre encadré lumineux ("INVENTAIRE" dans la référence).
export function FramedTitle({ children, tone = 'info' }: { children: string; tone?: Tone }) {
  const c = toneColor(tone);
  return (
    <View style={[styles.frame, { borderColor: c + '66', shadowColor: c }]}>
      <Text style={[styles.frameText, { color: c, textShadowColor: c }]}>{children}</Text>
    </View>
  );
}

// Carte "verre" arrondie.
export function Card({
  title,
  tone = 'info',
  children,
  style,
}: {
  title?: string;
  tone?: Tone;
  children: React.ReactNode;
  style?: ViewStyle;
}) {
  const border =
    tone === 'danger' ? 'rgba(255,77,109,0.45)' : tone === 'gold' ? 'rgba(232,180,76,0.55)' : tone === 'success' ? 'rgba(61,220,151,0.45)' : colors.cardBorder;
  const bg = tone === 'danger' ? colors.dangerBg : tone === 'gold' ? colors.goldBg : colors.card;
  return (
    <View style={[styles.card, { borderColor: border, backgroundColor: bg, shadowColor: toneColor(tone) }, style]}>
      {title ? (
        <View style={{ alignItems: 'center', marginBottom: 16 }}>
          <FramedTitle tone={tone}>{title}</FramedTitle>
        </View>
      ) : null}
      {children}
    </View>
  );
}

// Tuile sombre (élément de liste).
export function Tile({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.tile, style]}>{children}</View>;
}

// Pastille d'icône dans un carré arrondi.
export function IconBadge({ name, tone = 'info', size = 40 }: { name: IconName; tone?: Tone; size?: number }) {
  const c = toneColor(tone);
  return (
    <View style={[styles.badge, { width: size, height: size, borderColor: c + '55', backgroundColor: c + '1A' }]}>
      <Ionicons name={name} size={size * 0.5} color={c} />
    </View>
  );
}

export function ProgressBar({ value, max, tone = 'info' }: { value: number; max: number; tone?: Tone }) {
  const pct = Math.max(0, Math.min(1, max > 0 ? value / max : 0));
  const g = tone === 'danger' ? gradients.danger : tone === 'success' ? gradients.success : gradients.primary;
  return (
    <View style={styles.barTrack}>
      <LinearGradient colors={g} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={[styles.barFill, { width: `${pct * 100}%` }]} />
    </View>
  );
}

// Bouton principal en dégradé, ou secondaire translucide.
export function Button({
  label,
  icon,
  onPress,
  disabled,
  variant = 'primary',
}: {
  label: string;
  icon?: IconName;
  onPress: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
}) {
  const content = (
    <View style={styles.btnInner}>
      {icon && <Ionicons name={icon} size={18} color={variant === 'danger' ? colors.danger : colors.text} />}
      <Txt weight="bold" size={15} color={variant === 'danger' ? colors.danger : colors.text}>
        {label}
      </Txt>
    </View>
  );
  return (
    <Pressable onPress={onPress} disabled={disabled} style={({ pressed }) => ({ opacity: disabled ? 0.55 : pressed ? 0.7 : 1 })}>
      {variant === 'primary' ? (
        <LinearGradient colors={gradients.primary} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.btn}>
          {content}
        </LinearGradient>
      ) : (
        <View
          style={[
            styles.btn,
            variant === 'danger'
              ? { backgroundColor: colors.dangerBg, borderColor: 'rgba(255,77,109,0.4)', borderWidth: 1 }
              : { backgroundColor: 'rgba(255,255,255,0.05)', borderColor: colors.cardBorder, borderWidth: 1 },
          ]}
        >
          {content}
        </View>
      )}
    </Pressable>
  );
}

// Bouton rond avec icône (cloche, menu, +/−).
export function RoundButton({
  icon,
  onPress,
  disabled,
  size = 44,
  active,
}: {
  icon: IconName;
  onPress: () => void;
  disabled?: boolean;
  size?: number;
  active?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      hitSlop={6}
      style={({ pressed }) => [
        styles.round,
        { width: size, height: size, opacity: disabled ? 0.3 : pressed ? 0.6 : 1 },
        active && { backgroundColor: colors.primary, borderColor: colors.primary },
      ]}
    >
      <Ionicons name={icon} size={size * 0.45} color={colors.text} />
    </Pressable>
  );
}

// Sélecteur à onglets avec segment actif en dégradé.
export function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string; icon?: IconName }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <View style={styles.seg}>
      {options.map((o) => {
        const on = o.value === value;
        const inner = (
          <View style={styles.segInner}>
            {o.icon && <Ionicons name={o.icon} size={16} color={on ? colors.text : colors.textDim} />}
            <Txt weight="semibold" size={13} color={on ? colors.text : colors.textDim}>
              {o.label}
            </Txt>
          </View>
        );
        return (
          <Pressable key={o.value} style={{ flex: 1 }} onPress={() => onChange(o.value)}>
            {on ? (
              <LinearGradient colors={gradients.primary} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.segItem}>
                {inner}
              </LinearGradient>
            ) : (
              <View style={styles.segItem}>{inner}</View>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    borderWidth: 1.5,
    paddingHorizontal: 22,
    paddingVertical: 8,
    backgroundColor: 'rgba(30, 123, 255, 0.08)',
    shadowOpacity: 0.6,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
  },
  frameText: { fontFamily: fonts.extrabold, fontSize: 20, letterSpacing: 1.5, textShadowRadius: 10 },
  card: {
    borderWidth: 1,
    borderRadius: radius.card,
    padding: 18,
    marginBottom: 18,
    shadowOpacity: 0.25,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 0 },
  },
  tile: {
    backgroundColor: colors.tile,
    borderColor: colors.tileBorder,
    borderWidth: 1,
    borderRadius: radius.tile,
    padding: 14,
    marginBottom: 10,
  },
  badge: { borderWidth: 1, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  barTrack: { height: 8, backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 4, overflow: 'hidden', marginTop: 8 },
  barFill: { height: '100%', borderRadius: 4 },
  btn: { borderRadius: 14, paddingVertical: 14, paddingHorizontal: 18 },
  btnInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  round: {
    borderRadius: radius.pill,
    backgroundColor: 'rgba(30, 50, 100, 0.45)',
    borderWidth: 1,
    borderColor: colors.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  seg: {
    flexDirection: 'row',
    backgroundColor: 'rgba(10,16,34,0.7)',
    borderRadius: 16,
    padding: 5,
    borderWidth: 1,
    borderColor: colors.tileBorder,
    marginBottom: 16,
  },
  segItem: { borderRadius: 12, paddingVertical: 11 },
  segInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
});
