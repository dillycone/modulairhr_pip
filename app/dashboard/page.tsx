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
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const [pips, setPips] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    async function fetchPips() {
      // Wait until user is loaded
      if (!user) return;

      try {
        // Use mock data only in development if explicitly enabled
        // This allows for local development without a DB connection
        if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
          console.log('DEV MODE: Using mock PIP data');
          const mockData = [
            {
              id: 'mock-1',
              employee_name: 'Jane Smith',
              manager_name: 'John Manager',
              start_date: '2023-12-01',
              end_date: '2024-01-31',
              status: 'On Track',
              progress: 65,
              next_due_date: '2024-01-15',
              warning_level: 'First Warning',
              accountability_status: 'Active',
              created_by: user.id,
            },
            {
              id: 'mock-2',
              employee_name: 'Tom Jones',
              manager_name: 'John Manager',
              start_date: '2023-11-15',
              end_date: '2024-01-15',
              status: 'Needs Attention',
              progress: 40,
              next_due_date: '2024-01-05',
              warning_level: 'Second Warning',
              accountability_status: 'Active',
              created_by: user.id,
            }
          ];
          const adaptedPips = mockData.map(adaptPipForUI);
          setPips(adaptedPips);
          return;
        }

        // Use our new API endpoint to fetch PIPs
        const response = await fetch('/api/pips');
        if (!response.ok) {
          const responseData = await response.json();
          throw new Error(responseData.error || 'Failed to fetch PIPs from API');
        }
        
        const result = await response.json();
        
        // Handle result even if data is empty array
        if (!result.data && result.data !== null && !Array.isArray(result.data)) {
          console.warn('No data or invalid data returned from API:', result);
          setPips([]);
          setError("No PIPs found for your account. You may not have permissions to view any PIPs.");
          return;
        }
        
        console.log('Fetched PIPs from API:', result.data);
        // Convert snake_case database fields to camelCase for UI (if data exists)
        const adaptedPips = (Array.isArray(result.data) ? result.data : []).map(adaptPipForUI);
        setPips(adaptedPips);
        setError(null);
        
      } catch (err: any) {
        console.error('Exception fetching PIPs:', err);
        const errorMsg = `Error: ${err.message || 'Unknown error'}`;
        setError(errorMsg);
        setPips([]); // Clear existing pips on error
        
        toast({
          variant: "destructive",
          title: "Data Fetch Error",
          description: errorMsg,
        });
      }
    }

    if (!loading) {
      fetchPips();
    }
  }, [user, loading, toast]);

  // Calculate summary stats from pipData - with safe default values
  const activePips = pips.filter(p => (p.accountabilityStatus || 'Active') === 'Active').length;
  const overduePips = pips.filter(p => (p.status === 'Overdue' || p.status === 'overdue') && (p.accountabilityStatus || 'Active') === 'Active').length;
  const completedPips = pips.filter(p => (p.status === 'Completed' || p.status === 'completed')).length;
  const accountabilityCount = pips.filter(p => p.accountabilityStatus === 'Accountability Period').length;

  const handleCreateNewPip = () => {
    router.push('/create-pip/select-template');
  };

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard</h1>
        <Button 
          onClick={handleCreateNewPip}
          className="bg-indigo-600 hover:bg-indigo-700 text-white"
        >
          <PlusCircle className="h-4 w-4 mr-2" /> Create New PIP
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6 border-red-500 shadow-md">
          <AlertTitle className="text-lg font-semibold">Data Loading Error</AlertTitle>
          <AlertDescription className="text-sm">{error}</AlertDescription>
        </Alert>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center h-64 text-slate-500">
          <p>Unable to load dashboard data. Please try again later.</p>
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
