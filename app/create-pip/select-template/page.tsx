import { createServerSupabaseClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PipTemplate, systemTemplateList } from '@/lib/pip-templates';

export default async function SelectPipTemplatePage() {
    const supabase = await createServerSupabaseClient();

    // 1. Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    // In development, bypass auth check for easier testing
    const isDev = process.env.NODE_ENV === 'development';
    
    if (!isDev && (userError || !user)) {
        console.error("User not authenticated:", userError?.message || "Auth session missing!");
        redirect('/login');
    }

    // 2. Use the shared system templates list
    console.log("Using shared system templates list");
    const templates = systemTemplateList;

    // 3. Render the selection UI
    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-6">Choose PIP Format</h1>
            <p className="text-muted-foreground mb-6">Select the template you want to use to create the Performance Improvement Plan.</p>
            
            {/* Note about custom templates being disabled */}
            <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-400 rounded">
                <p className="text-blue-700">
                    Only system templates are currently available. Custom template management has been disabled.
                </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {templates.map((template: PipTemplate) => (
                    <Link
                        key={template.id}
                        href={`/create-pip/form?templateId=${template.id}`}
                        passHref
                        className="no-underline"
                    >
                        <Card className="cursor-pointer hover:border-primary transition-colors h-full flex flex-col">
                            <CardHeader className="flex-grow">
                                <CardTitle className="text-lg">{template.name}</CardTitle>
                                {template.description && (
                                    <CardDescription className="mt-1 text-sm">
                                        {template.description}
                                    </CardDescription>
                                )}
                            </CardHeader>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    );
}