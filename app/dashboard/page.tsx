'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/dashboard/dashboard-layout';
import { Pip } from '@/types/pip';
import { useAuth } from '@/hooks/useAuth';

// Mock data for development purposes
const mockPipData: Pip[] = [
  { 
    id: 'pip-001', 
    employeeName: 'Alice Wonderland', 
    employeeId: 'emp-101', 
    managerName: 'Bob The Builder', 
    managerId: 'mgr-201', 
    title: 'Improve Communication Skills', 
    startDate: '2024-07-01', 
    endDate: '2024-09-30', 
    status: 'On Track', 
    progress: 65, 
    nextDueDate: '2024-08-15',
    warningLevel: 'First Warning',
    accountabilityStatus: 'Active'
  },
  { 
    id: 'pip-002', 
    employeeName: 'Charlie Chaplin', 
    employeeId: 'emp-102', 
    managerName: 'Bob The Builder', 
    managerId: 'mgr-201', 
    title: 'Increase Sales Target Achievement', 
    startDate: '2024-06-15', 
    endDate: '2024-08-15', 
    status: 'Needs Attention', 
    progress: 30, 
    nextDueDate: '2024-08-01',
    warningLevel: 'Second Warning',
    accountabilityStatus: 'Active'
  },
  { 
    id: 'pip-003', 
    employeeName: 'Diana Prince', 
    employeeId: 'emp-103', 
    managerName: 'Carol Danvers', 
    managerId: 'mgr-202', 
    title: 'Enhance Technical Documentation', 
    startDate: '2024-07-10', 
    endDate: '2024-10-10', 
    status: 'On Track', 
    progress: 80, 
    nextDueDate: '2024-08-20',
    warningLevel: 'Final Warning',
    accountabilityStatus: 'Active'
  },
  { 
    id: 'pip-004', 
    employeeName: 'Edward Scissorhands', 
    employeeId: 'emp-104', 
    managerName: 'Carol Danvers', 
    managerId: 'mgr-202', 
    title: 'Timeliness and Punctuality', 
    startDate: '2024-05-01', 
    endDate: '2024-07-31', 
    status: 'Overdue', 
    progress: 90, 
    nextDueDate: '2024-07-25',
    warningLevel: 'Final Warning',
    accountabilityStatus: 'Active'
  },
  { 
    id: 'pip-005', 
    employeeName: 'Frank Castle', 
    employeeId: 'emp-105', 
    managerName: 'Bob The Builder', 
    managerId: 'mgr-201', 
    title: 'Teamwork Improvement', 
    startDate: '2024-01-15', 
    endDate: '2024-04-15', 
    status: 'Completed', 
    progress: 100, 
    warningLevel: 'First Warning',
    accountabilityStatus: 'Accountability Period',
    accountabilityEndDate: '2025-04-15'
  },
  { 
    id: 'pip-006', 
    employeeName: 'Gina Rodriguez', 
    employeeId: 'emp-106', 
    managerName: 'Carol Danvers', 
    managerId: 'mgr-202', 
    title: 'Code Quality Standards', 
    startDate: '2024-02-01', 
    endDate: '2024-05-01', 
    status: 'Completed', 
    progress: 100, 
    warningLevel: 'Second Warning',
    accountabilityStatus: 'Accountability Period',
    accountabilityEndDate: '2025-05-01'
  },
  { 
    id: 'pip-007', 
    employeeName: 'Henry Ford', 
    employeeId: 'emp-107', 
    managerName: 'Carol Danvers', 
    managerId: 'mgr-202', 
    title: 'Project Delivery Timeliness', 
    startDate: '2024-03-01', 
    endDate: '2024-06-01', 
    status: 'Completed', 
    progress: 100, 
    warningLevel: 'Final Warning',
    accountabilityStatus: 'Accountability Period',
    accountabilityEndDate: '2025-06-01'
  }
];

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const [pips, setPips] = useState<Pip[]>(mockPipData); // Use mock data for now

  // In a real app, you would fetch data here after auth loads
  // useEffect(() => {
  //   if (user && !loading) {
  //     // fetch real data from Supabase here
  //   }
  // }, [user, loading]);

  return (
    <DashboardLayout pipData={pips}>
      {/* Additional dashboard content could go here */}
    </DashboardLayout>
  );
} 