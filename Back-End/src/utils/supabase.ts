import { createClient } from '@supabase/supabase-js';

// Cliente Supabase para operações públicas (anônimas)
export const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

// Cliente Supabase para operações administrativas (service role)
export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Função helper para obter o cliente apropriado baseado no contexto
export const getSupabaseClient = (useAdmin = false) => {
  return useAdmin ? supabaseAdmin : supabase;
};

// Tipos para o banco de dados
export interface Database {
  public: {
    Tables: {
      stores: {
        Row: {
          id: number;
          name: string;
          address: string | null;
          timezone: string;
          created_at: string;
        };
        Insert: {
          id?: number;
          name: string;
          address?: string | null;
          timezone?: string;
          created_at?: string;
        };
        Update: {
          id?: number;
          name?: string;
          address?: string | null;
          timezone?: string;
          created_at?: string;
        };
      };
      users: {
        Row: {
          id: number;
          name: string;
          last_name: string | null;
          profile_picture: string | null;
          email: string;
          password: string;
          role: string;
          store_id: number;
          active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          name: string;
          last_name?: string | null;
          profile_picture?: string | null;
          email: string;
          password: string;
          role?: string;
          store_id: number;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          name?: string;
          last_name?: string | null;
          profile_picture?: string | null;
          email?: string;
          password?: string;
          role?: string;
          store_id?: number;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      categories: {
        Row: {
          id: number;
          name: string;
        };
        Insert: {
          id?: number;
          name: string;
        };
        Update: {
          id?: number;
          name?: string;
        };
      };
      products: {
        Row: {
          id: number;
          sku: string;
          code: string;
          name: string;
          price: number;
          cost: number;
          stock: number;
          image_url: string | null;
          category_id: number | null;
          barcode: string | null;
          min_stock: number | null;
          unit: string | null;
          active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          sku: string;
          code: string;
          name: string;
          price: number;
          cost: number;
          stock?: number;
          image_url?: string | null;
          category_id?: number | null;
          barcode?: string | null;
          min_stock?: number | null;
          unit?: string | null;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          sku?: string;
          code?: string;
          name?: string;
          price?: number;
          cost?: number;
          stock?: number;
          image_url?: string | null;
          category_id?: number | null;
          barcode?: string | null;
          min_stock?: number | null;
          unit?: string | null;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      orders: {
        Row: {
          id: number;
          client_id: number;
          seller_id: number;
          store_id: number;
          total: number;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          client_id: number;
          seller_id: number;
          store_id: number;
          total: number;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          client_id?: number;
          seller_id?: number;
          store_id?: number;
          total?: number;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      order_items: {
        Row: {
          id: number;
          order_id: number;
          product_id: number;
          qty: number;
          unit_price: number;
          note: string | null;
          updated_at: string;
        };
        Insert: {
          id?: number;
          order_id: number;
          product_id: number;
          qty: number;
          unit_price: number;
          note?: string | null;
          updated_at?: string;
        };
        Update: {
          id?: number;
          order_id?: number;
          product_id?: number;
          qty?: number;
          unit_price?: number;
          note?: string | null;
          updated_at?: string;
        };
      };
      payment_methods: {
        Row: {
          id: number;
          name: string;
          active: boolean;
        };
        Insert: {
          id?: number;
          name: string;
          active?: boolean;
        };
        Update: {
          id?: number;
          name?: string;
          active?: boolean;
        };
      };
    };
  };
}

export default supabase;
