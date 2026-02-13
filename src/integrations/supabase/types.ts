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
          first_message: string | null
          first_message_delay_ms: number | null
          first_speaker: string | null
          id: string
          language: string | null
          name: string
          organization_id: string
          phone_number_id: string | null
          prompt_config: Json | null
          sentiment_rules: Json | null
          status: Database["public"]["Enums"]["agent_status"] | null
          system_prompt: string | null
          tone: Database["public"]["Enums"]["agent_tone"] | null
          type: string
          updated_at: string | null
          voice_settings: Json | null
        }
        Insert: {
          created_at?: string | null
          deleted_at?: string | null
          first_message?: string | null
          first_message_delay_ms?: number | null
          first_speaker?: string | null
          id?: string
          language?: string | null
          name: string
          organization_id: string
          phone_number_id?: string | null
          prompt_config?: Json | null
          sentiment_rules?: Json | null
          status?: Database["public"]["Enums"]["agent_status"] | null
          system_prompt?: string | null
          tone?: Database["public"]["Enums"]["agent_tone"] | null
          type?: string
          updated_at?: string | null
          voice_settings?: Json | null
        }
        Update: {
          created_at?: string | null
          deleted_at?: string | null
          first_message?: string | null
          first_message_delay_ms?: number | null
          first_speaker?: string | null
          id?: string
          language?: string | null
          name?: string
          organization_id?: string
          phone_number_id?: string | null
          prompt_config?: Json | null
          sentiment_rules?: Json | null
          status?: Database["public"]["Enums"]["agent_status"] | null
          system_prompt?: string | null
          tone?: Database["public"]["Enums"]["agent_tone"] | null
          type?: string
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
          {
            foreignKeyName: "agents_phone_number_id_fkey"
            columns: ["phone_number_id"]
            isOneToOne: false
            referencedRelation: "phone_numbers"
            referencedColumns: ["id"]
          },
        ]
      }
      call_queue: {
        Row: {
          campaign_id: string
          cart_id: string | null
          created_at: string | null
          customer_id: string | null
          error_message: string | null
          id: string
          last_attempt_at: string | null
          last_attempt_outcome: string | null
          metadata: Json | null
          order_id: string | null
          organization_id: string
          phone_number: string
          retry_count: number | null
          scheduled_at: string | null
          status: string
          updated_at: string | null
        }
        Insert: {
          campaign_id: string
          cart_id?: string | null
          created_at?: string | null
          customer_id?: string | null
          error_message?: string | null
          id?: string
          last_attempt_at?: string | null
          last_attempt_outcome?: string | null
          metadata?: Json | null
          order_id?: string | null
          organization_id: string
          phone_number: string
          retry_count?: number | null
          scheduled_at?: string | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          campaign_id?: string
          cart_id?: string | null
          created_at?: string | null
          customer_id?: string | null
          error_message?: string | null
          id?: string
          last_attempt_at?: string | null
          last_attempt_outcome?: string | null
          metadata?: Json | null
          order_id?: string | null
          organization_id?: string
          phone_number?: string
          retry_count?: number | null
          scheduled_at?: string | null
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "call_queue_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "call_queue_cart_id_fkey"
            columns: ["cart_id"]
            isOneToOne: false
            referencedRelation: "commerce_abandoned_carts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "call_queue_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "commerce_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "call_queue_organization_id_fkey"
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
          cart_id: string | null
          created_at: string | null
          duration_seconds: number | null
          ended_at: string | null
          error_message: string | null
          external_call_id: string | null
          from_number: string | null
          id: string
          metadata: Json | null
          order_id: string | null
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
          cart_id?: string | null
          created_at?: string | null
          duration_seconds?: number | null
          ended_at?: string | null
          error_message?: string | null
          external_call_id?: string | null
          from_number?: string | null
          id?: string
          metadata?: Json | null
          order_id?: string | null
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
          cart_id?: string | null
          created_at?: string | null
          duration_seconds?: number | null
          ended_at?: string | null
          error_message?: string | null
          external_call_id?: string | null
          from_number?: string | null
          id?: string
          metadata?: Json | null
          order_id?: string | null
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
            foreignKeyName: "calls_cart_id_fkey"
            columns: ["cart_id"]
            isOneToOne: false
            referencedRelation: "commerce_abandoned_carts"
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
      campaign_active_calls: {
        Row: {
          active_count: number | null
          campaign_id: string
          created_at: string | null
          last_updated: string | null
        }
        Insert: {
          active_count?: number | null
          campaign_id: string
          created_at?: string | null
          last_updated?: string | null
        }
        Update: {
          active_count?: number | null
          campaign_id?: string
          created_at?: string | null
          last_updated?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campaign_active_calls_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: true
            referencedRelation: "campaigns"
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
      campaigns: {
        Row: {
          auto_trigger_enabled: boolean | null
          calling_hours_end: number | null
          calling_hours_start: number | null
          campaign_type: string | null
          completed_at: string | null
          concurrency: number | null
          created_at: string | null
          deleted_at: string | null
          description: string | null
          id: string
          max_retry_attempts: number | null
          name: string
          organization_id: string
          retry_delay_minutes: number | null
          schedule: Json | null
          settings: Json | null
          started_at: string | null
          status: Database["public"]["Enums"]["campaign_status"] | null
          updated_at: string | null
        }
        Insert: {
          auto_trigger_enabled?: boolean | null
          calling_hours_end?: number | null
          calling_hours_start?: number | null
          campaign_type?: string | null
          completed_at?: string | null
          concurrency?: number | null
          created_at?: string | null
          deleted_at?: string | null
          description?: string | null
          id?: string
          max_retry_attempts?: number | null
          name: string
          organization_id: string
          retry_delay_minutes?: number | null
          schedule?: Json | null
          settings?: Json | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["campaign_status"] | null
          updated_at?: string | null
        }
        Update: {
          auto_trigger_enabled?: boolean | null
          calling_hours_end?: number | null
          calling_hours_start?: number | null
          campaign_type?: string | null
          completed_at?: string | null
          concurrency?: number | null
          created_at?: string | null
          deleted_at?: string | null
          description?: string | null
          id?: string
          max_retry_attempts?: number | null
          name?: string
          organization_id?: string
          retry_delay_minutes?: number | null
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
      chat_agent_configs: {
        Row: {
          agent_id: string
          business_rules: Json | null
          created_at: string | null
          custom_system_prefix: string | null
          enabled_templates: boolean | null
          fallback_message_wa: string | null
          fallback_message_web: string | null
          greeting_message: string | null
          handover_notification_url: string | null
          handover_timeout_hours: number | null
          id: string
          is_deleted: boolean | null
          max_tokens: number | null
          model: string | null
          modules: Json | null
          organization_id: string
          system_prompt: string | null
          temperature: number | null
          template_namespace: string | null
          updated_at: string | null
          use_summary: boolean | null
          version: number | null
          whatsapp_config: Json | null
          whatsapp_provider: string | null
        }
        Insert: {
          agent_id: string
          business_rules?: Json | null
          created_at?: string | null
          custom_system_prefix?: string | null
          enabled_templates?: boolean | null
          fallback_message_wa?: string | null
          fallback_message_web?: string | null
          greeting_message?: string | null
          handover_notification_url?: string | null
          handover_timeout_hours?: number | null
          id?: string
          is_deleted?: boolean | null
          max_tokens?: number | null
          model?: string | null
          modules?: Json | null
          organization_id: string
          system_prompt?: string | null
          temperature?: number | null
          template_namespace?: string | null
          updated_at?: string | null
          use_summary?: boolean | null
          version?: number | null
          whatsapp_config?: Json | null
          whatsapp_provider?: string | null
        }
        Update: {
          agent_id?: string
          business_rules?: Json | null
          created_at?: string | null
          custom_system_prefix?: string | null
          enabled_templates?: boolean | null
          fallback_message_wa?: string | null
          fallback_message_web?: string | null
          greeting_message?: string | null
          handover_notification_url?: string | null
          handover_timeout_hours?: number | null
          id?: string
          is_deleted?: boolean | null
          max_tokens?: number | null
          model?: string | null
          modules?: Json | null
          organization_id?: string
          system_prompt?: string | null
          temperature?: number | null
          template_namespace?: string | null
          updated_at?: string | null
          use_summary?: boolean | null
          version?: number | null
          whatsapp_config?: Json | null
          whatsapp_provider?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_agent_configs_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: true
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_agent_configs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_dead_letters: {
        Row: {
          created_at: string | null
          error: string | null
          id: string
          payload: Json
          resolved: boolean | null
          resolved_at: string | null
          retries: number | null
        }
        Insert: {
          created_at?: string | null
          error?: string | null
          id?: string
          payload: Json
          resolved?: boolean | null
          resolved_at?: string | null
          retries?: number | null
        }
        Update: {
          created_at?: string | null
          error?: string | null
          id?: string
          payload?: Json
          resolved?: boolean | null
          resolved_at?: string | null
          retries?: number | null
        }
        Relationships: []
      }
      chat_message_dedup: {
        Row: {
          external_message_id: string
          processed_at: string | null
        }
        Insert: {
          external_message_id: string
          processed_at?: string | null
        }
        Update: {
          external_message_id?: string
          processed_at?: string | null
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          completion_tokens: number | null
          content: string
          created_at: string | null
          id: string
          latency_ms: number | null
          message_type: string | null
          metadata: Json | null
          prompt_tokens: number | null
          sender: Database["public"]["Enums"]["chat_sender_role"]
          session_id: string
          total_tokens: number | null
        }
        Insert: {
          completion_tokens?: number | null
          content: string
          created_at?: string | null
          id?: string
          latency_ms?: number | null
          message_type?: string | null
          metadata?: Json | null
          prompt_tokens?: number | null
          sender: Database["public"]["Enums"]["chat_sender_role"]
          session_id: string
          total_tokens?: number | null
        }
        Update: {
          completion_tokens?: number | null
          content?: string
          created_at?: string | null
          id?: string
          latency_ms?: number | null
          message_type?: string | null
          metadata?: Json | null
          prompt_tokens?: number | null
          sender?: Database["public"]["Enums"]["chat_sender_role"]
          session_id?: string
          total_tokens?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "chat_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_sessions: {
        Row: {
          agent_config_id: string | null
          channel: Database["public"]["Enums"]["chat_channel"]
          conversation_summary: string | null
          created_at: string | null
          external_id: string | null
          id: string
          last_message_at: string | null
          message_count: number | null
          metadata: Json | null
          organization_id: string
          status: Database["public"]["Enums"]["chat_session_status"] | null
          updated_at: string | null
        }
        Insert: {
          agent_config_id?: string | null
          channel: Database["public"]["Enums"]["chat_channel"]
          conversation_summary?: string | null
          created_at?: string | null
          external_id?: string | null
          id?: string
          last_message_at?: string | null
          message_count?: number | null
          metadata?: Json | null
          organization_id: string
          status?: Database["public"]["Enums"]["chat_session_status"] | null
          updated_at?: string | null
        }
        Update: {
          agent_config_id?: string | null
          channel?: Database["public"]["Enums"]["chat_channel"]
          conversation_summary?: string | null
          created_at?: string | null
          external_id?: string | null
          id?: string
          last_message_at?: string | null
          message_count?: number | null
          metadata?: Json | null
          organization_id?: string
          status?: Database["public"]["Enums"]["chat_session_status"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_sessions_agent_config_id_fkey"
            columns: ["agent_config_id"]
            isOneToOne: false
            referencedRelation: "chat_agent_configs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_sessions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_templates: {
        Row: {
          agent_config_id: string | null
          body: string
          category: string | null
          created_at: string | null
          external_id: string | null
          id: string
          language: string | null
          last_status_check_at: string | null
          name: string
          organization_id: string
          status: Database["public"]["Enums"]["chat_template_status"] | null
          variables: Json | null
        }
        Insert: {
          agent_config_id?: string | null
          body: string
          category?: string | null
          created_at?: string | null
          external_id?: string | null
          id?: string
          language?: string | null
          last_status_check_at?: string | null
          name: string
          organization_id: string
          status?: Database["public"]["Enums"]["chat_template_status"] | null
          variables?: Json | null
        }
        Update: {
          agent_config_id?: string | null
          body?: string
          category?: string | null
          created_at?: string | null
          external_id?: string | null
          id?: string
          language?: string | null
          last_status_check_at?: string | null
          name?: string
          organization_id?: string
          status?: Database["public"]["Enums"]["chat_template_status"] | null
          variables?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_templates_agent_config_id_fkey"
            columns: ["agent_config_id"]
            isOneToOne: false
            referencedRelation: "chat_agent_configs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_templates_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      commerce_abandoned_carts: {
        Row: {
          abandoned_at: string | null
          created_at: string | null
          currency: string | null
          customer_email: string | null
          customer_id: string | null
          customer_name: string | null
          customer_phone: string | null
          external_cart_id: string
          id: string
          integration_id: string
          items_count: number | null
          organization_id: string
          recovery_url: string | null
          source: Database["public"]["Enums"]["commerce_source"]
          status: Database["public"]["Enums"]["cart_status"] | null
          synced_at: string | null
          total_value: number | null
          trigger_ready:
            | Database["public"]["Enums"]["trigger_ready_status"]
            | null
          updated_at: string | null
        }
        Insert: {
          abandoned_at?: string | null
          created_at?: string | null
          currency?: string | null
          customer_email?: string | null
          customer_id?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          external_cart_id: string
          id?: string
          integration_id: string
          items_count?: number | null
          organization_id: string
          recovery_url?: string | null
          source: Database["public"]["Enums"]["commerce_source"]
          status?: Database["public"]["Enums"]["cart_status"] | null
          synced_at?: string | null
          total_value?: number | null
          trigger_ready?:
            | Database["public"]["Enums"]["trigger_ready_status"]
            | null
          updated_at?: string | null
        }
        Update: {
          abandoned_at?: string | null
          created_at?: string | null
          currency?: string | null
          customer_email?: string | null
          customer_id?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          external_cart_id?: string
          id?: string
          integration_id?: string
          items_count?: number | null
          organization_id?: string
          recovery_url?: string | null
          source?: Database["public"]["Enums"]["commerce_source"]
          status?: Database["public"]["Enums"]["cart_status"] | null
          synced_at?: string | null
          total_value?: number | null
          trigger_ready?:
            | Database["public"]["Enums"]["trigger_ready_status"]
            | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "commerce_abandoned_carts_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "commerce_customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commerce_abandoned_carts_integration_id_fkey"
            columns: ["integration_id"]
            isOneToOne: false
            referencedRelation: "commerce_integrations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commerce_abandoned_carts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      commerce_cart_items: {
        Row: {
          cart_id: string
          created_at: string | null
          external_line_item_id: string | null
          id: string
          image_url: string | null
          price: number
          product_id: string | null
          quantity: number
          title: string
          total: number
          variant_id: string | null
          variant_title: string | null
        }
        Insert: {
          cart_id: string
          created_at?: string | null
          external_line_item_id?: string | null
          id?: string
          image_url?: string | null
          price: number
          product_id?: string | null
          quantity?: number
          title: string
          total: number
          variant_id?: string | null
          variant_title?: string | null
        }
        Update: {
          cart_id?: string
          created_at?: string | null
          external_line_item_id?: string | null
          id?: string
          image_url?: string | null
          price?: number
          product_id?: string | null
          quantity?: number
          title?: string
          total?: number
          variant_id?: string | null
          variant_title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "commerce_cart_items_cart_id_fkey"
            columns: ["cart_id"]
            isOneToOne: false
            referencedRelation: "commerce_abandoned_carts"
            referencedColumns: ["id"]
          },
        ]
      }
      commerce_customers: {
        Row: {
          accepts_marketing: boolean | null
          created_at: string | null
          email: string | null
          external_customer_id: string | null
          first_name: string | null
          id: string
          last_name: string | null
          organization_id: string
          phone: string | null
          source: Database["public"]["Enums"]["commerce_source"]
          total_orders: number | null
          total_spent: number | null
          updated_at: string | null
        }
        Insert: {
          accepts_marketing?: boolean | null
          created_at?: string | null
          email?: string | null
          external_customer_id?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          organization_id: string
          phone?: string | null
          source: Database["public"]["Enums"]["commerce_source"]
          total_orders?: number | null
          total_spent?: number | null
          updated_at?: string | null
        }
        Update: {
          accepts_marketing?: boolean | null
          created_at?: string | null
          email?: string | null
          external_customer_id?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          organization_id?: string
          phone?: string | null
          source?: Database["public"]["Enums"]["commerce_source"]
          total_orders?: number | null
          total_spent?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "commerce_customers_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      commerce_integrations: {
        Row: {
          access_token_encrypted: string | null
          created_at: string | null
          external_store_id: string | null
          id: string
          last_disconnected_at: string | null
          last_error_at: string | null
          last_error_reason: string | null
          last_orders_sync_at: string | null
          last_products_sync_at: string | null
          last_sync_at: string | null
          organization_id: string
          settings: Json | null
          source: Database["public"]["Enums"]["commerce_source"]
          status: Database["public"]["Enums"]["integration_status"]
          store_domain: string | null
          store_name: string | null
          updated_at: string | null
          webhook_status: Database["public"]["Enums"]["webhook_status"] | null
        }
        Insert: {
          access_token_encrypted?: string | null
          created_at?: string | null
          external_store_id?: string | null
          id?: string
          last_disconnected_at?: string | null
          last_error_at?: string | null
          last_error_reason?: string | null
          last_orders_sync_at?: string | null
          last_products_sync_at?: string | null
          last_sync_at?: string | null
          organization_id: string
          settings?: Json | null
          source: Database["public"]["Enums"]["commerce_source"]
          status?: Database["public"]["Enums"]["integration_status"]
          store_domain?: string | null
          store_name?: string | null
          updated_at?: string | null
          webhook_status?: Database["public"]["Enums"]["webhook_status"] | null
        }
        Update: {
          access_token_encrypted?: string | null
          created_at?: string | null
          external_store_id?: string | null
          id?: string
          last_disconnected_at?: string | null
          last_error_at?: string | null
          last_error_reason?: string | null
          last_orders_sync_at?: string | null
          last_products_sync_at?: string | null
          last_sync_at?: string | null
          organization_id?: string
          settings?: Json | null
          source?: Database["public"]["Enums"]["commerce_source"]
          status?: Database["public"]["Enums"]["integration_status"]
          store_domain?: string | null
          store_name?: string | null
          updated_at?: string | null
          webhook_status?: Database["public"]["Enums"]["webhook_status"] | null
        }
        Relationships: [
          {
            foreignKeyName: "commerce_integrations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      commerce_order_items: {
        Row: {
          created_at: string | null
          external_line_item_id: string | null
          id: string
          order_id: string
          price: number
          product_id: string | null
          quantity: number
          sku: string | null
          title: string
          total: number
          variant_id: string | null
          variant_title: string | null
        }
        Insert: {
          created_at?: string | null
          external_line_item_id?: string | null
          id?: string
          order_id: string
          price: number
          product_id?: string | null
          quantity?: number
          sku?: string | null
          title: string
          total: number
          variant_id?: string | null
          variant_title?: string | null
        }
        Update: {
          created_at?: string | null
          external_line_item_id?: string | null
          id?: string
          order_id?: string
          price?: number
          product_id?: string | null
          quantity?: number
          sku?: string | null
          title?: string
          total?: number
          variant_id?: string | null
          variant_title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "commerce_order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "commerce_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commerce_order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "commerce_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commerce_order_items_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "commerce_product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      commerce_orders: {
        Row: {
          billing_address: Json | null
          call_enqueued_at: string | null
          created_at: string | null
          currency: string | null
          customer_email: string | null
          customer_id: string | null
          customer_name: string | null
          customer_phone: string | null
          external_order_id: string
          financial_status:
            | Database["public"]["Enums"]["order_financial_status"]
            | null
          fulfillment_status:
            | Database["public"]["Enums"]["order_fulfillment_status"]
            | null
          id: string
          integration_id: string | null
          items_count: number | null
          notes: string | null
          order_created_at: string | null
          order_number: string | null
          organization_id: string
          payment_type: Database["public"]["Enums"]["payment_type"] | null
          shipping_address: Json | null
          source: Database["public"]["Enums"]["commerce_source"]
          subtotal: number | null
          synced_at: string | null
          tags: Json | null
          total_amount: number
          total_discounts: number | null
          total_tax: number | null
          trigger_ready:
            | Database["public"]["Enums"]["trigger_ready_status"]
            | null
          updated_at: string | null
        }
        Insert: {
          billing_address?: Json | null
          call_enqueued_at?: string | null
          created_at?: string | null
          currency?: string | null
          customer_email?: string | null
          customer_id?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          external_order_id: string
          financial_status?:
            | Database["public"]["Enums"]["order_financial_status"]
            | null
          fulfillment_status?:
            | Database["public"]["Enums"]["order_fulfillment_status"]
            | null
          id?: string
          integration_id?: string | null
          items_count?: number | null
          notes?: string | null
          order_created_at?: string | null
          order_number?: string | null
          organization_id: string
          payment_type?: Database["public"]["Enums"]["payment_type"] | null
          shipping_address?: Json | null
          source: Database["public"]["Enums"]["commerce_source"]
          subtotal?: number | null
          synced_at?: string | null
          tags?: Json | null
          total_amount: number
          total_discounts?: number | null
          total_tax?: number | null
          trigger_ready?:
            | Database["public"]["Enums"]["trigger_ready_status"]
            | null
          updated_at?: string | null
        }
        Update: {
          billing_address?: Json | null
          call_enqueued_at?: string | null
          created_at?: string | null
          currency?: string | null
          customer_email?: string | null
          customer_id?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          external_order_id?: string
          financial_status?:
            | Database["public"]["Enums"]["order_financial_status"]
            | null
          fulfillment_status?:
            | Database["public"]["Enums"]["order_fulfillment_status"]
            | null
          id?: string
          integration_id?: string | null
          items_count?: number | null
          notes?: string | null
          order_created_at?: string | null
          order_number?: string | null
          organization_id?: string
          payment_type?: Database["public"]["Enums"]["payment_type"] | null
          shipping_address?: Json | null
          source?: Database["public"]["Enums"]["commerce_source"]
          subtotal?: number | null
          synced_at?: string | null
          tags?: Json | null
          total_amount?: number
          total_discounts?: number | null
          total_tax?: number | null
          trigger_ready?:
            | Database["public"]["Enums"]["trigger_ready_status"]
            | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "commerce_orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "commerce_customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commerce_orders_integration_id_fkey"
            columns: ["integration_id"]
            isOneToOne: false
            referencedRelation: "commerce_integrations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commerce_orders_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      commerce_product_variants: {
        Row: {
          compare_at_price: number | null
          created_at: string | null
          external_variant_id: string
          id: string
          inventory_quantity: number | null
          price: number | null
          product_id: string
          requires_shipping: boolean | null
          sku: string | null
          title: string | null
          updated_at: string | null
          weight: number | null
          weight_unit: string | null
        }
        Insert: {
          compare_at_price?: number | null
          created_at?: string | null
          external_variant_id: string
          id?: string
          inventory_quantity?: number | null
          price?: number | null
          product_id: string
          requires_shipping?: boolean | null
          sku?: string | null
          title?: string | null
          updated_at?: string | null
          weight?: number | null
          weight_unit?: string | null
        }
        Update: {
          compare_at_price?: number | null
          created_at?: string | null
          external_variant_id?: string
          id?: string
          inventory_quantity?: number | null
          price?: number | null
          product_id?: string
          requires_shipping?: boolean | null
          sku?: string | null
          title?: string | null
          updated_at?: string | null
          weight?: number | null
          weight_unit?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "commerce_product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "commerce_products"
            referencedColumns: ["id"]
          },
        ]
      }
      commerce_products: {
        Row: {
          created_at: string | null
          description: string | null
          external_product_id: string
          id: string
          images: Json | null
          integration_id: string
          organization_id: string
          product_type: string | null
          source: Database["public"]["Enums"]["commerce_source"]
          status: Database["public"]["Enums"]["product_status"] | null
          synced_at: string | null
          tags: Json | null
          title: string
          updated_at: string | null
          vendor: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          external_product_id: string
          id?: string
          images?: Json | null
          integration_id: string
          organization_id: string
          product_type?: string | null
          source: Database["public"]["Enums"]["commerce_source"]
          status?: Database["public"]["Enums"]["product_status"] | null
          synced_at?: string | null
          tags?: Json | null
          title: string
          updated_at?: string | null
          vendor?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          external_product_id?: string
          id?: string
          images?: Json | null
          integration_id?: string
          organization_id?: string
          product_type?: string | null
          source?: Database["public"]["Enums"]["commerce_source"]
          status?: Database["public"]["Enums"]["product_status"] | null
          synced_at?: string | null
          tags?: Json | null
          title?: string
          updated_at?: string | null
          vendor?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "commerce_products_integration_id_fkey"
            columns: ["integration_id"]
            isOneToOne: false
            referencedRelation: "commerce_integrations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commerce_products_organization_id_fkey"
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
          calling_hours_end: number | null
          calling_hours_start: number | null
          created_at: string | null
          credits: number | null
          domain: string | null
          email: string | null
          enabled_channels: string[] | null
          id: string
          name: string
          next_billing_date: string | null
          plan: Database["public"]["Enums"]["organization_plan"]
          settings: Json | null
          status: Database["public"]["Enums"]["organization_status"]
          timezone: string | null
          trial_ends_at: string | null
          updated_at: string | null
          whatsapp_credits: number | null
          whatsapp_phone_id: string | null
        }
        Insert: {
          calling_hours_end?: number | null
          calling_hours_start?: number | null
          created_at?: string | null
          credits?: number | null
          domain?: string | null
          email?: string | null
          enabled_channels?: string[] | null
          id?: string
          name: string
          next_billing_date?: string | null
          plan?: Database["public"]["Enums"]["organization_plan"]
          settings?: Json | null
          status?: Database["public"]["Enums"]["organization_status"]
          timezone?: string | null
          trial_ends_at?: string | null
          updated_at?: string | null
          whatsapp_credits?: number | null
          whatsapp_phone_id?: string | null
        }
        Update: {
          calling_hours_end?: number | null
          calling_hours_start?: number | null
          created_at?: string | null
          credits?: number | null
          domain?: string | null
          email?: string | null
          enabled_channels?: string[] | null
          id?: string
          name?: string
          next_billing_date?: string | null
          plan?: Database["public"]["Enums"]["organization_plan"]
          settings?: Json | null
          status?: Database["public"]["Enums"]["organization_status"]
          timezone?: string | null
          trial_ends_at?: string | null
          updated_at?: string | null
          whatsapp_credits?: number | null
          whatsapp_phone_id?: string | null
        }
        Relationships: []
      }
      phone_numbers: {
        Row: {
          agent_id: string | null
          capabilities: Json | null
          country: string
          created_at: string | null
          id: string
          monthly_cost: number | null
          organization_id: string | null
          phone_number: string
          provider: string | null
          region: string | null
          status: Database["public"]["Enums"]["phone_number_status"]
          updated_at: string | null
        }
        Insert: {
          agent_id?: string | null
          capabilities?: Json | null
          country: string
          created_at?: string | null
          id?: string
          monthly_cost?: number | null
          organization_id?: string | null
          phone_number: string
          provider?: string | null
          region?: string | null
          status?: Database["public"]["Enums"]["phone_number_status"]
          updated_at?: string | null
        }
        Update: {
          agent_id?: string | null
          capabilities?: Json | null
          country?: string
          created_at?: string | null
          id?: string
          monthly_cost?: number | null
          organization_id?: string | null
          phone_number?: string
          provider?: string | null
          region?: string | null
          status?: Database["public"]["Enums"]["phone_number_status"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "phone_numbers_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "phone_numbers_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
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
      claim_queue_items: {
        Args: { p_campaign_id: string; p_limit?: number }
        Returns: {
          campaign_id: string
          id: string
          metadata: Json
          order_id: string
          organization_id: string
          phone_number: string
          retry_count: number
          scheduled_at: string
          status: string
        }[]
      }
      decrement_active_calls: {
        Args: { p_campaign_id: string }
        Returns: undefined
      }
      deduct_whatsapp_credit: { Args: { org_id: string }; Returns: number }
      get_active_call_count: {
        Args: { p_campaign_id: string }
        Returns: number
      }
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
      increment_active_calls: {
        Args: { p_campaign_id: string }
        Returns: undefined
      }
      is_org_admin: { Args: { _user_id: string }; Returns: boolean }
      is_wa_window_open: {
        Args: { p_conversation_id: string }
        Returns: boolean
      }
      is_within_calling_hours: {
        Args: { p_campaign_id: string; p_check_time?: string }
        Returns: boolean
      }
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
      reset_stale_call_counters: { Args: never; Returns: undefined }
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
      cart_status: "abandoned" | "recovered" | "expired"
      chat_channel: "whatsapp" | "web"
      chat_sender_role: "user" | "ai" | "human_agent" | "system"
      chat_session_status: "active" | "closed" | "human_handover"
      chat_template_status:
        | "pending"
        | "approved"
        | "rejected"
        | "paused"
        | "deleted"
      commerce_source: "shopify" | "woocommerce" | "custom_webhook"
      contact_status: "active" | "inactive"
      integration_status: "connected" | "disconnected" | "error" | "pending"
      list_type: "static" | "dynamic"
      log_level: "info" | "warning" | "error" | "success"
      notification_type: "info" | "success" | "warning" | "error"
      order_financial_status:
        | "pending"
        | "paid"
        | "refunded"
        | "partially_refunded"
        | "voided"
      order_fulfillment_status:
        | "unfulfilled"
        | "partial"
        | "fulfilled"
        | "restocked"
      organization_plan: "starter" | "pro" | "enterprise"
      organization_status: "active" | "trial" | "suspended" | "cancelled"
      payment_type: "cod" | "prepaid" | "unknown"
      phone_number_status: "available" | "assigned" | "reserved"
      product_status: "active" | "draft" | "archived"
      transcript_speaker: "agent" | "caller" | "system"
      trigger_ready_status: "ready" | "missing_phone" | "not_applicable"
      wa_channel: "whatsapp" | "instagram" | "messenger"
      wa_conversation_status: "active" | "closed" | "escalated" | "expired"
      wa_escalation_reason:
        | "negative_sentiment"
        | "explicit_request"
        | "repeated_failure"
        | "high_value_customer"
        | "complex_query"
        | "manual"
      wa_escalation_status:
        | "pending"
        | "assigned"
        | "resolved"
        | "returned_to_ai"
      wa_intent:
        | "sales"
        | "support"
        | "campaign"
        | "order_status"
        | "abandoned_cart"
        | "unknown"
      wa_message_type:
        | "text"
        | "image"
        | "document"
        | "audio"
        | "video"
        | "location"
        | "contact"
        | "template"
        | "interactive"
        | "reaction"
      wa_rule_status: "active" | "paused" | "draft" | "archived"
      wa_sentiment: "positive" | "negative" | "neutral"
      webhook_status: "active" | "failed" | "pending"
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
      cart_status: ["abandoned", "recovered", "expired"],
      chat_channel: ["whatsapp", "web"],
      chat_sender_role: ["user", "ai", "human_agent", "system"],
      chat_session_status: ["active", "closed", "human_handover"],
      chat_template_status: [
        "pending",
        "approved",
        "rejected",
        "paused",
        "deleted",
      ],
      commerce_source: ["shopify", "woocommerce", "custom_webhook"],
      contact_status: ["active", "inactive"],
      integration_status: ["connected", "disconnected", "error", "pending"],
      list_type: ["static", "dynamic"],
      log_level: ["info", "warning", "error", "success"],
      notification_type: ["info", "success", "warning", "error"],
      order_financial_status: [
        "pending",
        "paid",
        "refunded",
        "partially_refunded",
        "voided",
      ],
      order_fulfillment_status: [
        "unfulfilled",
        "partial",
        "fulfilled",
        "restocked",
      ],
      organization_plan: ["starter", "pro", "enterprise"],
      organization_status: ["active", "trial", "suspended", "cancelled"],
      payment_type: ["cod", "prepaid", "unknown"],
      phone_number_status: ["available", "assigned", "reserved"],
      product_status: ["active", "draft", "archived"],
      transcript_speaker: ["agent", "caller", "system"],
      trigger_ready_status: ["ready", "missing_phone", "not_applicable"],
      wa_channel: ["whatsapp", "instagram", "messenger"],
      wa_conversation_status: ["active", "closed", "escalated", "expired"],
      wa_escalation_reason: [
        "negative_sentiment",
        "explicit_request",
        "repeated_failure",
        "high_value_customer",
        "complex_query",
        "manual",
      ],
      wa_escalation_status: [
        "pending",
        "assigned",
        "resolved",
        "returned_to_ai",
      ],
      wa_intent: [
        "sales",
        "support",
        "campaign",
        "order_status",
        "abandoned_cart",
        "unknown",
      ],
      wa_message_type: [
        "text",
        "image",
        "document",
        "audio",
        "video",
        "location",
        "contact",
        "template",
        "interactive",
        "reaction",
      ],
      wa_rule_status: ["active", "paused", "draft", "archived"],
      wa_sentiment: ["positive", "negative", "neutral"],
      webhook_status: ["active", "failed", "pending"],
    },
  },
} as const
