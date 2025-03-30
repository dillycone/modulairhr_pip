"use client"

import { Pip, PipStatus, WarningLevel } from '@/types/pip';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PipListProps {
  pipData: Pip[];
}

// Helper function for status badge styling
const getStatusBadgeVariant = (status: PipStatus): 'default' | 'destructive' | 'secondary' | 'outline' => {
  switch (status) {
    case 'Overdue': return 'destructive';
    case 'Needs Attention': return 'secondary';
    case 'On Track': return 'default';
    case 'Completed': return 'outline';
    case 'Draft': return 'outline';
    default: return 'default';
  }
};

const getStatusBadgeColor = (status: PipStatus): string => {
  switch (status) {
    case 'Overdue': return 'bg-red-100 text-red-800 border-red-200';
    case 'Needs Attention': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'On Track': return 'bg-green-100 text-green-800 border-green-200';
    case 'Completed': return 'bg-gray-100 text-gray-800 border-gray-200';
    case 'Draft': return 'bg-blue-100 text-blue-800 border-blue-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

// Helper function for warning level badge styling
const getWarningLevelBadgeColor = (level: WarningLevel): string => {
  switch (level) {
    case 'First Warning': return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'Second Warning': return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'Final Warning': return 'bg-red-100 text-red-800 border-red-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export default function PipList({ pipData }: PipListProps) {
  // Get only active PIPs
  const activePips = pipData.filter(pip => pip.accountabilityStatus === 'Active');

  if (activePips.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No active Performance Improvement Plans found.
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
            <TableHead>Status</TableHead>
            <TableHead>Progress</TableHead>
            <TableHead>Next Due Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {activePips.map((pip) => (
            <TableRow key={pip.id}>
              <TableCell className="font-medium">{pip.employeeName}</TableCell>
              <TableCell>
                <Badge className={cn(getWarningLevelBadgeColor(pip.warningLevel))}>
                  {pip.warningLevel}
                </Badge>
              </TableCell>
              <TableCell>{pip.managerName}</TableCell>
              <TableCell>
                <Badge variant={getStatusBadgeVariant(pip.status)} className={cn(getStatusBadgeColor(pip.status))}>
                  {pip.status}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center space-x-2">
                  <Progress value={pip.progress} className="w-[100px] h-2" />
                  <span className="text-xs text-muted-foreground">{pip.progress}%</span>
                </div>
              </TableCell>
              <TableCell>{pip.nextDueDate || 'N/A'}</TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Eye className="h-4 w-4" />
                  <span className="sr-only">View PIP</span>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
} 