import { createServerSupabaseClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { PipForm } from './_components/pip-form';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";

// Define the type for the template data
type FullPipTemplate = {
    id: string;
    name: string;
    description: string | null;
    content: string;
    is_system_template: boolean;
};

// Hard-coded system templates to avoid any database RLS issues
const systemTemplates: Record<string, FullPipTemplate> = {
    'system-template-1': {
        id: 'system-template-1',
        name: 'Standard PIP Template',
        description: 'Default template for performance improvement plans',
        content: `# Performance Improvement Plan for {{employee_name}}

## Plan Details
* Start Date: {{start_date}}
* End Date: {{end_date}}
* Manager: [Manager Name]

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
* Start: {{start_date}}
* End: {{end_date}}
* Department: Sales

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
* Start: {{start_date}}
* End: {{end_date}}
* Department: Technical

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

export default async function CreatePipFormPage({
    searchParams,
}: {
    searchParams: { [key: string]: string | string[] | undefined };
}) {
    const supabase = await createServerSupabaseClient();

    // 1. Get template ID from search params
    const templateId = searchParams?.templateId;

    if (!templateId || typeof templateId !== 'string') {
        return (
            <div className="container mx-auto p-4">
                <Alert variant="destructive">
                    <Terminal className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>
                        Invalid or missing template selection. Please <a href="/create-pip/select-template" className="underline">go back and select a template</a>.
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    // 2. Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    // In development, bypass auth check for easier testing
    const isDev = process.env.NODE_ENV === 'development';
    let userId = isDev ? "dev-user-id-123" : null;
    
    if (!isDev && (userError || !user)) {
        console.error("User not authenticated for form:", userError?.message);
        redirect('/login');
    } else if (user) {
        userId = user.id;
    }

    // 3. Get template details from our hardcoded system templates
    // This completely bypasses database RLS issues
    const template = systemTemplates[templateId];
    
    if (!template) {
        return (
            <div className="container mx-auto p-4">
                <Alert variant="destructive">
                    <Terminal className="h-4 w-4" />
                    <AlertTitle>Template Not Found</AlertTitle>
                    <AlertDescription>
                        The selected template ({templateId}) is not available. Please <a href="/create-pip/select-template" className="underline">go back and select a different template</a>.
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    // 4. Render the page with the form
    return (
        <div className="container mx-auto p-4 md:p-6 lg:p-8 max-w-4xl">
            <h1 className="text-2xl font-bold mb-2">Create New Performance Improvement Plan</h1>
            <p className="text-muted-foreground mb-6">
                Using template: <span className="font-semibold">{template.name}</span> (System)
            </p>

            {/* Render the client component form, passing necessary props */}
            <PipForm
                userId={userId}
                template={template}
            />
        </div>
    );
}