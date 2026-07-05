import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import type { Theme } from '../theme/theme';

type IconName = React.ComponentProps<typeof MaterialIcons>['name'];

interface AuthTextFieldProps {
  label: string;
  icon: IconName;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  onToggleSecure?: () => void;
  keyboardType?: TextInputProps['keyboardType'];
  autoCapitalize?: TextInputProps['autoCapitalize'];
  rightSlot?: React.ReactNode;
}

export default function AuthTextField({
  label,
  icon,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  onToggleSecure,
  keyboardType,
  autoCapitalize,
  rightSlot,
}: AuthTextFieldProps) {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  return (
    <View style={styles.wrap}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label}</Text>
        {rightSlot}
      </View>
      <View style={styles.inputWrap}>
        <MaterialIcons name={icon} size={20} color={theme.colors.outline} style={styles.leadingIcon} />
        <TextInput
          style={[styles.input, onToggleSecure ? styles.inputWithTrailingIcon : null]}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.outlineVariant}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize ?? 'none'}
          autoCorrect={false}
        />
        {onToggleSecure && (
          <Pressable style={styles.trailingIcon} onPress={onToggleSecure} hitSlop={8}>
            <MaterialIcons
              name={secureTextEntry ? 'visibility' : 'visibility-off'}
              size={20}
              color={theme.colors.outline}
            />
          </Pressable>
        )}
      </View>
    </View>
  );
}

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    wrap: {
      gap: 8,
    },
    labelRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 4,
    },
    label: {
      fontFamily: theme.fonts.bodySemiBold,
      fontSize: 14,
      color: theme.colors.onSurfaceVariant,
    },
    inputWrap: {
      position: 'relative',
      justifyContent: 'center',
    },
    leadingIcon: {
      position: 'absolute',
      left: 16,
      zIndex: 1,
    },
    trailingIcon: {
      position: 'absolute',
      right: 16,
    },
    input: {
      backgroundColor: theme.colors.surfaceContainerLow,
      borderWidth: 1,
      borderColor: theme.colors.outlineVariant,
      borderRadius: theme.radii.xl,
      paddingVertical: 16,
      paddingLeft: 48,
      paddingRight: 16,
      fontFamily: theme.fonts.body,
      fontSize: 16,
      color: theme.colors.onSurface,
    },
    inputWithTrailingIcon: {
      paddingRight: 48,
    },
  });
