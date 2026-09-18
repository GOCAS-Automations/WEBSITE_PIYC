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
      horarios_mensuales: {
        Row: {
          anio: number
          created_at: string
          dias: Json
          id: string
          mes: number
          notas: string | null
          updated_at: string
        }
        Insert: {
          anio: number
          created_at?: string
          dias?: Json
          id?: string
          mes: number
          notas?: string | null
          updated_at?: string
        }
        Update: {
          anio?: number
          created_at?: string
          dias?: Json
          id?: string
          mes?: number
          notas?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      jornadas: {
        Row: {
          calculado_at: string | null
          contexto_calculo: Json | null
          created_at: string
          description: string
          desglose: Json | null
          employee_id: string
          end_at: string
          id: string
          observations: string | null
          review_note: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          start_at: string
          status: string
          updated_at: string
          work_date: string
          work_order: string | null
        }
        Insert: {
          calculado_at?: string | null
          contexto_calculo?: Json | null
          created_at?: string
          description: string
          desglose?: Json | null
          employee_id: string
          end_at: string
          id?: string
          observations?: string | null
          review_note?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          start_at: string
          status?: string
          updated_at?: string
          work_date: string
          work_order?: string | null
        }
        Update: {
          calculado_at?: string | null
          contexto_calculo?: Json | null
          created_at?: string
          description?: string
          desglose?: Json | null
          employee_id?: string
          end_at?: string
          id?: string
          observations?: string | null
          review_note?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          start_at?: string
          status?: string
          updated_at?: string
          work_date?: string
          work_order?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "jornadas_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jornadas_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          active: boolean
          cargo: string | null
          cedula: string | null
          created_at: string
          email: string | null
          email_contacto: string | null
          full_name: string | null
          id: string
          phone: string | null
          role: string
          updated_at: string
          username: string | null
        }
        Insert: {
          active?: boolean
          cargo?: string | null
          cedula?: string | null
          created_at?: string
          email?: string | null
          email_contacto?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          role?: string
          updated_at?: string
          username?: string | null
        }
        Update: {
          active?: boolean
          cargo?: string | null
          cedula?: string | null
          created_at?: string
          email?: string | null
          email_contacto?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          role?: string
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
      site_mensajes: {
        Row: {
          canal: string
          created_at: string
          destino: string | null
          email: string | null
          empresa: string
          id: string
          ip_hash: string | null
          mensaje: string
          nombre: string
          servicio: string | null
          telefono: string
        }
        Insert: {
          canal?: string
          created_at?: string
          destino?: string | null
          email?: string | null
          empresa: string
          id?: string
          ip_hash?: string | null
          mensaje: string
          nombre: string
          servicio?: string | null
          telefono: string
        }
        Update: {
          canal?: string
          created_at?: string
          destino?: string | null
          email?: string | null
          empresa?: string
          id?: string
          ip_hash?: string | null
          mensaje?: string
          nombre?: string
          servicio?: string | null
          telefono?: string
        }
        Relationships: []
      }
      site_projects: {
        Row: {
          body: string | null
          client: string | null
          created_at: string
          description: string | null
          id: string
          images: Json
          published: boolean
          slug: string
          sort: number
          title: string
          updated_at: string
        }
        Insert: {
          body?: string | null
          client?: string | null
          created_at?: string
          description?: string | null
          id?: string
          images?: Json
          published?: boolean
          slug: string
          sort?: number
          title: string
          updated_at?: string
        }
        Update: {
          body?: string | null
          client?: string | null
          created_at?: string
          description?: string | null
          id?: string
          images?: Json
          published?: boolean
          slug?: string
          sort?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      site_services: {
        Row: {
          created_at: string
          description: string | null
          icon_key: string | null
          id: string
          images: Json
          items: Json
          meta_description: string | null
          meta_title: string | null
          nav_title: string | null
          published: boolean
          slug: string
          sort: number
          summary: string | null
          title: string
          updated_at: string
          video: Json | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon_key?: string | null
          id?: string
          images?: Json
          items?: Json
          meta_description?: string | null
          meta_title?: string | null
          nav_title?: string | null
          published?: boolean
          slug: string
          sort?: number
          summary?: string | null
          title: string
          updated_at?: string
          video?: Json | null
        }
        Update: {
          created_at?: string
          description?: string | null
          icon_key?: string | null
          id?: string
          images?: Json
          items?: Json
          meta_description?: string | null
          meta_title?: string | null
          nav_title?: string | null
          published?: boolean
          slug?: string
          sort?: number
          summary?: string | null
          title?: string
          updated_at?: string
          video?: Json | null
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          value?: Json
        }
        Update: {
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      site_values: {
        Row: {
          created_at: string
          description: string | null
          icon_key: string | null
          id: string
          published: boolean
          sort: number
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon_key?: string | null
          id?: string
          published?: boolean
          sort?: number
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          icon_key?: string | null
          id?: string
          published?: boolean
          sort?: number
          title?: string
          updated_at?: string
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
