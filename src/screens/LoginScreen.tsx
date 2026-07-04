import React, { useState } from 'react';
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
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AuthTextField from '../components/AuthTextField';
import { colors, fonts, radii, shadows, spacing } from '../theme/theme';
import { useAuth } from '../context/AuthContext';
import type { AuthStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<AuthStackParamList, 'Login'>;

export default function LoginScreen() {
  const navigation = useNavigation<Nav>();
  const { signIn, signInWithGoogle } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSignIn = async () => {
    setError(null);
    setSubmitting(true);
    const errorMessage = await signIn(email, password);
    setSubmitting(false);
    if (errorMessage) {
      setError(errorMessage);
    }
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
          <Text style={styles.tagline}>Start your next chapter together.</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.headline}>Welcome Back</Text>
          <Text style={styles.subtext}>Sign in to continue your story.</Text>

          <View style={styles.fields}>
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
              rightSlot={
                <Pressable
                  onPress={() =>
                    Alert.alert(
                      'Reset link sent',
                      "If an account exists for this email, we've sent instructions. (Demo only — no email is actually sent.)"
                    )
                  }
                  hitSlop={8}
                >
                  <Text style={styles.forgotLink}>Forgot?</Text>
                </Pressable>
              }
            />
            {error && <Text style={styles.errorText}>{error}</Text>}
          </View>

          <Pressable
            style={[styles.primaryButton, submitting && styles.primaryButtonDisabled]}
            onPress={handleSignIn}
            disabled={submitting}
          >
            <Text style={styles.primaryButtonText}>{submitting ? 'SIGNING IN...' : 'SIGN IN'}</Text>
            {!submitting && <MaterialIcons name="arrow-forward" size={18} color={colors.onPrimary} />}
          </Pressable>

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          <Pressable style={styles.googleButton} onPress={signInWithGoogle}>
            <MaterialCommunityIcons name="google" size={20} color="#4285F4" />
            <Text style={styles.googleButtonText}>Continue with Google</Text>
          </Pressable>

          <View style={styles.signUpRow}>
            <Text style={styles.signUpText}>New here? </Text>
            <Pressable onPress={() => navigation.navigate('SignUp')} hitSlop={8}>
              <Text style={styles.signUpLink}>Join the Journey</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.quoteRow}>
          <MaterialIcons name="favorite" size={16} color={colors.primary} style={{ opacity: 0.6 }} />
          <Text style={styles.quoteText}>"Start your next chapter together."</Text>
        </View>

        <View style={styles.footer}>
          <View style={styles.footerIcons}>
            <MaterialIcons name="auto-awesome" size={20} color={colors.outline} />
            <MaterialIcons name="loyalty" size={20} color={colors.outline} />
            <MaterialIcons name="star-border" size={20} color={colors.outline} />
          </View>
          <Text style={styles.footerText}>© OUR JOURNEY 2024</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingHorizontal: spacing.marginMobile,
    paddingTop: 72,
    paddingBottom: 48,
  },
  wordmarkBlock: {
    alignItems: 'center',
    marginBottom: spacing.stackLg,
  },
  wordmark: {
    fontFamily: fonts.display,
    fontSize: 34,
    color: colors.primary,
    textAlign: 'center',
  },
  tagline: {
    fontFamily: fonts.body,
    fontStyle: 'italic',
    fontSize: 16,
    color: colors.onSurfaceVariant,
    marginTop: 8,
    textAlign: 'center',
  },
  card: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radii.xxl,
    padding: 28,
    ...shadows.sunsetGlow,
  },
  headline: {
    fontFamily: fonts.display,
    fontSize: 28,
    color: colors.onSurface,
  },
  subtext: {
    fontFamily: fonts.body,
    fontSize: 16,
    color: colors.onSurfaceVariant,
    marginTop: 6,
    marginBottom: spacing.stackLg,
  },
  fields: {
    gap: 20,
  },
  forgotLink: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 12,
    color: colors.primary,
  },
  errorText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: colors.error,
    marginTop: -8,
  },
  primaryButton: {
    marginTop: spacing.stackLg,
    backgroundColor: colors.primary,
    borderRadius: radii.full,
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
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
    color: colors.onPrimary,
    letterSpacing: 0.8,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.outlineVariant,
  },
  dividerText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 12,
    color: colors.outline,
    letterSpacing: 1.5,
    marginHorizontal: 12,
  },
  googleButton: {
    backgroundColor: colors.surfaceContainer,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radii.full,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  googleButtonText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 15,
    color: colors.onSurface,
  },
  signUpRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 28,
  },
  signUpText: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.onSurfaceVariant,
  },
  signUpLink: {
    fontFamily: fonts.bodyBold,
    fontSize: 15,
    color: colors.primary,
  },
  quoteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: spacing.stackLg,
  },
  quoteText: {
    fontFamily: fonts.body,
    fontStyle: 'italic',
    fontSize: 14,
    color: colors.primary,
    opacity: 0.6,
  },
  footer: {
    alignItems: 'center',
    marginTop: 48,
    opacity: 0.4,
  },
  footerIcons: {
    flexDirection: 'row',
    gap: 28,
    marginBottom: 12,
  },
  footerText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 11,
    color: colors.outline,
    letterSpacing: 3,
  },
});
