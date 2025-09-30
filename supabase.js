import { createClient } from '@supabase/supabase-js'
import * as SecureStore from 'expo-secure-store'
import { Platform } from 'react-native'

// Create a custom storage adapter that works across all platforms
const ExpoSecureStoreAdapter = {
    getItem: async (key) => {
        if (Platform.OS === 'web') {
            // Check if we're in a browser environment
            if (typeof window !== 'undefined' && window.localStorage) {
                return window.localStorage.getItem(key)
            }
            // Fallback for SSR or non-browser environments
            return null
        }
        // Use SecureStore for iOS/Android
        return await SecureStore.getItemAsync(key)
    },
    setItem: async (key, value) => {
        if (Platform.OS === 'web') {
            // Check if we're in a browser environment
            if (typeof window !== 'undefined' && window.localStorage) {
                window.localStorage.setItem(key, value)
            }
            return
        }
        // Use SecureStore for iOS/Android
        await SecureStore.setItemAsync(key, value)
    },
    removeItem: async (key) => {
        if (Platform.OS === 'web') {
            // Check if we're in a browser environment
            if (typeof window !== 'undefined' && window.localStorage) {
                window.localStorage.removeItem(key)
            }
            return
        }
        // Use SecureStore for iOS/Android
        await SecureStore.deleteItemAsync(key)
    },
}

const supabaseUrl = 'https://sethozoyxgoarhziwzqv.supabase.co'
const supabaseAnonKey =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNldGhvem95eGdvYXJoeml3enF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg2OTM1NTMsImV4cCI6MjA3NDI2OTU1M30.pMyBNAATHfqInWlZ2eaMStMgeIf_JxTMKgN9HOs-lMg'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        storage: ExpoSecureStoreAdapter,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
})

// For debugging
console.log('Supabase initialized')
console.log('Platform:', Platform.OS)
if (typeof window !== 'undefined') {
    console.log('Running in browser environment')
} else {
    console.log('Running in server/bundler environment')
}