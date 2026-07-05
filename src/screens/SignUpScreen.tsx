import React, { useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AuthTextField from '../components/AuthTextField';
import { useTheme } from '../context/ThemeContext';
import type { Theme } from '../theme/theme';
import { useAuth } from '../context/AuthContext';
import type { AuthStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<AuthStackParamList, 'SignUp'>;

export default function SignUpScreen() {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const navigation = useNavigation<Nav>();
  const { signUp } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSignUp = async () => {
    setError(null);
    setSubmitting(true);
    const { error: signUpError, needsEmailConfirmation } = await signUp(email, password, name);
    setSubmitting(false);
    if (signUpError) {
      setError(signUpError);
      return;
    }
    if (needsEmailConfirmation) {
      Alert.alert(
        'Check your email',
        "We've sent a confirmation link to finish creating your account. Sign in once you've confirmed it.",
        [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
      );
    }
    // If a session came back immediately (email confirmation disabled),
    // RootNavigator will swap to the authenticated stack on its own.
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.wordmarkBlock}>
          <Text style={styles.wordmark}>Our Journey</Text>
          <Text style={styles.tagline}>Every chapter starts with a first date.</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.headline}>Join the Journey</Text>
          <Text style={styles.subtext}>Begin your story together.</Text>

          <View style={styles.fields}>
            <AuthTextField
              label="YOUR NAME"
              icon="person-outline"
              value={name}
              onChangeText={setName}
              placeholder="e.g. Jamie"
              autoCapitalize="words"
            />
            <AuthTextField
              label="EMAIL ADDRESS"
              icon="mail"
              value={email}
              onChangeText={setEmail}
              placeholder="hello@ourjourney.com"
              keyboardType="email-address"
            />
            <AuthTextField
              label="PASSWORD"
              icon="lock"
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              secureTextEntry={!showPassword}
              onToggleSecure={() => setShowPassword((v) => !v)}
            />
            {error && <Text style={styles.errorText}>{error}</Text>}
          </View>

          <Pressable
            style={[styles.primaryButton, submitting && styles.primaryButtonDisabled]}
            onPress={handleSignUp}
            disabled={submitting}
          >
            <Text style={styles.primaryButtonText}>
              {submitting ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT'}
            </Text>
            {!submitting && <MaterialIcons name="arrow-forward" size={18} color={theme.colors.onPrimary} />}
          </Pressable>

          <View style={styles.signInRow}>
            <Text style={styles.signInText}>Already have an account? </Text>
            <Pressable onPress={() => navigation.navigate('Login')} hitSlop={8}>
              <Text style={styles.signInLink}>Sign In</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    scrollContent: {
      paddingHorizontal: theme.spacing.marginMobile,
      paddingTop: 72,
      paddingBottom: 48,
    },
    wordmarkBlock: {
      alignItems: 'center',
      marginBottom: theme.spacing.stackLg,
    },
    wordmark: {
      fontFamily: theme.fonts.display,
      fontSize: 34,
      color: theme.colors.primary,
      textAlign: 'center',
    },
    tagline: {
      fontFamily: theme.fonts.body,
      fontStyle: 'italic',
      fontSize: 16,
      color: theme.colors.onSurfaceVariant,
      marginTop: 8,
      textAlign: 'center',
    },
    card: {
      backgroundColor: theme.colors.surfaceContainerLowest,
      borderRadius: theme.radii.xxl,
      padding: 28,
      ...theme.shadows.sunsetGlow,
    },
    headline: {
      fontFamily: theme.fonts.display,
      fontSize: 28,
      color: theme.colors.onSurface,
    },
    subtext: {
      fontFamily: theme.fonts.body,
      fontSize: 16,
      color: theme.colors.onSurfaceVariant,
      marginTop: 6,
      marginBottom: theme.spacing.stackLg,
    },
    fields: {
      gap: 20,
    },
    errorText: {
      fontFamily: theme.fonts.bodyMedium,
      fontSize: 13,
      color: theme.colors.error,
      marginTop: -8,
    },
    primaryButton: {
      marginTop: theme.spacing.stackLg,
      backgroundColor: theme.colors.primary,
      borderRadius: theme.radii.full,
      paddingVertical: 16,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
    },
    primaryButtonDisabled: {
      opacity: 0.7,
    },
    primaryButtonText: {
      fontFamily: theme.fonts.bodySemiBold,
      fontSize: 14,
      color: theme.colors.onPrimary,
      letterSpacing: 0.8,
    },
    signInRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginTop: 28,
    },
    signInText: {
      fontFamily: theme.fonts.body,
      fontSize: 15,
      color: theme.colors.onSurfaceVariant,
    },
    signInLink: {
      fontFamily: theme.fonts.bodyBold,
      fontSize: 15,
      color: theme.colors.primary,
    },
  });
