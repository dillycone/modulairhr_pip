"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// Alternative import approach
import * as Icons from 'lucide-react';

interface DashboardSummaryProps {
  activeCount: number;
  overdueCount: number;
  completedCount: number;
  accountabilityCount: number;
}

export default function DashboardSummary({ activeCount, overdueCount, completedCount, accountabilityCount }: DashboardSummaryProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active PIPs</CardTitle>
          <Icons.ListChecks className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{activeCount}</div>
          <p className="text-xs text-muted-foreground">Currently ongoing plans</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Overdue Tasks/PIPs</CardTitle>
          <Icons.AlertTriangle className="h-4 w-4 text-destructive" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{overdueCount}</div>
          <p className="text-xs text-muted-foreground">Require immediate attention</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Recently Completed</CardTitle>
          <Icons.CheckCircle className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{completedCount}</div>
          <p className="text-xs text-muted-foreground">PIPs completed</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">In Accountability</CardTitle>
          <Icons.Clock className="h-4 w-4 text-amber-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{accountabilityCount}</div>
          <p className="text-xs text-muted-foreground">12-month monitoring period</p>
        </CardContent>
      </Card>
    </div>
  );
} 