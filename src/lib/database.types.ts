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
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      bucket_items: {
        Row: {
          category: Database["public"]["Enums"]["bucket_category"]
          created_at: string
          description: string | null
          featured: boolean
          id: string
          image: string | null
          layout: Database["public"]["Enums"]["bucket_layout"]
          suggested_activity: Database["public"]["Enums"]["activity_type"]
          title: string
        }
        Insert: {
          category: Database["public"]["Enums"]["bucket_category"]
          created_at?: string
          description?: string | null
          featured?: boolean
          id?: string
          image?: string | null
          layout: Database["public"]["Enums"]["bucket_layout"]
          suggested_activity: Database["public"]["Enums"]["activity_type"]
          title: string
        }
        Update: {
          category?: Database["public"]["Enums"]["bucket_category"]
          created_at?: string
          description?: string | null
          featured?: boolean
          id?: string
          image?: string | null
          layout?: Database["public"]["Enums"]["bucket_layout"]
          suggested_activity?: Database["public"]["Enums"]["activity_type"]
          title?: string
        }
        Relationships: []
      }
      date_entries: {
        Row: {
          cover_image: string | null
          created_at: string
          created_by: string | null
          date: string
          id: string
          is_draft: boolean
          journey_id: string
          subtitle: string | null
          title: string
          updated_at: string
        }
        Insert: {
          cover_image?: string | null
          created_at?: string
          created_by?: string | null
          date: string
          id?: string
          is_draft?: boolean
          journey_id: string
          subtitle?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          cover_image?: string | null
          created_at?: string
          created_by?: string | null
          date?: string
          id?: string
          is_draft?: boolean
          journey_id?: string
          subtitle?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "date_entries_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "date_entries_journey_id_fkey"
            columns: ["journey_id"]
            isOneToOne: false
            referencedRelation: "journeys"
            referencedColumns: ["id"]
          },
        ]
      }
      journey_bucket_status: {
        Row: {
          bucket_item_id: string
          checked_at: string
          checked_by: string | null
          journey_id: string
        }
        Insert: {
          bucket_item_id: string
          checked_at?: string
          checked_by?: string | null
          journey_id: string
        }
        Update: {
          bucket_item_id?: string
          checked_at?: string
          checked_by?: string | null
          journey_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "journey_bucket_status_bucket_item_id_fkey"
            columns: ["bucket_item_id"]
            isOneToOne: false
            referencedRelation: "bucket_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "journey_bucket_status_checked_by_fkey"
            columns: ["checked_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "journey_bucket_status_journey_id_fkey"
            columns: ["journey_id"]
            isOneToOne: false
            referencedRelation: "journeys"
            referencedColumns: ["id"]
          },
        ]
      }
      journey_invites: {
        Row: {
          code: string
          created_at: string
          created_by: string | null
          expires_at: string
          id: string
          journey_id: string
          redeemed_at: string | null
          redeemed_by: string | null
        }
        Insert: {
          code: string
          created_at?: string
          created_by?: string | null
          expires_at?: string
          id?: string
          journey_id: string
          redeemed_at?: string | null
          redeemed_by?: string | null
        }
        Update: {
          code?: string
          created_at?: string
          created_by?: string | null
          expires_at?: string
          id?: string
          journey_id?: string
          redeemed_at?: string | null
          redeemed_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "journey_invites_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "journey_invites_journey_id_fkey"
            columns: ["journey_id"]
            isOneToOne: false
            referencedRelation: "journeys"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "journey_invites_redeemed_by_fkey"
            columns: ["redeemed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      journey_members: {
        Row: {
          joined_at: string
          journey_id: string
          profile_id: string
          role: Database["public"]["Enums"]["journey_role"]
        }
        Insert: {
          joined_at?: string
          journey_id: string
          profile_id: string
          role?: Database["public"]["Enums"]["journey_role"]
        }
        Update: {
          joined_at?: string
          journey_id?: string
          profile_id?: string
          role?: Database["public"]["Enums"]["journey_role"]
        }
        Relationships: [
          {
            foreignKeyName: "journey_members_journey_id_fkey"
            columns: ["journey_id"]
            isOneToOne: false
            referencedRelation: "journeys"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "journey_members_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      journeys: {
        Row: {
          anniversary_date: string | null
          created_at: string
          created_by: string | null
          id: string
          name: string
        }
        Insert: {
          anniversary_date?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          name?: string
        }
        Update: {
          anniversary_date?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "journeys_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_preferences: {
        Row: {
          anniversary_reminders: boolean
          bucket_list_updates: boolean
          new_date_plans: boolean
          profile_id: string
          reminder_1h: boolean
          reminder_24h: boolean
          updated_at: string
        }
        Insert: {
          anniversary_reminders?: boolean
          bucket_list_updates?: boolean
          new_date_plans?: boolean
          profile_id: string
          reminder_1h?: boolean
          reminder_24h?: boolean
          updated_at?: string
        }
        Update: {
          anniversary_reminders?: boolean
          bucket_list_updates?: boolean
          new_date_plans?: boolean
          profile_id?: string
          reminder_1h?: boolean
          reminder_24h?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_preferences_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          email: string | null
          id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
        }
        Relationships: []
      }
      stops: {
        Row: {
          activity: Database["public"]["Enums"]["activity_type"]
          address: string | null
          completed: boolean
          created_at: string
          date_entry_id: string
          description: string | null
          duration_label: string | null
          id: string
          latitude: number
          longitude: number
          order_index: number
          rating: number | null
          time: string
          title: string
        }
        Insert: {
          activity: Database["public"]["Enums"]["activity_type"]
          address?: string | null
          completed?: boolean
          created_at?: string
          date_entry_id: string
          description?: string | null
          duration_label?: string | null
          id?: string
          latitude: number
          longitude: number
          order_index?: number
          rating?: number | null
          time: string
          title: string
        }
        Update: {
          activity?: Database["public"]["Enums"]["activity_type"]
          address?: string | null
          completed?: boolean
          created_at?: string
          date_entry_id?: string
          description?: string | null
          duration_label?: string | null
          id?: string
          latitude?: number
          longitude?: number
          order_index?: number
          rating?: number | null
          time?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "stops_date_entry_id_fkey"
            columns: ["date_entry_id"]
            isOneToOne: false
            referencedRelation: "date_entries"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_invite: { Args: never; Returns: string }
      is_journey_member: {
        Args: { target_journey_id: string }
        Returns: boolean
      }
      redeem_invite: { Args: { p_code: string }; Returns: undefined }
    }
    Enums: {
      activity_type:
        | "breakfast"
        | "brunch"
        | "dinner"
        | "drinks"
        | "coffee"
        | "dessert"
        | "walk"
        | "hike"
        | "park"
        | "movie"
        | "music"
        | "gallery"
        | "stargazing"
        | "shopping"
        | "surprise"
      bucket_category: "Outdoors" | "Creative" | "Fine Dining" | "Staycation"
      bucket_layout: "large" | "standard" | "wide"
      journey_role: "owner" | "member"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      activity_type: [
        "breakfast",
        "brunch",
        "dinner",
        "drinks",
        "coffee",
        "dessert",
        "walk",
        "hike",
        "park",
        "movie",
        "music",
        "gallery",
        "stargazing",
        "shopping",
        "surprise",
      ],
      bucket_category: ["Outdoors", "Creative", "Fine Dining", "Staycation"],
      bucket_layout: ["large", "standard", "wide"],
      journey_role: ["owner", "member"],
    },
  },
} as const
