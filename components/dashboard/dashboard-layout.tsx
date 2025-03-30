"use client"

import { Pip } from '@/types/pip';
import DashboardSummary from './dashboard-summary';
import PipList from './pip-list';
import AccountabilityList from './accountability-list';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

interface DashboardLayoutProps {
  pipData: Pip[];
}

export default function DashboardLayout({ pipData }: DashboardLayoutProps) {
  // Calculate summary stats from pipData
  const activePips = pipData.filter(p => p.accountabilityStatus === 'Active').length;
  const overduePips = pipData.filter(p => p.status === 'Overdue' && p.accountabilityStatus === 'Active').length;
  const completedPips = pipData.filter(p => p.status === 'Completed').length;
  const accountabilityCount = pipData.filter(p => p.accountabilityStatus === 'Accountability Period').length;

  const handleCreateNewPip = () => {
    console.log('Initiate New PIP flow...');
    // Later: router.push('/pips/create');
  };

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard</h1>
        <Button onClick={handleCreateNewPip} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full">
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