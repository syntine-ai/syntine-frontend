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
      activity_logs: {
        Row: {
          action: string
          created_at: string | null
          details: Json | null
          id: string
          ip_address: unknown
          level: Database["public"]["Enums"]["log_level"] | null
          message: string | null
          organization_id: string | null
          resource_id: string | null
          resource_type: string | null
          service: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: unknown
          level?: Database["public"]["Enums"]["log_level"] | null
          message?: string | null
          organization_id?: string | null
          resource_id?: string | null
          resource_type?: string | null
          service?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: unknown
          level?: Database["public"]["Enums"]["log_level"] | null
          message?: string | null
          organization_id?: string | null
          resource_id?: string | null
          resource_type?: string | null
          service?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
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
      call_recordings: {
        Row: {
          call_id: string
          created_at: string | null
          duration_seconds: number | null
          file_size_bytes: number | null
          id: string
          mime_type: string | null
          storage_path: string
        }
        Insert: {
          call_id: string
          created_at?: string | null
          duration_seconds?: number | null
          file_size_bytes?: number | null
          id?: string
          mime_type?: string | null
          storage_path: string
        }
        Update: {
          call_id?: string
          created_at?: string | null
          duration_seconds?: number | null
          file_size_bytes?: number | null
          id?: string
          mime_type?: string | null
          storage_path?: string
        }
        Relationships: [
          {
            foreignKeyName: "call_recordings_call_id_fkey"
            columns: ["call_id"]
            isOneToOne: true
            referencedRelation: "calls"
            referencedColumns: ["id"]
          },
        ]
      }
      call_transcripts: {
        Row: {
          call_id: string
          confidence: number | null
          content: string
          id: string
          latency_ms: number | null
          sequence: number
          speaker: Database["public"]["Enums"]["transcript_speaker"]
          timestamp: string | null
        }
        Insert: {
          call_id: string
          confidence?: number | null
          content: string
          id?: string
          latency_ms?: number | null
          sequence: number
          speaker: Database["public"]["Enums"]["transcript_speaker"]
          timestamp?: string | null
        }
        Update: {
          call_id?: string
          confidence?: number | null
          content?: string
          id?: string
          latency_ms?: number | null
          sequence?: number
          speaker?: Database["public"]["Enums"]["transcript_speaker"]
          timestamp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "call_transcripts_call_id_fkey"
            columns: ["call_id"]
            isOneToOne: false
            referencedRelation: "calls"
            referencedColumns: ["id"]
          },
        ]
      }
      calls: {
        Row: {
          agent_id: string | null
          attempt_number: number | null
          call_type: Database["public"]["Enums"]["call_type"]
          campaign_id: string | null
          contact_id: string | null
          created_at: string | null
          duration_seconds: number | null
          ended_at: string | null
          error_message: string | null
          external_call_id: string | null
          from_number: string | null
          id: string
          metadata: Json | null
          organization_id: string
          outcome: Database["public"]["Enums"]["call_outcome"] | null
          sentiment: Database["public"]["Enums"]["call_sentiment"] | null
          sentiment_score: number | null
          started_at: string | null
          status: Database["public"]["Enums"]["call_status"] | null
          summary: string | null
          tags: Json | null
          to_number: string | null
        }
        Insert: {
          agent_id?: string | null
          attempt_number?: number | null
          call_type?: Database["public"]["Enums"]["call_type"]
          campaign_id?: string | null
          contact_id?: string | null
          created_at?: string | null
          duration_seconds?: number | null
          ended_at?: string | null
          error_message?: string | null
          external_call_id?: string | null
          from_number?: string | null
          id?: string
          metadata?: Json | null
          organization_id: string
          outcome?: Database["public"]["Enums"]["call_outcome"] | null
          sentiment?: Database["public"]["Enums"]["call_sentiment"] | null
          sentiment_score?: number | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["call_status"] | null
          summary?: string | null
          tags?: Json | null
          to_number?: string | null
        }
        Update: {
          agent_id?: string | null
          attempt_number?: number | null
          call_type?: Database["public"]["Enums"]["call_type"]
          campaign_id?: string | null
          contact_id?: string | null
          created_at?: string | null
          duration_seconds?: number | null
          ended_at?: string | null
          error_message?: string | null
          external_call_id?: string | null
          from_number?: string | null
          id?: string
          metadata?: Json | null
          organization_id?: string
          outcome?: Database["public"]["Enums"]["call_outcome"] | null
          sentiment?: Database["public"]["Enums"]["call_sentiment"] | null
          sentiment_score?: number | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["call_status"] | null
          summary?: string | null
          tags?: Json | null
          to_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "calls_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calls_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calls_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calls_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_agents: {
        Row: {
          agent_id: string
          campaign_id: string
          created_at: string | null
          id: string
          is_primary: boolean | null
        }
        Insert: {
          agent_id: string
          campaign_id: string
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
        }
        Update: {
          agent_id?: string
          campaign_id?: string
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "campaign_agents_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_agents_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_contact_lists: {
        Row: {
          campaign_id: string
          contact_list_id: string
          created_at: string | null
          id: string
          priority: number | null
        }
        Insert: {
          campaign_id: string
          contact_list_id: string
          created_at?: string | null
          id?: string
          priority?: number | null
        }
        Update: {
          campaign_id?: string
          contact_list_id?: string
          created_at?: string | null
          id?: string
          priority?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "campaign_contact_lists_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_contact_lists_contact_list_id_fkey"
            columns: ["contact_list_id"]
            isOneToOne: false
            referencedRelation: "contact_lists"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          completed_at: string | null
          concurrency: number | null
          created_at: string | null
          deleted_at: string | null
          description: string | null
          id: string
          name: string
          organization_id: string
          schedule: Json | null
          settings: Json | null
          started_at: string | null
          status: Database["public"]["Enums"]["campaign_status"] | null
          updated_at: string | null
        }
        Insert: {
          completed_at?: string | null
          concurrency?: number | null
          created_at?: string | null
          deleted_at?: string | null
          description?: string | null
          id?: string
          name: string
          organization_id: string
          schedule?: Json | null
          settings?: Json | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["campaign_status"] | null
          updated_at?: string | null
        }
        Update: {
          completed_at?: string | null
          concurrency?: number | null
          created_at?: string | null
          deleted_at?: string | null
          description?: string | null
          id?: string
          name?: string
          organization_id?: string
          schedule?: Json | null
          settings?: Json | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["campaign_status"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campaigns_organization_id_fkey"
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
      notifications: {
        Row: {
          action_url: string | null
          created_at: string | null
          id: string
          message: string | null
          organization_id: string | null
          read_at: string | null
          resource_id: string | null
          resource_type: string | null
          title: string
          type: Database["public"]["Enums"]["notification_type"] | null
          user_id: string
        }
        Insert: {
          action_url?: string | null
          created_at?: string | null
          id?: string
          message?: string | null
          organization_id?: string | null
          read_at?: string | null
          resource_id?: string | null
          resource_type?: string | null
          title: string
          type?: Database["public"]["Enums"]["notification_type"] | null
          user_id: string
        }
        Update: {
          action_url?: string | null
          created_at?: string | null
          id?: string
          message?: string | null
          organization_id?: string | null
          read_at?: string | null
          resource_id?: string | null
          resource_type?: string | null
          title?: string
          type?: Database["public"]["Enums"]["notification_type"] | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_organization_id_fkey"
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
      transcripts: {
        Row: {
          call_uuid: string
          created_at: string | null
          id: string
          language: string | null
          org_id: string | null
          speaker: string
          text: string
          timestamp_relative: number
        }
        Insert: {
          call_uuid: string
          created_at?: string | null
          id?: string
          language?: string | null
          org_id?: string | null
          speaker: string
          text: string
          timestamp_relative: number
        }
        Update: {
          call_uuid?: string
          created_at?: string | null
          id?: string
          language?: string | null
          org_id?: string | null
          speaker?: string
          text?: string
          timestamp_relative?: number
        }
        Relationships: []
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
      unified_transcripts: {
        Row: {
          call_id: string | null
          created_at: string | null
          id: string | null
          language: string | null
          org_id: string | null
          source_table: string | null
          speaker: string | null
          text: string | null
          timestamp_relative: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_org_team_members: {
        Args: never
        Returns: {
          avatar_url: string
          created_at: string
          first_name: string
          id: string
          last_name: string
          organization_id: string
          timezone: string
          user_id: string
        }[]
      }
      get_unread_notification_count: { Args: never; Returns: number }
      get_user_organization_id: { Args: { _user_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_org_admin: { Args: { _user_id: string }; Returns: boolean }
      log_activity: {
        Args: {
          _action: string
          _details?: Json
          _level?: Database["public"]["Enums"]["log_level"]
          _message?: string
          _resource_id?: string
          _resource_type?: string
          _service?: string
        }
        Returns: string
      }
      mark_all_notifications_read: { Args: never; Returns: number }
      mark_notification_read: {
        Args: { _notification_id: string }
        Returns: undefined
      }
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
      call_direction: "inbound" | "outbound"
      call_outcome: "answered" | "no_answer" | "busy" | "failed" | "voicemail"
      call_sentiment: "positive" | "neutral" | "negative"
      call_status: "queued" | "ringing" | "in_progress" | "ended"
      call_type: "inbound" | "outbound" | "webcall"
      campaign_status:
        | "draft"
        | "scheduled"
        | "running"
        | "paused"
        | "completed"
        | "cancelled"
      contact_status: "active" | "inactive"
      list_type: "static" | "dynamic"
      log_level: "info" | "warning" | "error" | "success"
      notification_type: "info" | "success" | "warning" | "error"
      organization_plan: "starter" | "pro" | "enterprise"
      organization_status: "active" | "trial" | "suspended" | "cancelled"
      transcript_speaker: "agent" | "caller" | "system"
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
      call_direction: ["inbound", "outbound"],
      call_outcome: ["answered", "no_answer", "busy", "failed", "voicemail"],
      call_sentiment: ["positive", "neutral", "negative"],
      call_status: ["queued", "ringing", "in_progress", "ended"],
      call_type: ["inbound", "outbound", "webcall"],
      campaign_status: [
        "draft",
        "scheduled",
        "running",
        "paused",
        "completed",
        "cancelled",
      ],
      contact_status: ["active", "inactive"],
      list_type: ["static", "dynamic"],
      log_level: ["info", "warning", "error", "success"],
      notification_type: ["info", "success", "warning", "error"],
      organization_plan: ["starter", "pro", "enterprise"],
      organization_status: ["active", "trial", "suspended", "cancelled"],
      transcript_speaker: ["agent", "caller", "system"],
    },
  },
} as const
