import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

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
        <Routes>
          {/* Redirect root to dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          
          {/* Organization Routes */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/campaigns" element={<Campaigns />} />
          <Route path="/campaigns/:id" element={<CampaignDetail />} />
          <Route path="/agents" element={<Agents />} />
          <Route path="/agents/:id" element={<AgentDetail />} />
          <Route path="/contacts" element={<Contacts />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/settings" element={<Settings />} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/organizations" element={<Organizations />} />
          <Route path="/admin/organizations/:id" element={<OrganizationDetail />} />
          <Route path="/admin/logs" element={<SystemLogs />} />
          <Route path="/admin/settings" element={<AdminSettings />} />
          
          {/* Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
