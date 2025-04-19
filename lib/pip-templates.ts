// Define the type for the full template data
export type FullPipTemplate = {
    id: string;
    name: string;
    description: string | null;
    content: string;
    is_system_template: boolean;
};

// Define the type for the template without content (used in selection page)
export type PipTemplate = Omit<FullPipTemplate, 'content'>;

// Hard-coded system templates to avoid any database RLS issues
export const systemTemplates: Record<string, FullPipTemplate> = {
    'system-template-1': {
        id: 'system-template-1',
        name: 'Standard PIP Template',
        description: 'Default template for performance improvement plans',
        content: `# Performance Improvement Plan for {{employee_name}}

## Plan Details
* Position: {{position}}
* Department: {{department}}
* Start Date: {{start_date}}
* End Date: {{end_date}}
* Manager: {{manager_name}}

## Objectives
{{objectives}}

## Areas Requiring Improvement
{{improvements_needed}}

## Success Metrics
{{success_metrics}}

This document serves as a formal performance improvement plan. Regular check-ins will be scheduled to review progress.`,
        is_system_template: true
    },
    'system-template-2': {
        id: 'system-template-2',
        name: 'Sales Performance Template',
        description: 'Customized for tracking sales performance metrics',
        content: `# Sales Performance Improvement Plan for {{employee_name}}

## Plan Duration
* Position: {{position}}
* Department: {{department}}
* Start: {{start_date}}
* End: {{end_date}}
* Manager: {{manager_name}}

## Sales Objectives
{{objectives}}

## Performance Areas to Address
{{improvements_needed}}

## Success Measurement Criteria
{{success_metrics}}

This sales performance plan will be reviewed bi-weekly with your manager and the sales director.`,
        is_system_template: true
    },
    'system-template-3': {
        id: 'system-template-3',
        name: 'Technical Skills Template',
        description: 'Focused on technical competency improvement',
        content: `# Technical Improvement Plan for {{employee_name}}

## Plan Timeline
* Position: {{position}}
* Department: {{department}}
* Start: {{start_date}}
* End: {{end_date}}
* Manager: {{manager_name}}

## Technical Objectives
{{objectives}}

## Technical Skills to Improve
{{improvements_needed}}

## Measurement of Progress
{{success_metrics}}

This technical improvement plan will be monitored through code reviews and regular technical assessments.`,
        is_system_template: true
    }
};

// Export a list of templates without content for the template selection page
export const systemTemplateList: PipTemplate[] = Object.values(systemTemplates).map(
    ({ content, ...rest }) => rest
); 