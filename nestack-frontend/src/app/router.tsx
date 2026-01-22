import { createBrowserRouter, Navigate } from 'react-router-dom';
import { useAppStore } from './store';

// Lazy load pages for code splitting
import { lazy, Suspense, type ReactNode } from 'react';

// Auth Pages
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'));
const SignupPage = lazy(() => import('@/pages/auth/SignupPage'));
const ForgotPasswordPage = lazy(() => import('@/pages/auth/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('@/pages/auth/ResetPasswordPage'));
const VerifyEmailPage = lazy(() => import('@/pages/auth/VerifyEmailPage'));

// Onboarding Pages
const WelcomePage = lazy(() => import('@/pages/onboarding/WelcomePage'));
const InviteCodePage = lazy(() => import('@/pages/onboarding/InviteCodePage'));

// Main Pages
const HomePage = lazy(() => import('@/pages/home/HomePage'));
const MissionsPage = lazy(() => import('@/pages/missions/MissionsPage'));
const MissionDetailPage = lazy(() => import('@/pages/missions/MissionDetailPage'));
const MissionCreatePage = lazy(() => import('@/pages/missions/MissionCreatePage'));
const MissionEditPage = lazy(() => import('@/pages/missions/MissionEditPage'));
const FinancePage = lazy(() => import('@/pages/finance/FinancePage'));
const AccountDetailPage = lazy(() => import('@/pages/finance/AccountDetailPage'));
const TransactionListPage = lazy(() => import('@/pages/finance/TransactionListPage'));
const MyPage = lazy(() => import('@/pages/mypage/MyPage'));
const ProfileEditPage = lazy(() => import('@/pages/mypage/ProfileEditPage'));
const BadgesPage = lazy(() => import('@/pages/mypage/BadgesPage'));
const SettingsPage = lazy(() => import('@/pages/mypage/SettingsPage'));




export const router = createBrowserRouter([
  { path: '/login', element: withSuspense(LoginPage) },
  { path: '/signup', element: withSuspense(SignupPage) },
  { path: '/forgot-password', element: withSuspense(ForgotPasswordPage) },
  { path: '/reset-password', element: withSuspense(ResetPasswordPage) },
  { path: '/verify-email', element: withSuspense(VerifyEmailPage) },
  { path: '/onboarding', element: withSuspense(WelcomePage) },
  { path: '/onboarding/invite', element: withSuspense(InviteCodePage) },
  { path: '/', element: withSuspense(HomePage) },
  { path: '/missions', element: withSuspense(MissionsPage) },
  { path: '/missions/:id', element: withSuspense(MissionDetailPage) },
  { path: '/missions/create', element: withSuspense(MissionCreatePage) },
  { path: '/missions/:id/edit', element: withSuspense(MissionEditPage) },
  { path: '/finance', element: withSuspense(FinancePage) },
  { path: '/finance/accounts/:id', element: withSuspense(AccountDetailPage) },
  { path: '/finance/transactions', element: withSuspense(TransactionListPage) },
  { path: '/mypage', element: withSuspense(MyPage) },
  { path: '/mypage/profile', element: withSuspense(ProfileEditPage) },
  { path: '/mypage/badges', element: withSuspense(BadgesPage) },
  { path: '/mypage/settings', element: withSuspense(SettingsPage) },
  { path: '/family/settings', element: withSuspense(FamilySettingsPage) },
  { path: '*', element: <Navigate to="/" replace /> },
]);
