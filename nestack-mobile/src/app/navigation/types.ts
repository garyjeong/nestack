import type { NavigatorScreenParams } from '@react-navigation/native'

// ---------------------------------------------------------------------------
// Auth Stack
// ---------------------------------------------------------------------------
export type AuthStackParamList = {
  Login: undefined
}

// ---------------------------------------------------------------------------
// Onboarding Stack
// ---------------------------------------------------------------------------
export type OnboardingStackParamList = {
  Welcome: undefined
  InviteCode: { code?: string }
}

// ---------------------------------------------------------------------------
// Home Stack
// ---------------------------------------------------------------------------
export type HomeStackParamList = {
  Home: undefined
}

// ---------------------------------------------------------------------------
// Mission Stack
// ---------------------------------------------------------------------------
export type MissionStackParamList = {
  Missions: undefined
  MissionDetail: { id: string }
  MissionCreate: { templateId?: string; categoryId?: string }
  MissionEdit: { id: string }
}

// ---------------------------------------------------------------------------
// Finance Stack
// ---------------------------------------------------------------------------
export type FinanceStackParamList = {
  Finance: undefined
  AccountDetail: { id: string }
  TransactionList: { accountId?: string }
}

// ---------------------------------------------------------------------------
// MyPage Stack
// ---------------------------------------------------------------------------
export type MyPageStackParamList = {
  MyPage: undefined
  ProfileEdit: undefined
  Badges: undefined
  Settings: undefined
  FamilySettings: undefined
}

// ---------------------------------------------------------------------------
// Main Bottom Tabs
// ---------------------------------------------------------------------------
export type MainTabParamList = {
  HomeTab: NavigatorScreenParams<HomeStackParamList>
  MissionTab: NavigatorScreenParams<MissionStackParamList>
  FinanceTab: NavigatorScreenParams<FinanceStackParamList>
  MyPageTab: NavigatorScreenParams<MyPageStackParamList>
}

// ---------------------------------------------------------------------------
// Root Navigator
// ---------------------------------------------------------------------------
export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>
  Onboarding: NavigatorScreenParams<OnboardingStackParamList>
  Main: NavigatorScreenParams<MainTabParamList>
}
