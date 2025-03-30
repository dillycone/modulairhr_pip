"use client"

import { Pip, WarningLevel } from '@/types/pip';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AccountabilityListProps {
  pipData: Pip[];
}

// Helper function for warning level badge styling
const getWarningLevelBadgeColor = (level: WarningLevel): string => {
  switch (level) {
    case 'First Warning': return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'Second Warning': return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'Final Warning': return 'bg-red-100 text-red-800 border-red-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

// Calculate days remaining in accountability period
const getDaysRemaining = (endDate: string): number => {
  const end = new Date(endDate);
  const today = new Date();
  const diffTime = end.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export default function AccountabilityList({ pipData }: AccountabilityListProps) {
  // Get only employees in accountability period
  const accountabilityPips = pipData.filter(pip => 
    pip.accountabilityStatus === 'Accountability Period' && 
    pip.status === 'Completed' && 
    pip.accountabilityEndDate
  );

  if (accountabilityPips.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No employees currently in accountability period.
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Employee</TableHead>
            <TableHead>Warning Level</TableHead>
            <TableHead>Manager</TableHead>
            <TableHead>Completed PIP</TableHead>
            <TableHead>Completion Date</TableHead>
            <TableHead>Accountability Ends</TableHead>
            <TableHead>Days Remaining</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {accountabilityPips.map((pip) => {
            const daysRemaining = pip.accountabilityEndDate ? getDaysRemaining(pip.accountabilityEndDate) : 0;
            return (
              <TableRow key={pip.id}>
                <TableCell className="font-medium">{pip.employeeName}</TableCell>
                <TableCell>
                  <Badge className={cn(getWarningLevelBadgeColor(pip.warningLevel))}>
                    {pip.warningLevel}
                  </Badge>
                </TableCell>
                <TableCell>{pip.managerName}</TableCell>
                <TableCell>{pip.title}</TableCell>
                <TableCell>{pip.endDate}</TableCell>
                <TableCell>{pip.accountabilityEndDate}</TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <span className={cn(
                      "font-medium",
                      daysRemaining < 30 ? "text-red-600" : 
                      daysRemaining < 90 ? "text-orange-600" : 
                      "text-green-600"
                    )}>
                      {daysRemaining} days
                    </span>
                    {daysRemaining < 30 && (
                      <AlertCircle className="h-4 w-4 ml-2 text-red-600" />
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Eye className="h-4 w-4" />
                    <span className="sr-only">View Details</span>
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
} 