export type PipStatus = 'On Track' | 'Needs Attention' | 'Overdue' | 'Completed' | 'Draft' | 'draft';
export type WarningLevel = 'First Warning' | 'Second Warning' | 'Final Warning';
export type AccountabilityStatus = 'Active' | 'Accountability Period';

// Canonical PIP schema that supports both template and transcript flows
export interface Pip {
  id: string;
  employee_name: string;
  position?: string;
  department?: string;
  manager_name?: string;
  start_date: string;
  end_date?: string;
  review_date?: string;
  status?: PipStatus;
  performance_issues?: string;
  improvement_goals?: string;
  resources_support?: string;
  consequences?: string;
  objectives?: string;
  improvements_needed?: string;
  success_metrics?: string;
  generated_content?: string;
  progress?: number; // Percentage (0-100)
  warning_level?: WarningLevel;
  accountability_status?: AccountabilityStatus;
  transcript_data?: string;
  transcript_summary?: string;
  created_by: string;
  created_at?: string;
  updated_at?: string;
}

// Zod schema for PIP validation (to be used in both flows)
import { z } from 'zod';

export const pipSchema = z.object({
  employee_name: z.string().min(1, { message: "Employee name is required" }),
  position: z.string().optional(),
  department: z.string().optional(),
  manager_name: z.string().optional(),
  start_date: z.date({ required_error: "Start date is required" }),
  end_date: z.date().optional(),
  review_date: z.date().optional(),
  performance_issues: z.string().optional(),
  improvement_goals: z.string().optional(),
  resources_support: z.string().optional(),
  consequences: z.string().optional(),
  objectives: z.string().optional(),
  improvements_needed: z.string().optional(),
  success_metrics: z.string().optional(),
  generated_content: z.string().optional(),
  status: z.string().optional(),
  created_by: z.string().optional(),
  transcript_data: z.string().optional(),
  transcript_summary: z.string().optional(),
}).refine(data => {
  // At least one of transcript fields or template fields must be present
  return (
    (!!data.performance_issues || !!data.improvement_goals || !!data.resources_support || !!data.consequences) ||
    (!!data.objectives || !!data.improvements_needed || !!data.success_metrics)
  );
}, {
  message: "Either performance issues/goals or objectives/improvements is required",
  path: ["performance_issues"],
});

export type PipFormData = z.infer<typeof pipSchema>;

// This adapter function helps convert snake_case database fields to camelCase for UI
// Also adds sensible defaults for fields that might be missing in the actual database
export function adaptPipForUI(pip: any): any {
  return {
    id: pip.id,
    employeeName: pip.employee_name || '',
    position: pip.position || '',
    department: pip.department || '',
    managerName: pip.manager_name || '',
    startDate: pip.start_date || '',
    endDate: pip.end_date || '',
    reviewDate: pip.review_date || '',
    status: pip.status || 'Draft',
    progress: pip.progress || 0,
    performanceIssues: pip.performance_issues || '',
    improvementGoals: pip.improvement_goals || '',
    resourcesSupport: pip.resources_support || '',
    consequences: pip.consequences || '',
    objectives: pip.objectives || '',
    improvementsNeeded: pip.improvements_needed || '',
    successMetrics: pip.success_metrics || '',
    generatedContent: pip.generated_content || '',
    warningLevel: pip.warning_level || 'First Warning',
    accountabilityStatus: pip.accountability_status || 'Active',
    createdBy: pip.created_by || '',
    createdAt: pip.created_at || '',
    updatedAt: pip.updated_at || '',
  };
}