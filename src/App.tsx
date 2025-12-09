import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

// Auth Pages
import Login from "./pages/Login";
import AdminLogin from "./pages/AdminLogin";

// Org Pages
import Dashboard from "./pages/Dashboard";
import Campaigns from "./pages/Campaigns";
import CampaignDetail from "./pages/CampaignDetail";
import Agents from "./pages/Agents";
import AgentDetail from "./pages/AgentDetail";
import Contacts from "./pages/Contacts";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";

// Admin Pages
import AdminDashboard from "./pages/AdminDashboard";
import Organizations from "./pages/Organizations";
import OrganizationDetail from "./pages/OrganizationDetail";
import SystemLogs from "./pages/SystemLogs";
import AdminSettings from "./pages/AdminSettings";

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
            {/* Redirect root to login */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            
            {/* Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            
            {/* Protected Organization Routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute requiredRole="org">
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/campaigns" element={
              <ProtectedRoute requiredRole="org">
                <Campaigns />
              </ProtectedRoute>
            } />
            <Route path="/campaigns/:id" element={
              <ProtectedRoute requiredRole="org">
                <CampaignDetail />
              </ProtectedRoute>
            } />
            <Route path="/agents" element={
              <ProtectedRoute requiredRole="org">
                <Agents />
              </ProtectedRoute>
            } />
            <Route path="/agents/:id" element={
              <ProtectedRoute requiredRole="org">
                <AgentDetail />
              </ProtectedRoute>
            } />
            <Route path="/contacts" element={
              <ProtectedRoute requiredRole="org">
                <Contacts />
              </ProtectedRoute>
            } />
            <Route path="/analytics" element={
              <ProtectedRoute requiredRole="org">
                <Analytics />
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute requiredRole="org">
                <Settings />
              </ProtectedRoute>
            } />
            
            {/* Protected Admin Routes */}
            <Route path="/admin" element={
              <ProtectedRoute requiredRole="admin">
                <AdminDashboard />
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
            <Route path="/admin/logs" element={
              <ProtectedRoute requiredRole="admin">
                <SystemLogs />
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
