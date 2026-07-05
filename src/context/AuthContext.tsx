import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

export interface JourneyMember {
  profileId: string;
  role: string;
  email: string | null;
  displayName: string | null;
  avatarUrl: string | null;
}

interface AuthContextValue {
  session: Session | null;
  isAuthenticated: boolean;
  userId: string | null;
  userEmail: string | null;
  journeyId: string | null;
  journeyMembers: JourneyMember[];
  partner: JourneyMember | null;
  isPartnered: boolean;
  anniversaryDate: string | null;
  isLoaded: boolean;
  signIn: (email: string, password: string) => Promise<string | null>;
  signUp: (
    email: string,
    password: string,
    displayName?: string
  ) => Promise<{ error: string | null; needsEmailConfirmation: boolean }>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  createInvite: () => Promise<{ code: string | null; error: string | null }>;
  redeemInvite: (code: string) => Promise<string | null>;
  updateAnniversaryDate: (date: string | null) => Promise<string | null>;
  updateAvatar: (url: string | null) => Promise<string | null>;
  refreshJourney: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [journeyId, setJourneyId] = useState<string | null>(null);
  const [journeyMembers, setJourneyMembers] = useState<JourneyMember[]>([]);
  const [anniversaryDate, setAnniversaryDate] = useState<string | null>(null);
  const [journeyVersion, setJourneyVersion] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setIsLoaded(true);
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });

    return () => subscription.subscription.unsubscribe();
  }, []);

  const loadJourney = useCallback(async (userId: string) => {
    const { data: membership, error: membershipError } = await supabase
      .from('journey_members')
      .select('journey_id')
      .eq('profile_id', userId)
      .limit(1)
      .maybeSingle();

    if (membershipError) {
      console.warn('Failed to load journey membership', membershipError);
      return;
    }

    const currentJourneyId = membership?.journey_id ?? null;
    setJourneyId(currentJourneyId);

    if (!currentJourneyId) {
      setJourneyMembers([]);
      setAnniversaryDate(null);
      return;
    }

    const { data: members, error: membersError } = await supabase
      .from('journey_members')
      .select('profile_id, role, profiles(email, display_name, avatar_url)')
      .eq('journey_id', currentJourneyId);

    if (membersError) {
      console.warn('Failed to load journey members', membersError);
    } else {
      setJourneyMembers(
        members.map((m) => ({
          profileId: m.profile_id,
          role: m.role,
          email: m.profiles?.email ?? null,
          displayName: m.profiles?.display_name ?? null,
          avatarUrl: m.profiles?.avatar_url ?? null,
        }))
      );
    }

    const { data: journey, error: journeyError } = await supabase
      .from('journeys')
      .select('anniversary_date')
      .eq('id', currentJourneyId)
      .single();

    if (journeyError) {
      console.warn('Failed to load journey details', journeyError);
      return;
    }
    setAnniversaryDate(journey?.anniversary_date ?? null);
  }, []);

  // Re-run whenever the signed-in user changes, or after a create/redeem
  // invite (journeyVersion bump) since that can change which journey — and
  // who else is in it — the user belongs to.
  useEffect(() => {
    const userId = session?.user.id;
    if (!userId) {
      setJourneyId(null);
      setJourneyMembers([]);
      return;
    }
    loadJourney(userId);
  }, [session?.user.id, journeyVersion, loadJourney]);

  const refreshJourney = useCallback(async () => {
    if (session?.user.id) await loadJourney(session.user.id);
  }, [session?.user.id, loadJourney]);

  // Live-update when a partner joins (or leaves) this journey, so the
  // inviter sees them appear without needing to back out and reopen.
  useEffect(() => {
    if (!journeyId) return;
    const channel = supabase
      .channel(`journey-members-${journeyId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'journey_members', filter: `journey_id=eq.${journeyId}` },
        () => refreshJourney()
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [journeyId, refreshJourney]);

  // Live-update when either partner edits shared journey details (e.g. the
  // anniversary date) so both clients stay in sync without a manual reload.
  useEffect(() => {
    if (!journeyId) return;
    const channel = supabase
      .channel(`journey-details-${journeyId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'journeys', filter: `id=eq.${journeyId}` },
        () => refreshJourney()
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [journeyId, refreshJourney]);

  const signIn = useCallback(async (email: string, password: string) => {
    if (!email.trim() || !password) return 'Enter both email and password to continue.';
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    return error?.message ?? null;
  }, []);

  const signUp = useCallback(async (email: string, password: string, displayName?: string) => {
    if (!email.trim() || !password) {
      return { error: 'Enter both email and password to continue.', needsEmailConfirmation: false };
    }
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: displayName?.trim() ? { data: { display_name: displayName.trim() } } : undefined,
    });
    if (error) return { error: error.message, needsEmailConfirmation: false };
    // If the project requires email confirmation, signUp succeeds but no
    // session is returned yet — the account (and its journey) already
    // exist server-side, they just can't sign in until they confirm.
    return { error: null, needsEmailConfirmation: !data.session };
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  // TODO(supabase): wire real Google OAuth here (requires configuring the
  // Google provider in the Supabase dashboard + an expo-auth-session redirect flow).
  const signInWithGoogle = useCallback(async () => {}, []);

  const createInvite = useCallback(async () => {
    const { data, error } = await supabase.rpc('create_invite');
    if (error) return { code: null, error: error.message };
    return { code: data, error: null };
  }, []);

  const redeemInvite = useCallback(async (code: string) => {
    const { error } = await supabase.rpc('redeem_invite', { p_code: code.trim().toUpperCase() });
    if (error) return error.message;
    setJourneyVersion((v) => v + 1);
    return null;
  }, []);

  const updateAnniversaryDate = useCallback(
    async (date: string | null) => {
      if (!journeyId) return 'You are not part of a journey yet.';
      const previous = anniversaryDate;
      setAnniversaryDate(date);
      const { error } = await supabase.from('journeys').update({ anniversary_date: date }).eq('id', journeyId);
      if (error) {
        setAnniversaryDate(previous);
        return error.message;
      }
      return null;
    },
    [journeyId, anniversaryDate]
  );

  const updateAvatar = useCallback(
    async (url: string | null) => {
      const currentUserId = session?.user.id;
      if (!currentUserId) return 'You need to be signed in to do that.';
      const previous = journeyMembers.find((m) => m.profileId === currentUserId)?.avatarUrl ?? null;
      setJourneyMembers((prev) =>
        prev.map((m) => (m.profileId === currentUserId ? { ...m, avatarUrl: url } : m))
      );
      const { error } = await supabase.from('profiles').update({ avatar_url: url }).eq('id', currentUserId);
      if (error) {
        setJourneyMembers((prev) =>
          prev.map((m) => (m.profileId === currentUserId ? { ...m, avatarUrl: previous } : m))
        );
        return error.message;
      }
      return null;
    },
    [session?.user.id, journeyMembers]
  );

  const userId = session?.user.id ?? null;
  const partner = useMemo(
    () => journeyMembers.find((m) => m.profileId !== userId) ?? null,
    [journeyMembers, userId]
  );

  const value = useMemo(
    () => ({
      session,
      isAuthenticated: !!session,
      userId,
      userEmail: session?.user.email ?? null,
      journeyId,
      journeyMembers,
      partner,
      isPartnered: journeyMembers.length >= 2,
      anniversaryDate,
      isLoaded,
      signIn,
      signUp,
      signOut,
      signInWithGoogle,
      createInvite,
      redeemInvite,
      updateAnniversaryDate,
      updateAvatar,
      refreshJourney,
    }),
    [
      session,
      userId,
      journeyId,
      journeyMembers,
      partner,
      anniversaryDate,
      isLoaded,
      signIn,
      signUp,
      signOut,
      signInWithGoogle,
      createInvite,
      redeemInvite,
      updateAnniversaryDate,
      updateAvatar,
      refreshJourney,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
