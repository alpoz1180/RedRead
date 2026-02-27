import { lazy } from "react";
import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { SplashScreen } from "./components/screens/SplashScreen";
import { ProtectedRoute } from "./components/ProtectedRoute";

// Lazy load screens for code splitting
const OnboardingScreen = lazy(() => import("./components/screens/OnboardingScreen").then(m => ({ default: m.OnboardingScreen })));
const HomeScreen = lazy(() => import("./components/screens/HomeScreen").then(m => ({ default: m.HomeScreen })));
const MoodEntryScreen = lazy(() => import("./components/screens/MoodEntryScreen").then(m => ({ default: m.MoodEntryScreen })));
const InsightsScreen = lazy(() => import("./components/screens/InsightsScreen").then(m => ({ default: m.InsightsScreen })));
const MoodCalendarScreen = lazy(() => import("./components/screens/MoodCalendarScreen").then(m => ({ default: m.MoodCalendarScreen })));
const ProfileScreen = lazy(() => import("./components/screens/ProfileScreen").then(m => ({ default: m.ProfileScreen })));
const PremiumScreen = lazy(() => import("./components/screens/PremiumScreen").then(m => ({ default: m.PremiumScreen })));
const LoginScreen = lazy(() => import("./components/screens/LoginScreen").then(m => ({ default: m.LoginScreen })));
const SignupScreen = lazy(() => import("./components/screens/SignupScreen").then(m => ({ default: m.SignupScreen })));
const ForgotPasswordScreen = lazy(() => import("./components/screens/ForgotPasswordScreen").then(m => ({ default: m.ForgotPasswordScreen })));
const PrivacyPolicyScreen = lazy(() => import("./components/screens/PrivacyPolicyScreen").then(m => ({ default: m.PrivacyPolicyScreen })));
const TermsOfServiceScreen = lazy(() => import("./components/screens/TermsOfServiceScreen").then(m => ({ default: m.TermsOfServiceScreen })));

export const router = createBrowserRouter([
  // Splash screen - First entry point (only for / path)
  {
    path: "/",
    Component: SplashScreen,
  },
  // Public routes
  {
    path: "/login",
    Component: LoginScreen,
  },
  {
    path: "/signup",
    Component: SignupScreen,
  },
  {
    path: "/forgot-password",
    Component: ForgotPasswordScreen,
  },
  // Onboarding (Public - no auth required)
  {
    path: "/onboarding",
    Component: OnboardingScreen,
  },
  // Legal pages (Public)
  {
    path: "/privacy",
    Component: PrivacyPolicyScreen,
  },
  {
    path: "/terms",
    Component: TermsOfServiceScreen,
  },
  // Protected routes with Layout
  {
    path: "/home",
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, Component: HomeScreen },
      { path: "mood", Component: MoodEntryScreen },
      { path: "calendar", Component: MoodCalendarScreen },
      { path: "insights", Component: InsightsScreen },
      { path: "profile", Component: ProfileScreen },
      { path: "premium", Component: PremiumScreen },
    ],
  },
]);
