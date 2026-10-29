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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      admins: {
        Row: {
          created_at: string
          email: string | null
          id: string
          is_verified: boolean
          name: string
          password_hash: string | null
          personal_email: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          is_verified?: boolean
          name: string
          password_hash?: string | null
          personal_email?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          is_verified?: boolean
          name?: string
          password_hash?: string | null
          personal_email?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      attendance_records: {
        Row: {
          created_at: string
          date: string
          id: string
          marked_by: string | null
          status: string
          stream_id: string | null
          student_id: string | null
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          marked_by?: string | null
          status?: string
          stream_id?: string | null
          student_id?: string | null
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          marked_by?: string | null
          status?: string
          stream_id?: string | null
          student_id?: string | null
        }
        Relationships: []
      }
      classes: {
        Row: {
          created_at: string
          id: string
          name: string | null
          title: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name?: string | null
          title?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string | null
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      electoral_applications: {
        Row: {
          age: number | null
          class_name: string | null
          class_teacher_name: string | null
          class_teacher_tel: string | null
          created_at: string
          experience: string | null
          id: string
          parent_name: string | null
          parent_tel: string | null
          position: string | null
          qualifications: string | null
          sex: string | null
          status: string
          stream_name: string | null
          student_email: string | null
          student_id: string | null
          student_name: string | null
          student_photo: string | null
          submitted_at: string | null
          why_apply: string | null
        }
        Insert: {
          age?: number | null
          class_name?: string | null
          class_teacher_name?: string | null
          class_teacher_tel?: string | null
          created_at?: string
          experience?: string | null
          id?: string
          parent_name?: string | null
          parent_tel?: string | null
          position?: string | null
          qualifications?: string | null
          sex?: string | null
          status?: string
          stream_name?: string | null
          student_email?: string | null
          student_id?: string | null
          student_name?: string | null
          student_photo?: string | null
          submitted_at?: string | null
          why_apply?: string | null
        }
        Update: {
          age?: number | null
          class_name?: string | null
          class_teacher_name?: string | null
          class_teacher_tel?: string | null
          created_at?: string
          experience?: string | null
          id?: string
          parent_name?: string | null
          parent_tel?: string | null
          position?: string | null
          qualifications?: string | null
          sex?: string | null
          status?: string
          stream_name?: string | null
          student_email?: string | null
          student_id?: string | null
          student_name?: string | null
          student_photo?: string | null
          submitted_at?: string | null
          why_apply?: string | null
        }
        Relationships: []
      }
      electoral_rows: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          title: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          title: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          title?: string
        }
        Relationships: []
      }
      electoral_votes: {
        Row: {
          browser: string | null
          candidate_id: string | null
          candidate_name: string | null
          created_at: string
          device_type: string | null
          id: string
          ip_address: string | null
          language: string | null
          latitude: string | null
          location_accuracy: string | null
          longitude: string | null
          os: string | null
          position: string | null
          screen_resolution: string | null
          timezone: string | null
          vote_status: string | null
          voted_at: string
          voter_id: string | null
          voter_name: string | null
        }
        Insert: {
          browser?: string | null
          candidate_id?: string | null
          candidate_name?: string | null
          created_at?: string
          device_type?: string | null
          id?: string
          ip_address?: string | null
          language?: string | null
          latitude?: string | null
          location_accuracy?: string | null
          longitude?: string | null
          os?: string | null
          position?: string | null
          screen_resolution?: string | null
          timezone?: string | null
          vote_status?: string | null
          voted_at?: string
          voter_id?: string | null
          voter_name?: string | null
        }
        Update: {
          browser?: string | null
          candidate_id?: string | null
          candidate_name?: string | null
          created_at?: string
          device_type?: string | null
          id?: string
          ip_address?: string | null
          language?: string | null
          latitude?: string | null
          location_accuracy?: string | null
          longitude?: string | null
          os?: string | null
          position?: string | null
          screen_resolution?: string | null
          timezone?: string | null
          vote_status?: string | null
          voted_at?: string
          voter_id?: string | null
          voter_name?: string | null
        }
        Relationships: []
      }
      physical_votes: {
        Row: {
          added_at: string | null
          candidate_id: string | null
          candidate_name: string | null
          created_at: string
          id: string
          notes: string | null
          position: string | null
          votes_count: number
        }
        Insert: {
          added_at?: string | null
          candidate_id?: string | null
          candidate_name?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          position?: string | null
          votes_count?: number
        }
        Update: {
          added_at?: string | null
          candidate_id?: string | null
          candidate_name?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          position?: string | null
          votes_count?: number
        }
        Relationships: []
      }
      portal_auth_attempts: {
        Row: {
          attempt_key: string
          attempts: number
          started_at: string
        }
        Insert: {
          attempt_key: string
          attempts?: number
          started_at?: string
        }
        Update: {
          attempt_key?: string
          attempts?: number
          started_at?: string
        }
        Relationships: []
      }
      streams: {
        Row: {
          class_id: string | null
          created_at: string
          id: string
          name: string | null
          title: string | null
          updated_at: string
        }
        Insert: {
          class_id?: string | null
          created_at?: string
          id?: string
          name?: string | null
          title?: string | null
          updated_at?: string
        }
        Update: {
          class_id?: string | null
          created_at?: string
          id?: string
          name?: string | null
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      student_google_accounts: {
        Row: {
          auth_user_id: string
          google_email: string
          linked_at: string
          student_id: string
        }
        Insert: {
          auth_user_id: string
          google_email: string
          linked_at?: string
          student_id: string
        }
        Update: {
          auth_user_id?: string
          google_email?: string
          linked_at?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_google_accounts_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: true
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      students: {
        Row: {
          class_id: string
          created_at: string
          default_password: string | null
          email: string
          gender: string | null
          id: string
          is_verified: boolean
          name: string
          password_hash: string
          personal_email: string | null
          photo_url: string | null
          stream_id: string
        }
        Insert: {
          class_id?: string
          created_at?: string
          default_password?: string | null
          email: string
          gender?: string | null
          id?: string
          is_verified?: boolean
          name: string
          password_hash: string
          personal_email?: string | null
          photo_url?: string | null
          stream_id?: string
        }
        Update: {
          class_id?: string
          created_at?: string
          default_password?: string | null
          email?: string
          gender?: string | null
          id?: string
          is_verified?: boolean
          name?: string
          password_hash?: string
          personal_email?: string | null
          photo_url?: string | null
          stream_id?: string
        }
        Relationships: []
      }
      teachers: {
        Row: {
          classesTaught: string | null
          contactNumber: number | null
          created_at: string
          default_password: number | null
          email: string | null
          id: string
          is_verified: boolean
          name: string
          nationality: string | null
          password_hash: string | null
          personal_email: string | null
          photo_url: string | null
          sex: string | null
          subjectsTaught: string | null
          updated_at: string
        }
        Insert: {
          classesTaught?: string | null
          contactNumber?: number | null
          created_at?: string
          default_password?: number | null
          email?: string | null
          id?: string
          is_verified?: boolean
          name: string
          nationality?: string | null
          password_hash?: string | null
          personal_email?: string | null
          photo_url?: string | null
          sex?: string | null
          subjectsTaught?: string | null
          updated_at?: string
        }
        Update: {
          classesTaught?: string | null
          contactNumber?: number | null
          created_at?: string
          default_password?: number | null
          email?: string | null
          id?: string
          is_verified?: boolean
          name?: string
          nationality?: string | null
          password_hash?: string | null
          personal_email?: string | null
          photo_url?: string | null
          sex?: string | null
          subjectsTaught?: string | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      connect_student_google: {
        Args: {
          p_auth_user_id: string
          p_email: string
          p_name: string
          p_student_id?: string
        }
        Returns: string
      }
      consume_portal_auth_attempt: { Args: { p_key: string }; Returns: boolean }
    }
    Enums: {
      [_ in never]: never
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
