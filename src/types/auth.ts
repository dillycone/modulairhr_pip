import { User } from '@supabase/supabase-js'

export interface AuthState {
  user: User | null
  isLoading: boolean
  error: Error | null
}

export interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
}

export interface AuthProviderProps {
  children: React.ReactNode
} 