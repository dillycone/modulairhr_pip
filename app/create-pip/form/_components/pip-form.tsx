"use client"; // Mark as a Client Component

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { createClient } from '@/lib/supabase/client'; // Use the client-side Supabase helper
import { FullPipTemplate } from '@/lib/pip-templates';
import { pipSchema, PipFormData } from '@/types/pip';

import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "@/components/ui/date-picker"; // Import the new DatePicker
import { useToast } from "@/components/ui/use-toast"; // For showing feedback
import { Loader2 } from "lucide-react"; // Loading spinner

// Define the props passed from the server component
interface PipFormProps {
    userId: string;
    template: FullPipTemplate;
}

// We'll use the unified pipSchema from types/pip.ts
// But we can add a template-specific refine to check dates
const templatePipSchema = pipSchema.refine(data => !data.end_date || !data.start_date || data.end_date >= data.start_date, {
    message: "End date must be on or after the start date",
    path: ["end_date"], // Attach error to the end_date field
});

type PipFormValues = z.infer<typeof templatePipSchema>;

export function PipForm({ userId, template }: PipFormProps) {
    const router = useRouter();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const supabase = createClient();

    const form = useForm<PipFormValues>({
        resolver: zodResolver(templatePipSchema),
        defaultValues: {
            employee_name: "",
            start_date: undefined, // Initialize date fields as undefined
            end_date: undefined,   // Initialize date fields as undefined
            objectives: "",
            improvements_needed: "",
            success_metrics: "",
        },
        mode: "onChange",
    });

    async function onSubmit(data: PipFormValues) {
        setIsSubmitting(true);

        // The validation for end_date vs start_date has been moved to the Zod schema
        // using .refine(), so we can remove the conditional check here

        // --- Placeholder Substitution --- Start
        let generatedContent = template.content; // Start with original template

        // Define placeholder mappings (add more as needed)
        const placeholders = {
            '{{employee_name}}': data.employee_name,
            '{{start_date}}': data.start_date.toLocaleDateString(), // Format date as needed
            '{{end_date}}': data.end_date.toLocaleDateString(),     // Format date as needed
            '{{objectives}}': data.objectives,
            '{{improvements_needed}}': data.improvements_needed,
            '{{success_metrics}}': data.success_metrics,
            // Add other relevant fields if they have placeholders
            // '{{manager_name}}': user?.user_metadata?.name || 'Manager', // Example if manager info is needed
        };

        // Perform replacements
        for (const [placeholder, value] of Object.entries(placeholders)) {
            // Use a regex for global replacement (replace all occurrences)
            const regex = new RegExp(placeholder.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g');
            generatedContent = generatedContent.replace(regex, value || ''); // Replace with value or empty string if null/undefined
        }
        // --- Placeholder Substitution --- End

        try {
            // Use the new API endpoint instead of directly accessing the database
            const response = await fetch('/api/pips', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    employee_name: data.employee_name,
                    start_date: data.start_date.toISOString().slice(0, 10),
                    end_date: data.end_date ? data.end_date.toISOString().slice(0, 10) : undefined,
                    objectives: data.objectives,
                    improvements_needed: data.improvements_needed,
                    success_metrics: data.success_metrics,
                    created_by: userId,
                    status: 'draft',
                    generated_content: generatedContent, // Save the substituted content
                    // Include additional unified schema fields if available
                    position: data.position,
                    department: data.department,
                    manager_name: data.manager_name
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to create PIP');
            }

            toast({
                title: "PIP Created",
                description: `Successfully created PIP for ${data.employee_name}.`,
            });
            router.push('/dashboard');
            router.refresh();

        } catch (error: any) {
            console.error("Error saving PIP:", error);
            toast({
                title: "Error",
                description: `Failed to save PIP: ${error.message}`,
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                {/* Employee Name */}
                <FormField
                    control={form.control}
                    name="employee_name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Employee Name</FormLabel>
                            <FormControl>
                                <Input placeholder="Enter employee's full name" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Dates - Re-added */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <FormField
                        control={form.control}
                        name="start_date"
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel>Start Date</FormLabel>
                                {/* Use the custom DatePicker component */}
                                <DatePicker field={field} />
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                     <FormField
                        control={form.control}
                        name="end_date"
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel>End Date</FormLabel>
                                {/* Use the custom DatePicker component */}
                                <DatePicker field={field} />
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {/* Objectives */}
                <FormField
                    control={form.control}
                    name="objectives"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Objectives</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Describe the specific, measurable goals the employee needs to achieve..."
                                    className="resize-y min-h-[100px]"
                                    {...field}
                                />
                            </FormControl>
                             <FormDescription>
                                Clearly define what success looks like.
                             </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Improvements Needed */}
                 <FormField
                    control={form.control}
                    name="improvements_needed"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Areas for Improvement</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Detail the specific performance areas or behaviors that need improvement..."
                                    className="resize-y min-h-[100px]"
                                    {...field}
                                />
                            </FormControl>
                             <FormDescription>
                                Be specific about the performance gaps.
                             </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                 {/* Success Metrics */}
                 <FormField
                    control={form.control}
                    name="success_metrics"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Success Metrics</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="How will successful achievement of the objectives be measured? (e.g., specific KPIs, quality standards, behavioral changes)"
                                    className="resize-y min-h-[100px]"
                                    {...field}
                                />
                            </FormControl>
                            <FormDescription>
                                Define how progress and success will be tracked.
                             </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Submit Button */}
                <Button type="submit" disabled={isSubmitting}>
                     {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                     {isSubmitting ? 'Saving...' : 'Create PIP'}
                </Button>

                 {/* Display Template Content (Optional Read-only) */}
                 <div className="mt-8 border-t pt-6">
                     <h3 className="text-lg font-semibold mb-2">Template Content (Reference)</h3>
                     <div className="prose prose-sm max-w-none p-4 border rounded bg-muted text-muted-foreground overflow-auto max-h-96">
                         <pre className="whitespace-pre-wrap break-words">{template.content}</pre>
                     </div>
                 </div>
            </form>
        </Form>
    );
} 