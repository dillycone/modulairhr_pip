"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createEndDateAfterStartDateRefinement } from '@/lib/validations/dates';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { createClient } from '@/lib/supabase/client';
import { FullPipTemplate } from '@/lib/pip-templates';
import { pipSchema, PipFormData } from '@/types/pip';
import { formatDateToYYYYMMDD } from '@/lib/utils';

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
import { DatePicker } from "@/components/ui/date-picker";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

interface PipFormProps {
    userId: string;
    template: FullPipTemplate;
}

// Create the combined schema properly - use refine instead of merge
const templatePipSchema = z.object({
    employee_name: z.string().min(1, { message: "Employee name is required" }),
    position: z.string().optional(),
    department: z.string().optional(),
    manager_name: z.string().optional(),
    start_date: z.date({ required_error: "Start date is required" }),
    end_date: z.date().optional(),
    review_date: z.date().optional(),
    objectives: z.string().optional(),
    improvements_needed: z.string().optional(),
    success_metrics: z.string().optional(),
    performance_issues: z.string().optional(),
    improvement_goals: z.string().optional(),
    resources_support: z.string().optional(),
    consequences: z.string().optional(),
    generated_content: z.string().optional(),
    status: z.string().optional(),
    created_by: z.string().optional(),
    transcript_data: z.string().optional(),
    transcript_summary: z.string().optional(),
}).refine((data) => {
    // At least one of transcript fields or template fields must be present
    return (
        (!!data.performance_issues || !!data.improvement_goals || !!data.resources_support || !!data.consequences) ||
        (!!data.objectives || !!data.improvements_needed || !!data.success_metrics)
    );
}, {
    message: "Either performance issues/goals or objectives/improvements is required",
    path: ["objectives"],
}).refine((data) => {
    // Check if end date is after start date
    if (data.start_date && data.end_date) {
        return data.end_date >= data.start_date;
    }
    return true;
}, {
    message: "End date must be on or after the start date",
    path: ["end_date"]
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
            position: "",
            department: "",
            manager_name: "",
            start_date: undefined,
            end_date: undefined,
            objectives: "",
            improvements_needed: "",
            success_metrics: "",
        },
        mode: "onChange",
    });

    async function onSubmit(data: PipFormValues) {
        setIsSubmitting(true);

        // Simple template replacement without regex
        let generatedContent = template.content;
        
        // Get values safely
        const employeeName = data.employee_name || '';
        const position = data.position || '';
        const department = data.department || '';
        const managerName = data.manager_name || '';
        const startDate = data.start_date ? data.start_date.toLocaleDateString() : '';
        const endDate = data.end_date ? data.end_date.toLocaleDateString() : '';
        const objectives = data.objectives || '';
        const improvementsNeeded = data.improvements_needed || '';
        const successMetrics = data.success_metrics || '';
        
        // Perform simple string replacements
        if (generatedContent.includes('{{employee_name}}')) {
            generatedContent = generatedContent.split('{{employee_name}}').join(employeeName);
        }
        
        if (generatedContent.includes('{{position}}')) {
            generatedContent = generatedContent.split('{{position}}').join(position);
        }
        
        if (generatedContent.includes('{{department}}')) {
            generatedContent = generatedContent.split('{{department}}').join(department);
        }
        
        if (generatedContent.includes('{{manager_name}}')) {
            generatedContent = generatedContent.split('{{manager_name}}').join(managerName);
        }
        
        if (generatedContent.includes('{{start_date}}')) {
            generatedContent = generatedContent.split('{{start_date}}').join(startDate);
        }
        
        if (generatedContent.includes('{{end_date}}')) {
            generatedContent = generatedContent.split('{{end_date}}').join(endDate);
        }
        
        if (generatedContent.includes('{{objectives}}')) {
            generatedContent = generatedContent.split('{{objectives}}').join(objectives);
        }
        
        if (generatedContent.includes('{{improvements_needed}}')) {
            generatedContent = generatedContent.split('{{improvements_needed}}').join(improvementsNeeded);
        }
        
        if (generatedContent.includes('{{success_metrics}}')) {
            generatedContent = generatedContent.split('{{success_metrics}}').join(successMetrics);
        }

        try {
            const response = await fetch('/api/pips', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    employee_name: data.employee_name,
                    start_date: data.start_date ? formatDateToYYYYMMDD(data.start_date) : null,
                    end_date: data.end_date ? formatDateToYYYYMMDD(data.end_date) : null,
                    objectives: data.objectives,
                    improvements_needed: data.improvements_needed,
                    success_metrics: data.success_metrics,
                    created_by: userId,
                    status: 'draft',
                    generated_content: generatedContent,
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

                {/* Position, Department, Manager fields */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FormField
                        control={form.control}
                        name="position"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Position</FormLabel>
                                <FormControl>
                                    <Input placeholder="Job Title" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="department"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Department</FormLabel>
                                <FormControl>
                                    <Input placeholder="Department" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="manager_name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Manager Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="Manager's full name" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {/* Dates */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <FormField
                        control={form.control}
                        name="start_date"
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel>Start Date</FormLabel>
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