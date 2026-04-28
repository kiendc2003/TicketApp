import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import { Platform } from "react-native";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

// 🔥 detect web hay mobile
const isWeb = Platform.OS === "web";

// 🔥 custom storage cho web
const WebStorage = {
  getItem: (key: string) => {
    if (typeof window === "undefined") return Promise.resolve(null);
    return Promise.resolve(localStorage.getItem(key));
  },
  setItem: (key: string, value: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(key, value);
    }
    return Promise.resolve();
  },
  removeItem: (key: string) => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(key);
    }
    return Promise.resolve();
  },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: isWeb ? WebStorage : AsyncStorage, // 🔥 FIX CHÍNH
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: isWeb, // web cần true
  },
});