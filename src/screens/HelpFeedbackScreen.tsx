import React, { useMemo, useState } from 'react';
import { Alert, Linking, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AppHeader from '../components/AppHeader';
import { useTheme } from '../context/ThemeContext';
import type { Theme } from '../theme/theme';
import type { RootStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type IconName = React.ComponentProps<typeof MaterialIcons>['name'];
type FeedbackType = 'feature' | 'bug';

const SUPPORT_EMAIL = 'hello@ourjourney.app';

const TOPICS: { icon: IconName; title: string; tip: string }[] = [
  {
    icon: 'favorite',
    title: 'Planning your first date',
    tip: 'Tap the + button on the Dates tab to build a day stop by stop — set a time, pick an activity, and search for the spot right on the map. Add as many stops as you like before saving.',
  },
  {
    icon: 'group',
    title: 'Sharing with your partner',
    tip: 'Open Relationship Details from your Profile to generate an invite code. Once your partner redeems it, every date, stop, and bucket-list item stays in sync between you both automatically.',
  },
  {
    icon: 'credit-card',
    title: 'Subscription help',
    tip: 'Membership questions? Head to the Journey+ card on your Profile tab for details on your plan.',
  },
];

function buildMailtoUrl(to: string, subject: string, body?: string): string {
  const params = [`subject=${encodeURIComponent(subject)}`];
  if (body) params.push(`body=${encodeURIComponent(body)}`);
  return `mailto:${to}?${params.join('&')}`;
}

export default function HelpFeedbackScreen() {
  const navigation = useNavigation<Nav>();
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  const [expandedTopic, setExpandedTopic] = useState<string | null>(null);
  const [feedbackType, setFeedbackType] = useState<FeedbackType | null>(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [rating, setRating] = useState(0);

  const handleStartChat = () => {
    Alert.alert('Coming soon', 'Live chat is coming soon — email us in the meantime.');
  };

  const handleSendEmail = () => {
    Linking.openURL(buildMailtoUrl(SUPPORT_EMAIL, 'Support Request')).catch(() => undefined);
  };

  const handleSubmitFeedback = () => {
    if (!feedbackType) {
      Alert.alert('Almost there', 'Let us know if this is a feature suggestion or a bug report.');
      return;
    }
    if (!feedbackText.trim()) {
      Alert.alert('Almost there', 'Tell us a bit more before sending.');
      return;
    }
    const subject = feedbackType === 'feature' ? 'Feature Suggestion' : 'Bug Report';
    Linking.openURL(buildMailtoUrl(SUPPORT_EMAIL, subject, feedbackText.trim())).catch(() => undefined);
  };

  return (
    <View style={styles.screen}>
      <AppHeader
        title="Help & Feedback"
        leftIcon="arrow-back"
        onLeftPress={() => navigation.goBack()}
        rightIcon="close"
        onRightPress={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>How can we help you?</Text>
          <Text style={styles.heroSubtitle}>Our support team is always here for your journey.</Text>
        </View>

        <View>
          <Text style={styles.sectionLabel}>COMMON TOPICS</Text>
          <View style={styles.topicsList}>
            {TOPICS.map((topic) => {
              const expanded = expandedTopic === topic.title;
              return (
                <Pressable
                  key={topic.title}
                  style={styles.topicCard}
                  onPress={() => setExpandedTopic(expanded ? null : topic.title)}
                >
                  <View style={styles.topicHeader}>
                    <View style={styles.topicIcon}>
                      <MaterialIcons name={topic.icon} size={22} color={theme.colors.primary} />
                    </View>
                    <Text style={styles.topicTitle}>{topic.title}</Text>
                    <MaterialIcons
                      name={expanded ? 'expand-less' : 'expand-more'}
                      size={22}
                      color={theme.colors.outline}
                    />
                  </View>
                  {expanded && <Text style={styles.topicTip}>{topic.tip}</Text>}
                </Pressable>
              );
            })}
          </View>
        </View>

        <View>
          <Text style={styles.sectionLabel}>GET IN TOUCH</Text>
          <View style={styles.channelsColumn}>
            <View style={styles.chatCard}>
              <Text style={styles.chatTitle}>Chat with us</Text>
              <Text style={styles.chatSubtitle}>Live support available 9am–6pm PST</Text>
              <Pressable style={styles.chatButton} onPress={handleStartChat}>
                <Text style={styles.chatButtonText}>Start Conversation</Text>
              </Pressable>
              <MaterialIcons
                name="forum"
                size={96}
                color="rgba(255,255,255,0.15)"
                style={styles.channelIconDecoration}
              />
            </View>
            <View style={styles.emailCard}>
              <Text style={styles.emailTitle}>Email Support</Text>
              <Text style={styles.emailSubtitle}>Expected response within 24 hours</Text>
              <Pressable style={styles.emailButton} onPress={handleSendEmail}>
                <Text style={styles.emailButtonText}>Send Email</Text>
              </Pressable>
              <MaterialIcons
                name="mail"
                size={96}
                color={theme.colors.surfaceContainerHighest}
                style={styles.channelIconDecoration}
              />
            </View>
          </View>
        </View>

        <View>
          <Text style={styles.sectionLabel}>WE VALUE YOUR INPUT</Text>
          <View style={styles.feedbackCard}>
            <View style={styles.feedbackToggleRow}>
              <Pressable
                style={[styles.feedbackToggle, feedbackType === 'feature' && styles.feedbackToggleActive]}
                onPress={() => setFeedbackType('feature')}
              >
                <MaterialIcons
                  name="lightbulb"
                  size={16}
                  color={feedbackType === 'feature' ? theme.colors.onPrimary : theme.colors.onSurfaceVariant}
                />
                <Text
                  style={[
                    styles.feedbackToggleText,
                    feedbackType === 'feature' && styles.feedbackToggleTextActive,
                  ]}
                >
                  Suggest a feature
                </Text>
              </Pressable>
              <Pressable
                style={[styles.feedbackToggle, feedbackType === 'bug' && styles.feedbackToggleActiveError]}
                onPress={() => setFeedbackType('bug')}
              >
                <MaterialIcons
                  name="report"
                  size={16}
                  color={feedbackType === 'bug' ? theme.colors.onError : theme.colors.onSurfaceVariant}
                />
                <Text
                  style={[styles.feedbackToggleText, feedbackType === 'bug' && styles.feedbackToggleTextActiveError]}
                >
                  Report an issue
                </Text>
              </Pressable>
            </View>
            <TextInput
              style={styles.feedbackInput}
              placeholder="Tell us more..."
              placeholderTextColor={theme.colors.outlineVariant}
              multiline
              numberOfLines={4}
              value={feedbackText}
              onChangeText={setFeedbackText}
            />
            <Pressable style={styles.submitButton} onPress={handleSubmitFeedback}>
              <Text style={styles.submitButtonText}>Submit Feedback</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.ratingCard}>
          <Text style={styles.ratingTitle}>Love using Our Journey?</Text>
          <Text style={styles.ratingSubtitle}>Your ratings help us bloom and support more couples.</Text>
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((value) => (
              <Pressable key={value} onPress={() => setRating(value)} hitSlop={6}>
                <MaterialIcons
                  name={value <= rating ? 'star' : 'star-border'}
                  size={36}
                  color={theme.colors.onTertiaryContainer}
                />
              </Pressable>
            ))}
          </View>
          <Text style={styles.ratingLabel}>RATE OUR JOURNEY</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      paddingHorizontal: theme.spacing.marginMobile,
      paddingTop: theme.spacing.stackLg,
      paddingBottom: 48,
      gap: theme.spacing.stackLg,
    },
    hero: {
      alignItems: 'center',
      gap: 6,
    },
    heroTitle: {
      fontFamily: theme.fonts.display,
      fontSize: 26,
      color: theme.colors.primary,
      textAlign: 'center',
    },
    heroSubtitle: {
      fontFamily: theme.fonts.body,
      fontSize: 14,
      color: theme.colors.onSurfaceVariant,
      textAlign: 'center',
      opacity: 0.8,
    },
    sectionLabel: {
      fontFamily: theme.fonts.bodySemiBold,
      fontSize: 13,
      color: theme.colors.primary,
      letterSpacing: 1,
      marginBottom: 8,
      marginLeft: 4,
    },
    topicsList: {
      gap: 12,
    },
    topicCard: {
      backgroundColor: theme.colors.surfaceContainerLowest,
      borderRadius: theme.radii.xl,
      padding: 16,
      borderWidth: 1,
      borderColor: 'rgba(219,193,186,0.3)',
      ...theme.shadows.sunsetGlow,
    },
    topicHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    topicIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.colors.primaryFixed,
      alignItems: 'center',
      justifyContent: 'center',
    },
    topicTitle: {
      flex: 1,
      fontFamily: theme.fonts.display,
      fontSize: 16,
      color: theme.colors.onSurface,
    },
    topicTip: {
      fontFamily: theme.fonts.body,
      fontSize: 13,
      color: theme.colors.onSurfaceVariant,
      lineHeight: 19,
      marginTop: 12,
    },
    channelsColumn: {
      gap: 16,
    },
    chatCard: {
      backgroundColor: theme.colors.primary,
      borderRadius: theme.radii.xl,
      padding: 24,
      minHeight: 150,
      overflow: 'hidden',
    },
    chatTitle: {
      fontFamily: theme.fonts.display,
      fontSize: 19,
      color: theme.colors.onPrimary,
      marginBottom: 4,
    },
    chatSubtitle: {
      fontFamily: theme.fonts.body,
      fontSize: 13,
      color: 'rgba(255,255,255,0.9)',
    },
    chatButton: {
      alignSelf: 'flex-start',
      marginTop: 20,
      backgroundColor: theme.colors.onPrimary,
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: theme.radii.full,
    },
    chatButtonText: {
      fontFamily: theme.fonts.bodySemiBold,
      fontSize: 13,
      color: theme.colors.primary,
    },
    emailCard: {
      backgroundColor: theme.colors.surfaceContainerHigh,
      borderRadius: theme.radii.xl,
      padding: 24,
      minHeight: 150,
      borderWidth: 1,
      borderColor: theme.colors.outlineVariant,
      overflow: 'hidden',
    },
    emailTitle: {
      fontFamily: theme.fonts.display,
      fontSize: 19,
      color: theme.colors.onSurface,
      marginBottom: 4,
    },
    emailSubtitle: {
      fontFamily: theme.fonts.body,
      fontSize: 13,
      color: theme.colors.onSurfaceVariant,
    },
    emailButton: {
      alignSelf: 'flex-start',
      marginTop: 20,
      backgroundColor: theme.colors.surfaceContainerHighest,
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: theme.radii.full,
      borderWidth: 1,
      borderColor: theme.colors.outlineVariant,
    },
    emailButtonText: {
      fontFamily: theme.fonts.bodySemiBold,
      fontSize: 13,
      color: theme.colors.onSurface,
    },
    channelIconDecoration: {
      position: 'absolute',
      right: -16,
      bottom: -16,
    },
    feedbackCard: {
      backgroundColor: theme.colors.surfaceContainerLowest,
      borderRadius: theme.radii.xl,
      padding: 20,
      gap: 16,
      borderWidth: 1,
      borderColor: 'rgba(219,193,186,0.3)',
      ...theme.shadows.sunsetGlow,
    },
    feedbackToggleRow: {
      flexDirection: 'row',
      gap: 8,
    },
    feedbackToggle: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      paddingVertical: 12,
      borderRadius: theme.radii.lg,
      borderWidth: 1,
      borderColor: theme.colors.outlineVariant,
    },
    feedbackToggleActive: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    feedbackToggleActiveError: {
      backgroundColor: theme.colors.error,
      borderColor: theme.colors.error,
    },
    feedbackToggleText: {
      fontFamily: theme.fonts.bodySemiBold,
      fontSize: 12,
      color: theme.colors.onSurfaceVariant,
    },
    feedbackToggleTextActive: {
      color: theme.colors.onPrimary,
    },
    feedbackToggleTextActiveError: {
      color: theme.colors.onError,
    },
    feedbackInput: {
      backgroundColor: theme.colors.surfaceContainerLow,
      borderRadius: theme.radii.lg,
      borderWidth: 1,
      borderColor: theme.colors.outlineVariant,
      padding: 14,
      minHeight: 100,
      textAlignVertical: 'top',
      fontFamily: theme.fonts.body,
      fontSize: 14,
      color: theme.colors.onSurface,
    },
    submitButton: {
      backgroundColor: theme.colors.primary,
      borderRadius: theme.radii.full,
      paddingVertical: 16,
      alignItems: 'center',
    },
    submitButtonText: {
      fontFamily: theme.fonts.bodySemiBold,
      fontSize: 14,
      color: theme.colors.onPrimary,
    },
    ratingCard: {
      backgroundColor: theme.colors.tertiaryContainer,
      borderRadius: theme.radii.xl,
      padding: 28,
      alignItems: 'center',
    },
    ratingTitle: {
      fontFamily: theme.fonts.display,
      fontSize: 19,
      color: theme.colors.onTertiaryContainer,
      textAlign: 'center',
      marginBottom: 6,
    },
    ratingSubtitle: {
      fontFamily: theme.fonts.body,
      fontSize: 13,
      color: theme.colors.onTertiaryContainer,
      opacity: 0.9,
      textAlign: 'center',
      marginBottom: 16,
    },
    starsRow: {
      flexDirection: 'row',
      gap: 8,
      marginBottom: 16,
    },
    ratingLabel: {
      fontFamily: theme.fonts.bodySemiBold,
      fontSize: 12,
      color: theme.colors.onTertiaryContainer,
      letterSpacing: 1.5,
    },
  });
