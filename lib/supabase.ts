"use client";

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '../types/supabase';

/**
 * Creates and returns a configured Supabase client using cookie-based sessions.
 * This client is for client-side components.
 */
export const supabase = createClientComponentClient<Database>(); 