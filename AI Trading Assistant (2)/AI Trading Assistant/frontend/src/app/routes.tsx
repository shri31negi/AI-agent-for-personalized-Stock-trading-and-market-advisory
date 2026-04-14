import { createBrowserRouter, Navigate } from "react-router";
import { Layout } from "./components/Layout";
import { Dashboard } from "./components/Dashboard";
import { AIAdvisor } from "./components/AIAdvisor";
import { Portfolio } from "./components/Portfolio";
import { MarketAnalysis } from "./components/MarketAnalysis";
import { Settings } from "./components/Settings";
import { Signup } from "./components/auth/Signup";
import { Login } from "./components/auth/Login";
import { Onboarding } from "./components/auth/Onboarding";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Home } from "./components/Home";

export const router = createBrowserRouter([
  { 
    path: "/", 
    Component: Home
  },
  { 
    path: "/signup", 
    Component: Signup 
  },
  { 
    path: "/login", 
    Component: Login 
  },
  { 
    path: "/onboarding", 
    Component: Onboarding 
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      { path: "dashboard", Component: Dashboard },
      { path: "advisor", Component: AIAdvisor },
      { path: "portfolio", Component: Portfolio },
      { path: "market", Component: MarketAnalysis },
      { path: "settings", Component: Settings },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/" replace />
  }
]);
