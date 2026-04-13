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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      capability_posts: {
        Row: {
          capability: string
          content: string | null
          content_blocks: Json | null
          created_at: string
          excerpt: string | null
          featured_stat: string | null
          hero_image_url: string | null
          id: string
          is_featured: boolean
          is_published: boolean
          link_url: string | null
          password: string | null
          published_at: string | null
          sector_label: string | null
          slug: string | null
          stats: Json | null
          title: string
          type: string
        }
        Insert: {
          capability: string
          content?: string | null
          content_blocks?: Json | null
          created_at?: string
          excerpt?: string | null
          featured_stat?: string | null
          hero_image_url?: string | null
          id?: string
          is_featured?: boolean
          is_published?: boolean
          link_url?: string | null
          password?: string | null
          published_at?: string | null
          sector_label?: string | null
          slug?: string | null
          stats?: Json | null
          title: string
          type: string
        }
        Update: {
          capability?: string
          content?: string | null
          content_blocks?: Json | null
          created_at?: string
          excerpt?: string | null
          featured_stat?: string | null
          hero_image_url?: string | null
          id?: string
          is_featured?: boolean
          is_published?: boolean
          link_url?: string | null
          password?: string | null
          published_at?: string | null
          sector_label?: string | null
          slug?: string | null
          stats?: Json | null
          title?: string
          type?: string
        }
        Relationships: []
      }
      diagnostic_case_studies: {
        Row: {
          created_at: string
          id: string
          is_published: boolean
          issue: string
          link_url: string | null
          name: string
          outcome: string
          phases: Json | null
          sort_order: number
        }
        Insert: {
          created_at?: string
          id?: string
          is_published?: boolean
          issue?: string
          link_url?: string | null
          name: string
          outcome?: string
          phases?: Json | null
          sort_order?: number
        }
        Update: {
          created_at?: string
          id?: string
          is_published?: boolean
          issue?: string
          link_url?: string | null
          name?: string
          outcome?: string
          phases?: Json | null
          sort_order?: number
        }
        Relationships: []
      }
      diagnostic_contacts: {
        Row: {
          capabilities_ranked: string[] | null
          created_at: string
          custom_challenge: string | null
          email: string
          engagement_path: string | null
          first_name: string
          has_media_experience: boolean | null
          id: string
          last_name: string
          metrics_checked: string[] | null
          metrics_unchecked: string[] | null
          organization: string | null
          practice_selections: number[] | null
          quiz_answers: Json | null
          readiness_score: number | null
          report_cache: string | null
          report_status: string | null
          sectors_not_selected: string[] | null
          selected_domains: string[] | null
          selected_pains: string[] | null
        }
        Insert: {
          capabilities_ranked?: string[] | null
          created_at?: string
          custom_challenge?: string | null
          email: string
          engagement_path?: string | null
          first_name: string
          has_media_experience?: boolean | null
          id?: string
          last_name: string
          metrics_checked?: string[] | null
          metrics_unchecked?: string[] | null
          organization?: string | null
          practice_selections?: number[] | null
          quiz_answers?: Json | null
          readiness_score?: number | null
          report_cache?: string | null
          report_status?: string | null
          sectors_not_selected?: string[] | null
          selected_domains?: string[] | null
          selected_pains?: string[] | null
        }
        Update: {
          capabilities_ranked?: string[] | null
          created_at?: string
          custom_challenge?: string | null
          email?: string
          engagement_path?: string | null
          first_name?: string
          has_media_experience?: boolean | null
          id?: string
          last_name?: string
          metrics_checked?: string[] | null
          metrics_unchecked?: string[] | null
          organization?: string | null
          practice_selections?: number[] | null
          quiz_answers?: Json | null
          readiness_score?: number | null
          report_cache?: string | null
          report_status?: string | null
          sectors_not_selected?: string[] | null
          selected_domains?: string[] | null
          selected_pains?: string[] | null
        }
        Relationships: []
      }
      diagnostic_submissions: {
        Row: {
          created_at: string
          id: string
          message: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
        }
        Relationships: []
      }
      impact_stats: {
        Row: {
          case_study_id: string | null
          created_at: string
          description: string
          id: string
          label: string
          phase_title: string | null
          post_id: string | null
          sort_order: number
          visible: boolean
        }
        Insert: {
          case_study_id?: string | null
          created_at?: string
          description?: string
          id?: string
          label: string
          phase_title?: string | null
          post_id?: string | null
          sort_order?: number
          visible?: boolean
        }
        Update: {
          case_study_id?: string | null
          created_at?: string
          description?: string
          id?: string
          label?: string
          phase_title?: string | null
          post_id?: string | null
          sort_order?: number
          visible?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "impact_stats_case_study_id_fkey"
            columns: ["case_study_id"]
            isOneToOne: false
            referencedRelation: "diagnostic_case_studies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "impact_stats_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "capability_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      site_settings: {
        Row: {
          id: string
          key: string
          value: string | null
        }
        Insert: {
          id?: string
          key: string
          value?: string | null
        }
        Update: {
          id?: string
          key?: string
          value?: string | null
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
    Enums: {},
  },
} as const
