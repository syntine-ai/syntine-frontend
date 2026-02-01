import { createContext, useContext, useState, useEffect, useRef, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type AppRole = "admin" | "org_owner" | "org_admin" | "org_member";
type OrganizationPlan = "starter" | "pro" | "enterprise";
type OrganizationStatus = "active" | "trial" | "suspended" | "cancelled";

interface Profile {
  id: string;
  user_id: string;
  organization_id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  avatar_url: string | null;
  timezone: string;
}

interface Organization {
  id: string;
  name: string;
  plan: OrganizationPlan;
  status: OrganizationStatus;
  email: string | null;
  domain: string | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  organization: Organization | null;
  roles: AppRole[];
  isLoading: boolean;
  isAdmin: boolean;
  isOrgMember: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, metadata: { firstName: string; lastName: string; organizationName: string }) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch profile, organization, and roles after user is set
  const fetchUserData = async (userId: string) => {
    try {
      // Fetch profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (profileData) {
        setProfile(profileData as Profile);

        // Fetch organization using the profile's organization_id
        const { data: orgData } = await supabase
          .from("organizations")
          .select("id, name, plan, status, email, domain")
          .eq("id", profileData.organization_id)
          .maybeSingle();

        if (orgData) {
          setOrganization(orgData as Organization);
        }
      }

      // Fetch roles
      const { data: rolesData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId);

      if (rolesData) {
        setRoles(rolesData.map(r => r.role as AppRole));
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  // Track user in ref to avoid stale closure in onAuthStateChange
  const userRef = useRef<User | null>(null);

  useEffect(() => {
    let mounted = true;

    async function initializeAuth() {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();

        if (mounted) {
          if (initialSession?.user) {
            setSession(initialSession);
            setUser(initialSession.user);
            userRef.current = initialSession.user;

            // Keep loading true while fetching user data
            await fetchUserData(initialSession.user.id);
          } else {
            setSession(null);
            setUser(null);
            userRef.current = null;
          }
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        if (!mounted) return;

        const previousUserId = userRef.current?.id;
        const currentUserId = currentSession?.user?.id;

        // Update refs and state
        userRef.current = currentSession?.user ?? null;
        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        // If user changed (e.g. login)
        if (currentUserId && currentUserId !== previousUserId) {
          setIsLoading(true);
          await fetchUserData(currentUserId);
          if (mounted) setIsLoading(false);
        }
        // If logged out
        else if (!currentSession && previousUserId) {
          setProfile(null);
          setOrganization(null);
          setRoles([]);
          setIsLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string): Promise<{ error: string | null }> => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          return { error: "Invalid email or password. Please try again." };
        }
        if (error.message.includes("Email not confirmed")) {
          return { error: "Please confirm your email before signing in." };
        }
        return { error: error.message };
      }

      return { error: null };
    } catch (err) {
      return { error: "An unexpected error occurred. Please try again." };
    }
  };

  const signUp = async (
    email: string,
    password: string,
    metadata: { firstName: string; lastName: string; organizationName: string }
  ): Promise<{ error: string | null }> => {
    try {
      const redirectUrl = `${window.location.origin}/auth`;

      const { error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            first_name: metadata.firstName.trim(),
            last_name: metadata.lastName.trim(),
            organization_name: metadata.organizationName.trim(),
          },
        },
      });

      if (error) {
        if (error.message.includes("User already registered")) {
          return { error: "An account with this email already exists. Please sign in instead." };
        }
        return { error: error.message };
      }

      return { error: null };
    } catch (err) {
      return { error: "An unexpected error occurred. Please try again." };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    setOrganization(null);
    setRoles([]);
  };

  const isAdmin = roles.includes("admin");
  const isOrgMember = roles.some(r => ["org_owner", "org_admin", "org_member"].includes(r));

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        organization,
        roles,
        isLoading,
        isAdmin,
        isOrgMember,
        signIn,
        signUp,
        signOut
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
