import React, { useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import PickerField from './PickerField';
import { colors, fonts, radii, shadows } from '../theme/theme';
import { useAuth } from '../context/AuthContext';
import { friendlyNameFromEmail } from '../utils/format';

interface InvitePartnerModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function InvitePartnerModal({ visible, onClose }: InvitePartnerModalProps) {
  const { partner, isPartnered, createInvite, redeemInvite, refreshJourney, anniversaryDate, updateAnniversaryDate } =
    useAuth();
  const partnerName = partner
    ? partner.displayName || friendlyNameFromEmail(partner.email) || 'Your Partner'
    : null;

  const [anniversaryError, setAnniversaryError] = useState<string | null>(null);
  const anniversaryDateValue = anniversaryDate ? new Date(`${anniversaryDate}T00:00:00`) : new Date();

  const handleAnniversaryChange = async (date: Date) => {
    setAnniversaryError(null);
    const iso = date.toISOString().slice(0, 10);
    const errorMessage = await updateAnniversaryDate(iso);
    if (errorMessage) setAnniversaryError(errorMessage);
  };

  const [code, setCode] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);

  const [joinCode, setJoinCode] = useState('');
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);

  const [checking, setChecking] = useState(false);

  const handleGenerate = async () => {
    setGenerating(true);
    setGenerateError(null);
    const result = await createInvite();
    setGenerating(false);
    if (result.error) {
      setGenerateError(result.error);
      return;
    }
    setCode(result.code);
  };

  const handleShare = async () => {
    if (!code) return;
    try {
      await Share.share({
        message: `Join me on Our Journey! Enter this invite code in the app: ${code}`,
      });
    } catch (err) {
      console.warn('Share failed', err);
    }
  };

  const handleCheckStatus = async () => {
    setChecking(true);
    await refreshJourney();
    setChecking(false);
  };

  const handleJoin = async () => {
    if (!joinCode.trim()) return;
    setJoining(true);
    setJoinError(null);
    const errorMessage = await redeemInvite(joinCode.trim());
    setJoining(false);
    if (errorMessage) {
      setJoinError(errorMessage);
      return;
    }
    setJoinCode('');
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable hitSlop={10} onPress={onClose} style={styles.headerButton}>
            <MaterialIcons name="close" size={22} color={colors.primary} />
          </Pressable>
          <Text style={styles.headerTitle}>Relationship Details</Text>
          <View style={styles.headerButton} />
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Anniversary Date</Text>
            <Text style={styles.cardSubtitle}>The day that started it all — we'll help you celebrate it.</Text>
            <PickerField mode="date" value={anniversaryDateValue} onChange={handleAnniversaryChange}>
              <View style={styles.anniversaryRow}>
                <MaterialIcons name="cake" size={18} color={colors.primary} />
                <Text style={styles.anniversaryText}>
                  {anniversaryDate
                    ? anniversaryDateValue.toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })
                    : 'Not set yet — tap to choose'}
                </Text>
              </View>
            </PickerField>
            {anniversaryError && <Text style={styles.errorText}>{anniversaryError}</Text>}
          </View>

          {isPartnered ? (
            <View style={styles.partneredCard}>
              <MaterialIcons name="favorite" size={28} color={colors.primary} />
              <Text style={styles.partneredTitle}>You're sharing your journey with</Text>
              <Text style={styles.partneredName}>{partnerName}</Text>
              <Text style={styles.partneredHint}>Every date you plan together shows up for both of you.</Text>
            </View>
          ) : (
            <>
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Invite Your Partner</Text>
                <Text style={styles.cardSubtitle}>
                  Share a code so your partner can join your journey — every date you've planned comes with
                  them.
                </Text>

                {code ? (
                  <>
                    <View style={styles.codeBox}>
                      <Text style={styles.codeText}>{code}</Text>
                    </View>
                    <Pressable style={styles.primaryButton} onPress={handleShare}>
                      <MaterialIcons name="ios-share" size={18} color={colors.onPrimary} />
                      <Text style={styles.primaryButtonText}>SHARE INVITE</Text>
                    </Pressable>
                    <Pressable style={styles.secondaryButton} onPress={handleCheckStatus} disabled={checking}>
                      {checking ? (
                        <ActivityIndicator size="small" color={colors.primary} />
                      ) : (
                        <Text style={styles.secondaryButtonText}>Check if they've joined</Text>
                      )}
                    </Pressable>
                  </>
                ) : (
                  <Pressable style={styles.primaryButton} onPress={handleGenerate} disabled={generating}>
                    {generating ? (
                      <ActivityIndicator size="small" color={colors.onPrimary} />
                    ) : (
                      <Text style={styles.primaryButtonText}>GENERATE INVITE CODE</Text>
                    )}
                  </Pressable>
                )}
                {generateError && <Text style={styles.errorText}>{generateError}</Text>}
              </View>

              <View style={styles.dividerRow}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>OR</Text>
                <View style={styles.dividerLine} />
              </View>

              <View style={styles.card}>
                <Text style={styles.cardTitle}>Have a Code?</Text>
                <Text style={styles.cardSubtitle}>Enter the code your partner shared with you.</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. 7F3KQ2"
                  placeholderTextColor={colors.outlineVariant}
                  value={joinCode}
                  onChangeText={(text) => {
                    setJoinCode(text);
                    if (joinError) setJoinError(null);
                  }}
                  autoCapitalize="characters"
                  autoCorrect={false}
                />
                {joinError && <Text style={styles.errorText}>{joinError}</Text>}
                <Pressable style={styles.primaryButton} onPress={handleJoin} disabled={joining}>
                  {joining ? (
                    <ActivityIndicator size="small" color={colors.onPrimary} />
                  ) : (
                    <Text style={styles.primaryButtonText}>JOIN THEIR JOURNEY</Text>
                  )}
                </Pressable>
              </View>
            </>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: 56,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: fonts.display,
    fontSize: 20,
    color: colors.primary,
  },
  content: {
    paddingHorizontal: 20,
    gap: 20,
  },
  card: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radii.xxl,
    padding: 24,
    gap: 14,
    ...shadows.sunsetGlow,
  },
  cardTitle: {
    fontFamily: fonts.display,
    fontSize: 22,
    color: colors.onSurface,
  },
  cardSubtitle: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.onSurfaceVariant,
    marginTop: -6,
  },
  codeBox: {
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radii.lg,
    paddingVertical: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  anniversaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radii.lg,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  anniversaryText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 15,
    color: colors.onSurface,
  },
  codeText: {
    fontFamily: fonts.display,
    fontSize: 32,
    letterSpacing: 6,
    color: colors.primary,
  },
  input: {
    backgroundColor: colors.surfaceContainerLow,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radii.xl,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontFamily: fonts.bodySemiBold,
    fontSize: 18,
    letterSpacing: 2,
    color: colors.onSurface,
    textAlign: 'center',
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: radii.full,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryButtonText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
    color: colors.onPrimary,
    letterSpacing: 0.8,
  },
  secondaryButton: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: colors.primary,
  },
  errorText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: colors.error,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
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
  partneredCard: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radii.xxl,
    padding: 32,
    alignItems: 'center',
    gap: 8,
    ...shadows.sunsetGlow,
  },
  partneredTitle: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.onSurfaceVariant,
    marginTop: 8,
  },
  partneredName: {
    fontFamily: fonts.display,
    fontSize: 24,
    color: colors.primary,
  },
  partneredHint: {
    fontFamily: fonts.body,
    fontSize: 13,
    fontStyle: 'italic',
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    marginTop: 8,
  },
});
