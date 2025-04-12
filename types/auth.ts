import { User } from '@supabase/supabase-js'
import { AuthError as HookAuthError } from '@/hooks/useAuth'

export interface AuthState {
  user: User | null
  isLoading: boolean
  error: HookAuthError | null
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