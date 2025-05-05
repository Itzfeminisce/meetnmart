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
      escrow_transactions: {
        Row: {
          amount: number
          buyer_id: string
          created_at: string
          delivery_agent_id: string | null
          description: string | null
          id: string
          is_delivery: boolean
          seller_id: string
          service_description: string | null
          status: Database["public"]["Enums"]["escrow_status"]
          updated_at: string
        }
        Insert: {
          amount: number
          buyer_id: string
          created_at?: string
          delivery_agent_id?: string | null
          description?: string | null
          id?: string
          is_delivery?: boolean
          seller_id: string
          service_description?: string | null
          status?: Database["public"]["Enums"]["escrow_status"]
          updated_at?: string
        }
        Update: {
          amount?: number
          buyer_id?: string
          created_at?: string
          delivery_agent_id?: string | null
          description?: string | null
          id?: string
          is_delivery?: boolean
          seller_id?: string
          service_description?: string | null
          status?: Database["public"]["Enums"]["escrow_status"]
          updated_at?: string
        }
        Relationships: []
      }
      markets: {
        Row: {
          address: string
          created_at: string | null
          id: string
          location: unknown | null
          name: string
          place_id: string
          updated_at: string | null
          user_count: number | null
        }
        Insert: {
          address: string
          created_at?: string | null
          id?: string
          location?: unknown | null
          name: string
          place_id: string
          updated_at?: string | null
          user_count?: number | null
        }
        Update: {
          address?: string
          created_at?: string | null
          id?: string
          location?: unknown | null
          name?: string
          place_id?: string
          updated_at?: string | null
          user_count?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar: string | null
          category: string | null
          created_at: string
          description: string | null
          id: string
          is_online: boolean | null
          is_seller: boolean
          name: string | null
          phone_number: string | null
          updated_at: string
        }
        Insert: {
          avatar?: string | null
          category?: string | null
          created_at?: string
          description?: string | null
          id: string
          is_online?: boolean | null
          is_seller?: boolean
          name?: string | null
          phone_number?: string | null
          updated_at?: string
        }
        Update: {
          avatar?: string | null
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_online?: boolean | null
          is_seller?: boolean
          name?: string | null
          phone_number?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      recent_visits: {
        Row: {
          id: string
          market_address: string
          market_name: string
          place_id: string
          user_id: string
          visited_at: string | null
        }
        Insert: {
          id?: string
          market_address: string
          market_name: string
          place_id: string
          user_id: string
          visited_at?: string | null
        }
        Update: {
          id?: string
          market_address?: string
          market_name?: string
          place_id?: string
          user_id?: string
          visited_at?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      waitlist: {
        Row: {
          created_at: string
          email: string
          id: string
          role: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          role?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          role?: string
        }
        Relationships: []
      }
      wallets: {
        Row: {
          balance: number
          created_at: string
          escrowed_balance: number
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          balance?: number
          created_at?: string
          escrowed_balance?: number
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          balance?: number
          created_at?: string
          escrowed_balance?: number
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: { uid: string }
        Returns: string
      }
      get_user_wallet: {
        Args: { uid: string }
        Returns: Json
      }
      get_users_by_role: {
        Args: { target_role: Database["public"]["Enums"]["user_role"] }
        Returns: {
          id: string
          name: string
          avatar: string
          description: string
          is_online: boolean
        }[]
      }
      increment_market_user_count: {
        Args: { market_place_id: string }
        Returns: undefined
      }
    }
    Enums: {
      escrow_status:
        | "initiated"
        | "pending"
        | "held"
        | "delivered"
        | "confirmed"
        | "released"
        | "disputed"
        | "refunded"
      user_role: "buyer" | "seller" | "moderator" | "admin"
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
    Enums: {
      escrow_status: [
        "initiated",
        "pending",
        "held",
        "delivered",
        "confirmed",
        "released",
        "disputed",
        "refunded",
      ],
      user_role: ["buyer", "seller", "moderator", "admin"],
    },
  },
} as const
