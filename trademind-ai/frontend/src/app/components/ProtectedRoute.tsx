import { Navigate } from "react-router";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const user = localStorage.getItem('user');
  const profile = localStorage.getItem('investorProfile');

  // No user - redirect to signup
  if (!user) {
    return <Navigate to="/signup" replace />;
  }

  // User exists but no profile - redirect to onboarding
  const userData = JSON.parse(user);
  if (!profile || userData.isNewUser) {
    return <Navigate to="/onboarding" replace />;
  }

  // User has completed onboarding - allow access
  return <>{children}</>;
}
