/**
 * Reusable UI components for Unilingo
 */
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../../store/themeStore';
import { Gradients, BorderRadius, Spacing, Typography } from '../../theme';

// ─── Primary Gradient Button ───
interface ButtonProps {
  title: string;
  onPress: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

export const PrimaryButton: React.FC<ButtonProps> = ({
  title,
  onPress,
  icon,
  loading,
  disabled,
  style,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={style}
    >
      <LinearGradient
        colors={Gradients.primary}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.primaryBtn}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            {icon && <Ionicons name={icon} size={18} color="#fff" style={{ marginRight: 8 }} />}
            <Text style={styles.primaryBtnText}>{title}</Text>
          </>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
};

// ─── Outline Button ───
export const OutlineButton: React.FC<ButtonProps> = ({
  title,
  onPress,
  icon,
  loading,
  disabled,
  style,
}) => {
  const { colors } = useThemeStore();
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      style={[
        styles.outlineBtn,
        { borderColor: colors.border, backgroundColor: colors.bgCard },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={colors.accent} />
      ) : (
        <>
          {icon && (
            <Ionicons name={icon} size={18} color={colors.textPrimary} style={{ marginRight: 8 }} />
          )}
          <Text style={[styles.outlineBtnText, { color: colors.textPrimary }]}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

// ─── Input Field ───
interface InputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric';
  icon?: keyof typeof Ionicons.glyphMap;
  error?: string;
  style?: ViewStyle;
}

export const InputField: React.FC<InputProps> = ({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry,
  keyboardType,
  icon,
  error,
  style,
}) => {
  const { colors } = useThemeStore();
  const [showPassword, setShowPassword] = React.useState(false);
  const [focused, setFocused] = React.useState(false);

  return (
    <View style={[{ gap: 6 }, style]}>
      {label && (
        <Text style={[Typography.label, { color: colors.textSecondary }]}>{label}</Text>
      )}
      <View
        style={[
          styles.inputWrapper,
          {
            backgroundColor: colors.bgInput,
            borderColor: focused ? colors.accent : error ? colors.error : colors.border,
          },
        ]}
      >
        {icon && (
          <Ionicons
            name={icon}
            size={18}
            color={colors.textMuted}
            style={{ marginRight: 10 }}
          />
        )}
        <TextInput
          style={[styles.input, { color: colors.textPrimary }]}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry && !showPassword}
          keyboardType={keyboardType}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        {secureTextEntry && (
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Ionicons
              name={showPassword ? 'eye-off' : 'eye'}
              size={20}
              color={colors.textMuted}
            />
          </TouchableOpacity>
        )}
      </View>
      {error && (
        <Text style={[Typography.captionSm, { color: colors.error }]}>{error}</Text>
      )}
    </View>
  );
};

// ─── Card ───
interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
}

export const Card: React.FC<CardProps> = ({ children, style, onPress }) => {
  const { colors } = useThemeStore();
  const cardStyle: ViewStyle = {
    backgroundColor: colors.bgCard,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  };

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={[cardStyle, style]}>
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={[cardStyle, style]}>{children}</View>;
};

// ─── Badge ───
interface BadgeProps {
  label: string;
  variant: 'easy' | 'medium' | 'hard' | 'accent' | 'success' | 'warning';
}

export const Badge: React.FC<BadgeProps> = ({ label, variant }) => {
  const { colors } = useThemeStore();
  const variantStyles: Record<string, { bg: string; text: string }> = {
    easy: { bg: colors.successBg, text: colors.success },
    medium: { bg: colors.warningBg, text: colors.warning },
    hard: { bg: colors.errorBg, text: colors.error },
    accent: { bg: colors.accentBg, text: colors.accent },
    success: { bg: colors.successBg, text: colors.success },
    warning: { bg: colors.warningBg, text: colors.warning },
  };

  const s = variantStyles[variant] || variantStyles.accent;

  return (
    <View style={[styles.badge, { backgroundColor: s.bg }]}>
      <Text style={[Typography.badge, { color: s.text }]}>{label}</Text>
    </View>
  );
};

// ─── Avatar ───
interface AvatarProps {
  name: string;
  size?: number;
  uri?: string;
}

export const Avatar: React.FC<AvatarProps> = ({ name, size = 44, uri }) => {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <LinearGradient
      colors={Gradients.primary}
      style={[
        styles.avatar,
        { width: size, height: size, borderRadius: size / 2 },
      ]}
    >
      <Text style={{ color: '#fff', fontWeight: '700', fontSize: size * 0.38 }}>
        {initials}
      </Text>
    </LinearGradient>
  );
};

// ─── Section Title ───
interface SectionTitleProps {
  title: string;
  seeAll?: string;
  onSeeAll?: () => void;
}

export const SectionTitle: React.FC<SectionTitleProps> = ({ title, seeAll, onSeeAll }) => {
  const { colors } = useThemeStore();
  return (
    <View style={styles.sectionTitle}>
      <Text style={[Typography.h4, { color: colors.textPrimary }]}>{title}</Text>
      {seeAll && (
        <TouchableOpacity onPress={onSeeAll}>
          <Text style={[Typography.bodySm, { color: colors.accent }]}>{seeAll}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

// ─── Search Bar ───
interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({ value, onChangeText, placeholder }) => {
  const { colors } = useThemeStore();
  return (
    <View
      style={[
        styles.searchBar,
        { backgroundColor: colors.bgCard, borderColor: colors.border },
      ]}
    >
      <Ionicons name="search" size={18} color={colors.textMuted} />
      <TextInput
        style={[styles.searchInput, { color: colors.textPrimary }]}
        placeholder={placeholder || 'Search...'}
        placeholderTextColor={colors.textMuted}
        value={value}
        onChangeText={onChangeText}
      />
      {value.length > 0 && (
        <TouchableOpacity onPress={() => onChangeText('')}>
          <Ionicons name="close" size={18} color={colors.textMuted} />
        </TouchableOpacity>
      )}
    </View>
  );
};

// ─── Score Bar ───
interface ScoreBarProps {
  label: string;
  value: number;
  maxValue?: number;
  gradient?: readonly string[];
}

export const ScoreBar: React.FC<ScoreBarProps> = ({
  label,
  value,
  maxValue = 9,
  gradient = Gradients.primary,
}) => {
  const { colors } = useThemeStore();
  const pct = (value / maxValue) * 100;

  return (
    <View style={styles.scoreRow}>
      <Text style={[Typography.bodySm, { color: colors.textSecondary, width: 128 }]}>
        {label}
      </Text>
      <View style={[styles.scoreBarBg, { backgroundColor: colors.bgInput }]}>
        <LinearGradient
          colors={gradient as any}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.scoreBarFill, { width: `${pct}%` }]}
        />
      </View>
      <Text style={[Typography.h4, { width: 30, textAlign: 'right', color: colors.textPrimary }]}>
        {value.toFixed(1)}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  primaryBtn: {
    paddingVertical: 15,
    borderRadius: BorderRadius.xl, // Changed to 16
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0D9488',
    shadowOffset: { width: 0, height: 6 }, // Softer, deeper shadow
    shadowOpacity: 0.2, // More subtle
    shadowRadius: 20,
    elevation: 6,
  },
  primaryBtnText: {
    color: '#fff',
    ...Typography.button,
  },
  outlineBtn: {
    paddingVertical: 13,
    borderRadius: BorderRadius.xl, // Changed to 16
    borderWidth: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  outlineBtnText: {
    ...Typography.bodyMedium,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: BorderRadius.xl, // Changed to 16
    borderWidth: 1.5,
  },
  input: {
    flex: 1,
    fontSize: 15,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.pill,
    alignSelf: 'flex-start',
  },
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: BorderRadius.md,
    paddingHorizontal: 14,
    borderWidth: 1,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  scoreBarBg: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  scoreBarFill: {
    height: '100%',
    borderRadius: 4,
  },
});
