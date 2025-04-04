'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import DashboardLayout from '@/components/dashboard/dashboard-layout';
import { Pip, adaptPipForUI } from '@/types/pip';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const [pips, setPips] = useState<any[]>([]);

  useEffect(() => {
    async function fetchPips() {
      // Wait until user is loaded
      if (!user) return;

      // Fetch all PIPs from the database
      const { data, error } = await supabase
        .from('pips')
        .select('*');

      if (error) {
        console.error('Error fetching PIPs:', error);
      } else {
        console.log('Fetched PIPs:', data);
        // Convert snake_case database fields to camelCase for UI
        const adaptedPips = (data as Pip[]).map(adaptPipForUI);
        setPips(adaptedPips);
      }
    }

    if (!loading) {
      fetchPips();
    }
  }, [user, loading]);

  return (
    <DashboardLayout pipData={pips}>
      {/* Additional dashboard UI goes here */}
    </DashboardLayout>
  );
}
