import { Navigate } from "react-router";

export function RootRedirect() {
  const user = localStorage.getItem('user');
  const profile = localStorage.getItem('investorProfile');

  if (!user) {
    return <Navigate to="/signup" replace />;
  }

  const userData = JSON.parse(user);
  if (!profile || userData.isNewUser) {
    return <Navigate to="/onboarding" replace />;
  }

  return <Navigate to="/dashboard" replace />;
}
