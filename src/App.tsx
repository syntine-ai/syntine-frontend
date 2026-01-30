import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { OrgLayout } from "@/components/layout/OrgLayout";

// Public Pages
import Auth from "./pages/Auth";

// Org Pages
import Dashboard from "./pages/Dashboard";
import Campaigns from "./pages/Campaigns";
import CampaignDetail from "./pages/CampaignDetail";
import Agents from "./pages/Agents";
import AgentDetail from "./pages/AgentDetail";
import CallAnalytics from "./pages/CallAnalytics";
import CallLogs from "./pages/CallLogs";
import RecentCalls from "./pages/RecentCalls";
import CallDetails from "./pages/CallDetails";
import CallerList from "./pages/CallerList";
import Contacts from "./pages/Contacts";
import ContactLists from "./pages/ContactLists";
import Settings from "./pages/Settings";
import Integrations from "./pages/Integrations";
import Products from "./pages/Products";
import Orders from "./pages/Orders";
import AbandonedCarts from "./pages/AbandonedCarts";
import SystemLogs from "./pages/SystemLogs";

// Account Pages
import Account from "./pages/Account";
import OrgNotifications from "./pages/OrgNotifications";

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
            <Route path="/" element={<Auth />} />
            <Route path="/auth" element={<Navigate to="/" replace />} />
            <Route path="/login" element={<Navigate to="/" replace />} />
            {/* Admin login deleted, redirect to home */}
            <Route path="/admin/login" element={<Navigate to="/" replace />} />

            {/* Protected Organization Routes - direct paths without /app prefix */}
            {/* Layout wraps all org pages via Outlet */}
            <Route element={
              <ProtectedRoute requiredRole="org">
                <OrgLayout />
              </ProtectedRoute>
            }>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/campaigns" element={<Campaigns />} />
              <Route path="/campaigns/:id" element={<CampaignDetail />} />
              <Route path="/agents" element={<Agents />} />
              <Route path="/agents/:id" element={<AgentDetail />} />
              <Route path="/calls" element={<RecentCalls />} />
              <Route path="/calls/:callId" element={<CallDetails />} />
              <Route path="/calls/logs" element={<CallLogs />} />
              <Route path="/calls/callers" element={<CallerList />} />
              <Route path="/contacts" element={<Contacts />} />
              <Route path="/contacts/lists" element={<ContactLists />} />
              <Route path="/integrations" element={<Integrations />} />
              <Route path="/products" element={<Products />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/abandoned-carts" element={<AbandonedCarts />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/settings/system-logs" element={<SystemLogs />} />
              <Route path="/account" element={<Account />} />
              <Route path="/notifications" element={<OrgNotifications />} />
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
