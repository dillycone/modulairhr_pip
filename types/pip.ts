export type PipStatus = 'On Track' | 'Needs Attention' | 'Overdue' | 'Completed' | 'Draft';
export type WarningLevel = 'First Warning' | 'Second Warning' | 'Final Warning';
export type AccountabilityStatus = 'Active' | 'Accountability Period';

// Tip: This should match your actual database schema
export interface Pip {
  id: string;
  employee_name: string;
  employee_id?: string;
  manager_name?: string;
  manager_id?: string;
  title?: string;
  start_date: string;
  end_date: string;
  status?: PipStatus;
  progress?: number; // Percentage (0-100)
  objectives: string;
  improvements_needed: string;
  success_metrics: string;
  next_due_date?: string;
  warning_level?: WarningLevel;
  accountability_status?: AccountabilityStatus;
  accountability_end_date?: string; // Date when the 12-month accountability period ends
  created_by: string;
  created_at?: string;
  updated_at?: string;
}

// This adapter function helps convert snake_case database fields to camelCase for UI
// Also adds sensible defaults for fields that might be missing in the actual database
export function adaptPipForUI(pip: any): any {
  return {
    id: pip.id,
    employeeName: pip.employee_name || '',
    employeeId: pip.employee_id || pip.created_by || '',
    managerName: pip.manager_name || '',
    managerId: pip.manager_id || '',
    title: pip.title || `PIP for ${pip.employee_name}`,
    startDate: pip.start_date || '',
    endDate: pip.end_date || '',
    status: pip.status || 'Draft',
    progress: pip.progress || 0,
    objectives: pip.objectives || '',
    improvementsNeeded: pip.improvements_needed || '',
    successMetrics: pip.success_metrics || '',
    nextDueDate: pip.next_due_date || '',
    warningLevel: pip.warning_level || 'First Warning',
    accountabilityStatus: pip.accountability_status || 'Active',
    accountabilityEndDate: pip.accountability_end_date || '',
    createdBy: pip.created_by || '',
    createdAt: pip.created_at || '',
    updatedAt: pip.updated_at || '',
  };
} 