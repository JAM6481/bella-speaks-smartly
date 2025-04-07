export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      analytics: {
        Row: {
          analytics_id: number
          created_at: string | null
          event_data: Json | null
          event_type: string
          user_id: number | null
        }
        Insert: {
          analytics_id?: number
          created_at?: string | null
          event_data?: Json | null
          event_type: string
          user_id?: number | null
        }
        Update: {
          analytics_id?: number
          created_at?: string | null
          event_data?: Json | null
          event_type?: string
          user_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "analytics_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      conversations: {
        Row: {
          conversation_id: number
          created_at: string | null
          is_active: boolean | null
          last_message_at: string | null
          title: string | null
          user_id: number | null
        }
        Insert: {
          conversation_id?: number
          created_at?: string | null
          is_active?: boolean | null
          last_message_at?: string | null
          title?: string | null
          user_id?: number | null
        }
        Update: {
          conversation_id?: number
          created_at?: string | null
          is_active?: boolean | null
          last_message_at?: string | null
          title?: string | null
          user_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "conversations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      integration_credentials: {
        Row: {
          created_at: string | null
          credential_id: number
          credentials: Json
          service_name: string
          updated_at: string | null
          user_id: number | null
        }
        Insert: {
          created_at?: string | null
          credential_id?: number
          credentials: Json
          service_name: string
          updated_at?: string | null
          user_id?: number | null
        }
        Update: {
          created_at?: string | null
          credential_id?: number
          credentials?: Json
          service_name?: string
          updated_at?: string | null
          user_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "integration_credentials_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      intents: {
        Row: {
          created_at: string | null
          description: string | null
          intent_id: number
          intent_name: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          intent_id?: number
          intent_name: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          intent_id?: number
          intent_name?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          audio_file_path: string | null
          conversation_id: number | null
          created_at: string | null
          is_read: boolean | null
          message_id: number
          message_text: string
          sender_type: string
        }
        Insert: {
          audio_file_path?: string | null
          conversation_id?: number | null
          created_at?: string | null
          is_read?: boolean | null
          message_id?: number
          message_text: string
          sender_type: string
        }
        Update: {
          audio_file_path?: string | null
          conversation_id?: number | null
          created_at?: string | null
          is_read?: boolean | null
          message_id?: number
          message_text?: string
          sender_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["conversation_id"]
          },
        ]
      }
      user_intent_context: {
        Row: {
          context_data: Json | null
          context_id: number
          created_at: string | null
          expires_at: string | null
          intent_id: number | null
          user_id: number | null
        }
        Insert: {
          context_data?: Json | null
          context_id?: number
          created_at?: string | null
          expires_at?: string | null
          intent_id?: number | null
          user_id?: number | null
        }
        Update: {
          context_data?: Json | null
          context_id?: number
          created_at?: string | null
          expires_at?: string | null
          intent_id?: number | null
          user_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "user_intent_context_intent_id_fkey"
            columns: ["intent_id"]
            isOneToOne: false
            referencedRelation: "intents"
            referencedColumns: ["intent_id"]
          },
          {
            foreignKeyName: "user_intent_context_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_preferences: {
        Row: {
          created_at: string | null
          language: string | null
          notification_enabled: boolean | null
          preference_id: number
          theme: string | null
          updated_at: string | null
          user_id: number | null
          voice_pitch: number | null
          voice_speed: number | null
        }
        Insert: {
          created_at?: string | null
          language?: string | null
          notification_enabled?: boolean | null
          preference_id?: number
          theme?: string | null
          updated_at?: string | null
          user_id?: number | null
          voice_pitch?: number | null
          voice_speed?: number | null
        }
        Update: {
          created_at?: string | null
          language?: string | null
          notification_enabled?: boolean | null
          preference_id?: number
          theme?: string | null
          updated_at?: string | null
          user_id?: number | null
          voice_pitch?: number | null
          voice_speed?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "user_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_workflows: {
        Row: {
          created_at: string | null
          execution_count: number | null
          last_executed_at: string | null
          user_id: number | null
          user_workflow_id: number
          workflow_id: number | null
        }
        Insert: {
          created_at?: string | null
          execution_count?: number | null
          last_executed_at?: string | null
          user_id?: number | null
          user_workflow_id?: number
          workflow_id?: number | null
        }
        Update: {
          created_at?: string | null
          execution_count?: number | null
          last_executed_at?: string | null
          user_id?: number | null
          user_workflow_id?: number
          workflow_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "user_workflows_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "user_workflows_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "workflows"
            referencedColumns: ["workflow_id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string | null
          email: string
          first_name: string | null
          is_active: boolean | null
          last_login: string | null
          last_name: string | null
          password_hash: string
          user_id: number
          username: string
        }
        Insert: {
          created_at?: string | null
          email: string
          first_name?: string | null
          is_active?: boolean | null
          last_login?: string | null
          last_name?: string | null
          password_hash: string
          user_id?: number
          username: string
        }
        Update: {
          created_at?: string | null
          email?: string
          first_name?: string | null
          is_active?: boolean | null
          last_login?: string | null
          last_name?: string | null
          password_hash?: string
          user_id?: number
          username?: string
        }
        Relationships: []
      }
      voice_recordings: {
        Row: {
          created_at: string | null
          duration_seconds: number | null
          file_path: string
          recording_id: number
          transcription: string | null
          user_id: number | null
        }
        Insert: {
          created_at?: string | null
          duration_seconds?: number | null
          file_path: string
          recording_id?: number
          transcription?: string | null
          user_id?: number | null
        }
        Update: {
          created_at?: string | null
          duration_seconds?: number | null
          file_path?: string
          recording_id?: number
          transcription?: string | null
          user_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "voice_recordings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      workflows: {
        Row: {
          created_at: string | null
          description: string | null
          is_active: boolean | null
          n8n_workflow_id: string | null
          updated_at: string | null
          workflow_id: number
          workflow_name: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          is_active?: boolean | null
          n8n_workflow_id?: string | null
          updated_at?: string | null
          workflow_id?: number
          workflow_name: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          is_active?: boolean | null
          n8n_workflow_id?: string | null
          updated_at?: string | null
          workflow_id?: number
          workflow_name?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
