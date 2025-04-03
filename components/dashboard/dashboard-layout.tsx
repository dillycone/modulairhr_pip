"use client"

import { useEffect } from 'react';
import { Pip } from '@/types/pip';
import DashboardSummary from './dashboard-summary';
import PipList from './pip-list';
import AccountabilityList from './accountability-list';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

interface DashboardLayoutProps {
  pipData: Pip[];
  children?: React.ReactNode;
}

export default function DashboardLayout({ pipData, children }: DashboardLayoutProps) {
  const router = useRouter();
  const { user, loading } = useAuth();
  
  // Calculate summary stats from pipData
  const activePips = pipData.filter(p => p.accountabilityStatus === 'Active').length;
  const overduePips = pipData.filter(p => p.status === 'Overdue' && p.accountabilityStatus === 'Active').length;
  const completedPips = pipData.filter(p => p.status === 'Completed').length;
  const accountabilityCount = pipData.filter(p => p.accountabilityStatus === 'Accountability Period').length;

  useEffect(() => {
    if (!loading && !user) {
      console.log('No user found in dashboard, redirecting to login');
      const currentPath = window.location.pathname;
      router.push(`/auth/login?redirect=${encodeURIComponent(currentPath)}`);
    }
  }, [user, loading, router]);

  const handleCreateNewPip = () => {
    console.log('Create new PIP button clicked');
    try {
      router.push('/dashboard/create-pip');
    } catch (error) {
      console.error('Error navigating to create-pip:', error);
    }
  };

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4 md:px-6">
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
          <p className="text-sm text-slate-500">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Show message if no user (will redirect)
  if (!user) {
    return (
      <div className="container mx-auto py-8 px-4 md:px-6">
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <p className="text-sm text-slate-500">Please log in to access your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      {/* Render children at the top if provided */}
      {children}
      
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard</h1>
        <Button 
          onClick={handleCreateNewPip} 
          className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full"
        >
          <PlusCircle className="mr-2 h-4 w-4" /> Create New PIP
        </Button>
      </div>

      <DashboardSummary 
        activeCount={activePips} 
        overdueCount={overduePips} 
        completedCount={completedPips}
        accountabilityCount={accountabilityCount}
      />

      <div className="mt-8">
        <h2 className="text-2xl font-semibold tracking-tight text-slate-800 mb-4">Active Performance Improvement Plans</h2>
        <PipList pipData={pipData} />
      </div>
      
      <div className="mt-8">
        <h2 className="text-2xl font-semibold tracking-tight text-slate-800 mb-4">Employees in 12-Month Accountability Period</h2>
        <p className="text-sm text-slate-500 mb-4">
          These employees have successfully completed their PIPs but remain in a 12-month accountability period.
        </p>
        <AccountabilityList pipData={pipData} />
      </div>
    </div>
  );
}
