"use client"; // Mark as a Client Component

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { createClient } from '../../../../lib/supabase/client'; // Use the client-side Supabase helper - FIXED with relative path

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


// Define the type for the props passed from the server component
type FullPipTemplate = {
    id: string;
    name: string;
    description: string | null;
    content: string;
    is_system_template: boolean;
};

interface PipFormProps {
    userId: string;
    template: FullPipTemplate;
}

// Define the form schema using Zod based on your public.pips table
// Adjust validation rules as needed (e.g., .min(3))
const pipFormSchema = z.object({
    employee_name: z.string().min(2, { message: "Employee name must be at least 2 characters." }).max(100),
    // Re-add date fields to schema
    start_date: z.date({ required_error: "A start date is required." }),
    end_date: z.date({ required_error: "An end date is required." }),
    objectives: z.string().min(10, { message: "Objectives must be described (min 10 characters)." }),
    improvements_needed: z.string().min(10, { message: "Improvements needed must be described (min 10 characters)." }),
    success_metrics: z.string().min(10, { message: "Success metrics must be described (min 10 characters)." }),
    // status: z.string().optional(), // Status defaults to 'draft' in DB, no need in form usually
    // created_by: z.string().uuid(), // This will be the userId prop
});

type PipFormValues = z.infer<typeof pipFormSchema>;

export function PipForm({ userId, template }: PipFormProps) {
    const router = useRouter();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const supabase = createClient();

    const form = useForm<PipFormValues>({
        resolver: zodResolver(pipFormSchema),
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

        // Basic validation: end_date should not be before start_date
        if (data.end_date < data.start_date) {
            toast({
                title: "Invalid Date Range",
                description: "End date cannot be before the start date.",
                variant: "destructive",
            });
            setIsSubmitting(false);
            return; // Prevent submission
        }

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
                    end_date: data.end_date.toISOString().slice(0, 10),
                    objectives: data.objectives,
                    improvements_needed: data.improvements_needed,
                    success_metrics: data.success_metrics,
                    created_by: userId,
                    status: 'draft',
                    generated_content: generatedContent, // Save the substituted content
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