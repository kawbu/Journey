import type { ActivityType } from '../types';

export type AuthStackParamList = {
  Login: undefined;
  SignUp: undefined;
};

export type TabParamList = {
  Dates: undefined;
  Map: { dateId?: string } | undefined;
  BucketList: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  Tabs: { screen?: keyof TabParamList; params?: TabParamList[keyof TabParamList] } | undefined;
  PlanDate:
    | { prefillTitle?: string; prefillActivity?: ActivityType; editDateId?: string }
    | undefined;
  PastDates: undefined;
  DateMemories: { dateId: string };
  Settings: undefined;
  HelpFeedback: undefined;
  AiConcierge: undefined;
};
