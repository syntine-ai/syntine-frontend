import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

// Public Pages
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import AdminLogin from "./pages/AdminLogin";

// Org Pages
import Dashboard from "./pages/Dashboard";
import Campaigns from "./pages/Campaigns";
import CampaignDetail from "./pages/CampaignDetail";
import Agents from "./pages/Agents";
import AgentDetail from "./pages/AgentDetail";
import CallAnalytics from "./pages/CallAnalytics";
import CallLogs from "./pages/CallLogs";
import CallerList from "./pages/CallerList";
import Settings from "./pages/Settings";
import SystemLogs from "./pages/SystemLogs";

// Admin Pages
import Organizations from "./pages/Organizations";
import OrganizationDetail from "./pages/OrganizationDetail";
import Subscriptions from "./pages/Subscriptions";
import Sessions from "./pages/Sessions";
import System from "./pages/System";
import AdminProfile from "./pages/AdminProfile";
import AdminSettings from "./pages/AdminSettings";

// Account Pages
import Account from "./pages/Account";

import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            
            {/* Protected Organization Routes - /app/* */}
            <Route path="/app" element={
              <ProtectedRoute requiredRole="org">
                <Navigate to="/app/dashboard" replace />
              </ProtectedRoute>
            } />
            <Route path="/app/dashboard" element={
              <ProtectedRoute requiredRole="org">
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/app/campaigns" element={
              <ProtectedRoute requiredRole="org">
                <Campaigns />
              </ProtectedRoute>
            } />
            <Route path="/app/campaigns/:id" element={
              <ProtectedRoute requiredRole="org">
                <CampaignDetail />
              </ProtectedRoute>
            } />
            <Route path="/app/agents" element={
              <ProtectedRoute requiredRole="org">
                <Agents />
              </ProtectedRoute>
            } />
            <Route path="/app/agents/:id" element={
              <ProtectedRoute requiredRole="org">
                <AgentDetail />
              </ProtectedRoute>
            } />
            <Route path="/app/calls" element={
              <ProtectedRoute requiredRole="org">
                <CallAnalytics />
              </ProtectedRoute>
            } />
            <Route path="/app/calls/logs" element={
              <ProtectedRoute requiredRole="org">
                <CallLogs />
              </ProtectedRoute>
            } />
            <Route path="/app/calls/callers" element={
              <ProtectedRoute requiredRole="org">
                <CallerList />
              </ProtectedRoute>
            } />
            <Route path="/app/settings" element={
              <ProtectedRoute requiredRole="org">
                <Settings />
              </ProtectedRoute>
            } />
            <Route path="/app/settings/system-logs" element={
              <ProtectedRoute requiredRole="org">
                <SystemLogs />
              </ProtectedRoute>
            } />
            <Route path="/app/account" element={
              <ProtectedRoute requiredRole="org">
                <Account />
              </ProtectedRoute>
            } />
            
            {/* Protected Admin Routes - /admin/* */}
            <Route path="/admin" element={
              <ProtectedRoute requiredRole="admin">
                <Navigate to="/admin/organizations" replace />
              </ProtectedRoute>
            } />
            <Route path="/admin/organizations" element={
              <ProtectedRoute requiredRole="admin">
                <Organizations />
              </ProtectedRoute>
            } />
            <Route path="/admin/organizations/:id" element={
              <ProtectedRoute requiredRole="admin">
                <OrganizationDetail />
              </ProtectedRoute>
            } />
            <Route path="/admin/subscriptions" element={
              <ProtectedRoute requiredRole="admin">
                <Subscriptions />
              </ProtectedRoute>
            } />
            <Route path="/admin/sessions" element={
              <ProtectedRoute requiredRole="admin">
                <Sessions />
              </ProtectedRoute>
            } />
            <Route path="/admin/system" element={
              <ProtectedRoute requiredRole="admin">
                <System />
              </ProtectedRoute>
            } />
            <Route path="/admin/profile" element={
              <ProtectedRoute requiredRole="admin">
                <AdminProfile />
              </ProtectedRoute>
            } />
            <Route path="/admin/settings" element={
              <ProtectedRoute requiredRole="admin">
                <AdminSettings />
              </ProtectedRoute>
            } />
            
            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
