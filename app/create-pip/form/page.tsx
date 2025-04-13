import { createServerSupabaseClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { PipForm } from './_components/pip-form';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";
import { FullPipTemplate, systemTemplates } from '@/lib/pip-templates';

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