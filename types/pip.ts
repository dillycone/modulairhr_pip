export type PipStatus = 'On Track' | 'Needs Attention' | 'Overdue' | 'Completed' | 'Draft';
export type WarningLevel = 'First Warning' | 'Second Warning' | 'Final Warning';
export type AccountabilityStatus = 'Active' | 'Accountability Period';

export interface Pip {
  id: string;
  employeeName: string;
  employeeId: string;
  managerName: string;
  managerId: string;
  title: string;
  startDate: string;
  endDate: string;
  status: PipStatus;
  progress: number; // Percentage (0-100)
  nextDueDate?: string;
  warningLevel: WarningLevel;
  accountabilityStatus: AccountabilityStatus;
  accountabilityEndDate?: string; // Date when the 12-month accountability period ends
} 