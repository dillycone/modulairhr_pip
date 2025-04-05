'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { Pip, adaptPipForUI } from '@/types/pip';
import DashboardSummary from '@/components/dashboard/dashboard-summary';
import PipList from '@/components/dashboard/pip-list';
import AccountabilityList from '@/components/dashboard/accountability-list';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const [pips, setPips] = useState<any[]>([]);
  const router = useRouter();

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

  // Calculate summary stats from pipData
  const activePips = pips.filter(p => p.accountabilityStatus === 'Active').length;
  const overduePips = pips.filter(p => p.status === 'Overdue' && p.accountabilityStatus === 'Active').length;
  const completedPips = pips.filter(p => p.status === 'Completed').length;
  const accountabilityCount = pips.filter(p => p.accountabilityStatus === 'Accountability Period').length;

  const handleCreateNewPip = () => {
    router.push('/dashboard/create-pip');
  };

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard</h1>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <>
          <DashboardSummary 
            activeCount={activePips} 
            overdueCount={overduePips} 
            completedCount={completedPips}
            accountabilityCount={accountabilityCount}
          />

          <div className="mt-8">
            <h2 className="text-2xl font-semibold tracking-tight text-slate-800 mb-4">Active Performance Improvement Plans</h2>
            <PipList pipData={pips} />
          </div>
          
          <div className="mt-8">
            <h2 className="text-2xl font-semibold tracking-tight text-slate-800 mb-4">Employees in 12-Month Accountability Period</h2>
            <p className="text-sm text-slate-500 mb-4">
              These employees have successfully completed their PIPs but remain in a 12-month accountability period.
            </p>
            <AccountabilityList pipData={pips} />
          </div>
        </>
      )}
    </div>
  );
}
