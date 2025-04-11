import type { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

/**
 * Fetches the organization ID for the currently authenticated user
 * Checks user_profiles first, then falls back to employee records if needed
 * 
 * @param supabase - A Supabase server client instance
 * @param userId - Optional explicit user ID (defaults to current auth user)
 * @returns The user's organization ID as a string, or null if not found
 */
export async function getOrganizationId(
  supabase: SupabaseClient<Database>,
  userId?: string
): Promise<string | null> {
  try {
    // If no userId provided, get the current authenticated user
    if (!userId) {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        console.error("Error fetching current user:", userError?.message || "No user session");
        return null;
      }
      
      userId = user.id;
    }
    
    // For development mode, provide a fallback organization ID for testing
    if (process.env.NODE_ENV === 'development') {
      const devOrgId = process.env.DEV_DEFAULT_ORG_ID || 'dev-org-id-123';
      console.log(`DEV MODE: Using fallback organization ID: ${devOrgId}`);
      return devOrgId;
    }
    
    // Try to get organization_id from user_profiles first
    const { data: profileData, error: profileError } = await supabase
      .from('user_profiles')
      .select('organization_id')
      .eq('user_id', userId)
      .single();
      
    if (!profileError && profileData?.organization_id) {
      return profileData.organization_id;
    }
    
    // If not found in profiles, try to extract organization from employees
    // This may need adjustment based on your specific data model
    const { data: employeeData, error: employeeError } = await supabase
      .from('employees')
      .select('organization_id') // Adjust column name if different
      .eq('user_id', userId)
      .single();
    
    if (!employeeError && employeeData?.organization_id) {
      return employeeData.organization_id;
    }
    
    // No organization found
    console.warn(`No organization ID found for user ${userId}`);
    return null;
    
  } catch (err: any) {
    console.error("Error determining organization ID:", err.message);
    return null;
  }
}