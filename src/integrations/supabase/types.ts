export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      agents: {
        Row: {
          created_at: string | null
          deleted_at: string | null
          id: string
          language: string | null
          name: string
          organization_id: string
          sentiment_rules: Json | null
          status: Database["public"]["Enums"]["agent_status"] | null
          system_prompt: string | null
          tone: Database["public"]["Enums"]["agent_tone"] | null
          updated_at: string | null
          voice_settings: Json | null
        }
        Insert: {
          created_at?: string | null
          deleted_at?: string | null
          id?: string
          language?: string | null
          name: string
          organization_id: string
          sentiment_rules?: Json | null
          status?: Database["public"]["Enums"]["agent_status"] | null
          system_prompt?: string | null
          tone?: Database["public"]["Enums"]["agent_tone"] | null
          updated_at?: string | null
          voice_settings?: Json | null
        }
        Update: {
          created_at?: string | null
          deleted_at?: string | null
          id?: string
          language?: string | null
          name?: string
          organization_id?: string
          sentiment_rules?: Json | null
          status?: Database["public"]["Enums"]["agent_status"] | null
          system_prompt?: string | null
          tone?: Database["public"]["Enums"]["agent_tone"] | null
          updated_at?: string | null
          voice_settings?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "agents_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_call_stats: {
        Row: {
          answered_calls: number | null
          avg_sentiment_score: number | null
          contact_id: string
          failed_calls: number | null
          last_call_at: string | null
          last_outcome: Database["public"]["Enums"]["call_outcome"] | null
          missed_calls: number | null
          total_calls: number | null
          total_duration_seconds: number | null
          updated_at: string | null
        }
        Insert: {
          answered_calls?: number | null
          avg_sentiment_score?: number | null
          contact_id: string
          failed_calls?: number | null
          last_call_at?: string | null
          last_outcome?: Database["public"]["Enums"]["call_outcome"] | null
          missed_calls?: number | null
          total_calls?: number | null
          total_duration_seconds?: number | null
          updated_at?: string | null
        }
        Update: {
          answered_calls?: number | null
          avg_sentiment_score?: number | null
          contact_id?: string
          failed_calls?: number | null
          last_call_at?: string | null
          last_outcome?: Database["public"]["Enums"]["call_outcome"] | null
          missed_calls?: number | null
          total_calls?: number | null
          total_duration_seconds?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contact_call_stats_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: true
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_list_members: {
        Row: {
          added_at: string | null
          contact_id: string
          contact_list_id: string
          id: string
        }
        Insert: {
          added_at?: string | null
          contact_id: string
          contact_list_id: string
          id?: string
        }
        Update: {
          added_at?: string | null
          contact_id?: string
          contact_list_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contact_list_members_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contact_list_members_contact_list_id_fkey"
            columns: ["contact_list_id"]
            isOneToOne: false
            referencedRelation: "contact_lists"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_lists: {
        Row: {
          created_at: string | null
          deleted_at: string | null
          description: string | null
          filter_criteria: Json | null
          id: string
          list_type: Database["public"]["Enums"]["list_type"] | null
          name: string
          organization_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          deleted_at?: string | null
          description?: string | null
          filter_criteria?: Json | null
          id?: string
          list_type?: Database["public"]["Enums"]["list_type"] | null
          name: string
          organization_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          deleted_at?: string | null
          description?: string | null
          filter_criteria?: Json | null
          id?: string
          list_type?: Database["public"]["Enums"]["list_type"] | null
          name?: string
          organization_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contact_lists_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      contacts: {
        Row: {
          created_at: string | null
          deleted_at: string | null
          do_not_call: boolean | null
          email: string | null
          first_name: string | null
          id: string
          last_name: string | null
          metadata: Json | null
          organization_id: string
          phone: string
          status: Database["public"]["Enums"]["contact_status"] | null
          tags: Json | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          deleted_at?: string | null
          do_not_call?: boolean | null
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          metadata?: Json | null
          organization_id: string
          phone: string
          status?: Database["public"]["Enums"]["contact_status"] | null
          tags?: Json | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          deleted_at?: string | null
          do_not_call?: boolean | null
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          metadata?: Json | null
          organization_id?: string
          phone?: string
          status?: Database["public"]["Enums"]["contact_status"] | null
          tags?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contacts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string | null
          domain: string | null
          email: string | null
          id: string
          name: string
          next_billing_date: string | null
          plan: Database["public"]["Enums"]["organization_plan"]
          settings: Json | null
          status: Database["public"]["Enums"]["organization_status"]
          trial_ends_at: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          domain?: string | null
          email?: string | null
          id?: string
          name: string
          next_billing_date?: string | null
          plan?: Database["public"]["Enums"]["organization_plan"]
          settings?: Json | null
          status?: Database["public"]["Enums"]["organization_status"]
          trial_ends_at?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          domain?: string | null
          email?: string | null
          id?: string
          name?: string
          next_billing_date?: string | null
          plan?: Database["public"]["Enums"]["organization_plan"]
          settings?: Json | null
          status?: Database["public"]["Enums"]["organization_status"]
          trial_ends_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string | null
          first_name: string | null
          id: string
          last_name: string | null
          organization_id: string
          timezone: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          organization_id: string
          timezone?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          organization_id?: string
          timezone?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_organization_id: { Args: { _user_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_org_admin: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      agent_status: "active" | "inactive" | "draft"
      agent_tone:
        | "professional"
        | "friendly"
        | "casual"
        | "formal"
        | "empathetic"
      app_role: "admin" | "org_owner" | "org_admin" | "org_member"
      call_outcome: "answered" | "no_answer" | "busy" | "failed" | "voicemail"
      contact_status: "active" | "inactive"
      list_type: "static" | "dynamic"
      organization_plan: "starter" | "pro" | "enterprise"
      organization_status: "active" | "trial" | "suspended" | "cancelled"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      agent_status: ["active", "inactive", "draft"],
      agent_tone: [
        "professional",
        "friendly",
        "casual",
        "formal",
        "empathetic",
      ],
      app_role: ["admin", "org_owner", "org_admin", "org_member"],
      call_outcome: ["answered", "no_answer", "busy", "failed", "voicemail"],
      contact_status: ["active", "inactive"],
      list_type: ["static", "dynamic"],
      organization_plan: ["starter", "pro", "enterprise"],
      organization_status: ["active", "trial", "suspended", "cancelled"],
    },
  },
} as const
