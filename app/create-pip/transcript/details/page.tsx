'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranscriptFlow } from '../_context/transcript-flow-context';
import { useAuth } from '@/hooks/useAuth';

import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { pipSchema, PipFormData } from '@/types/pip';

import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar as CalendarIcon, Save, Loader2 } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from "@/components/ui/breadcrumb";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useToast } from "@/components/ui/use-toast";

// Use the unified pipSchema but add transcript-specific refinements
const transcriptPipSchema = pipSchema.refine(data => !data.review_date || !data.start_date || data.review_date > data.start_date, {
  message: "Review date must be after the start date",
  path: ["review_date"], // Attach error to review_date field
});

type FormData = PipFormData;

export default function PIPDetailsFromTranscript() {
  const router = useRouter();
  const { state } = useTranscriptFlow();
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  // Initialize react-hook-form
  const form = useForm<FormData>({
    resolver: zodResolver(transcriptPipSchema),
    defaultValues: {
      employee_name: '',
      position: '',
      manager_name: '',
      department: '',
      start_date: undefined,
      review_date: undefined,
      performance_issues: '',
      improvement_goals: '',
      resources_support: '',
      consequences: '',
    },
  });
  const { control, handleSubmit, register, setValue, formState: { errors } } = form;

  useEffect(() => {
    // Pre-populate fields with data from context if available
    if (state.summary) {
      setValue('performance_issues', state.summary);
    }
  }, [state.summary, setValue]);

  const handleBack = () => {
    router.back();
  };

  // Define the submit handler for react-hook-form
  const onSubmit: SubmitHandler<FormData> = async (data) => {
    setIsSaving(true);
    
    // Ensure user is available before submitting
    if (!user) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to create a PIP.",
        variant: "destructive",
      });
      setIsSaving(false);
      return; // Prevent submission
    }
    
    try {
      const response = await fetch('/api/pips', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          employee_name: data.employee_name,
          position: data.position,
          manager_name: data.manager_name,
          department: data.department,
          start_date: data.start_date.toISOString().slice(0, 10),
          review_date: data.review_date.toISOString().slice(0, 10),
          performance_issues: data.performance_issues,
          improvement_goals: data.improvement_goals,
          resources_support: data.resources_support,
          consequences: data.consequences,
          status: 'draft',
          created_by: user.id, // Use the actual user ID instead of hardcoded value
          // Include transcript info if available from context
          transcript_data: state.transcript || null,
          transcript_summary: state.summary || null,
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
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink onClick={(e) => { e.preventDefault(); router.push('/dashboard'); }}>Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink onClick={(e) => { e.preventDefault(); router.push('/create-pip'); }}>Create PIP</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink onClick={(e) => { e.preventDefault(); router.push('/create-pip/transcript-source'); }}>Transcript Source</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Complete PIP Details</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      
      <div className="flex items-center mb-8">
        <Button
          variant="ghost"
          className="mr-4 p-0 h-auto"
          onClick={handleBack}
        >
          <ArrowLeft className="h-5 w-5 text-slate-500" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-violet-500 bg-clip-text text-transparent">
            Complete Performance Improvement Plan
          </h1>
          <p className="text-muted-foreground mt-2">Review and complete the PIP details based on the transcript</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 gap-8">
          {/* Employee Information Section */}
          <Card className="shadow-md border-t-4 border-t-indigo-500">
            <CardHeader>
              <CardTitle className="text-xl flex items-center">
                <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mr-2">1</div>
                Employee Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="employee_name">Employee Name</Label>
                  <Input
                    id="employee_name"
                    placeholder="Enter employee name"
                    {...register("employee_name")}
                  />
                  {errors.employee_name && <p className="text-sm font-medium text-destructive mt-1">{errors.employee_name.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="position">Position</Label>
                  <Input
                    id="position"
                    placeholder="Enter employee position"
                    {...register("position")}
                  />
                  {errors.position && <p className="text-sm font-medium text-destructive mt-1">{errors.position.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="manager_name">Manager</Label>
                  <Input
                    id="manager_name"
                    placeholder="Enter manager name"
                    {...register("manager_name")}
                  />
                  {errors.manager_name && <p className="text-sm font-medium text-destructive mt-1">{errors.manager_name.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Controller
                    name="department"
                    control={control}
                    render={({ field }) => (
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger id="department">
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="engineering">Engineering</SelectItem>
                          <SelectItem value="marketing">Marketing</SelectItem>
                          <SelectItem value="sales">Sales</SelectItem>
                          <SelectItem value="customer-support">Customer Support</SelectItem>
                          <SelectItem value="hr">Human Resources</SelectItem>
                          <SelectItem value="finance">Finance</SelectItem>
                          <SelectItem value="operations">Operations</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.department && <p className="text-sm font-medium text-destructive mt-1">{errors.department.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="start_date">Start Date</Label>
                  <Controller
                    name="start_date"
                    control={control}
                    render={({ field }) => (
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            id="start_date"
                            variant={"outline"}
                            className={`w-full justify-start text-left font-normal ${!field.value && "text-muted-foreground"}`}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value ? format(field.value, "PPP") : "Pick a date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    )}
                  />
                  {errors.start_date && <p className="text-sm font-medium text-destructive mt-1">{errors.start_date.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="review_date">Review Date</Label>
                  <Controller
                    name="review_date"
                    control={control}
                    render={({ field }) => (
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            id="review_date"
                            variant={"outline"}
                            className={`w-full justify-start text-left font-normal ${!field.value && "text-muted-foreground"}`}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value ? format(field.value, "PPP") : "Pick a date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => {
                              const start_date = form.getValues("start_date");
                              return start_date ? date <= start_date : false;
                            }}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    )}
                  />
                  {errors.review_date && <p className="text-sm font-medium text-destructive mt-1">{errors.review_date.message}</p>}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Performance Issues Section */}
          <Card className="shadow-md border-t-4 border-t-indigo-500">
            <CardHeader>
              <CardTitle className="text-xl flex items-center">
                <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mr-2">2</div>
                Performance Issues
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Label htmlFor="performance_issues">
                  Describe the specific performance issues or concerns
                </Label>
                <Textarea
                  id="performance_issues"
                  placeholder="Clearly outline the performance areas needing improvement..."
                  {...register("performance_issues")}
                  className="min-h-[100px]"
                />
                {errors.performance_issues && <p className="text-sm font-medium text-destructive mt-1">{errors.performance_issues.message}</p>}
              </div>
            </CardContent>
          </Card>

          {/* Improvement Goals Section */}
          <Card className="shadow-md border-t-4 border-t-indigo-500">
            <CardHeader>
              <CardTitle className="text-xl flex items-center">
                <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mr-2">3</div>
                Improvement Goals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Label htmlFor="improvement_goals">
                  Set clear, measurable, achievable, relevant, and time-bound (SMART) goals
                </Label>
                <Textarea
                  id="improvement_goals"
                  placeholder="Define specific goals the employee needs to achieve..."
                  {...register("improvement_goals")}
                  className="min-h-[100px]"
                />
                {errors.improvement_goals && <p className="text-sm font-medium text-destructive mt-1">{errors.improvement_goals.message}</p>}
              </div>
            </CardContent>
          </Card>

          {/* Resources & Support Section */}
          <Card className="shadow-md border-t-4 border-t-indigo-500">
            <CardHeader>
              <CardTitle className="text-xl flex items-center">
                <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mr-2">4</div>
                Resources & Support
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Label htmlFor="resources_support">
                  Outline the resources, training, or support that will be provided
                </Label>
                <Textarea
                  id="resources_support"
                  placeholder="List any training, coaching, tools, or other support..."
                  {...register("resources_support")}
                  className="min-h-[100px]"
                />
                {errors.resources_support && <p className="text-sm font-medium text-destructive mt-1">{errors.resources_support.message}</p>}
              </div>
            </CardContent>
          </Card>

          {/* Consequences Section */}
          <Card className="shadow-md border-t-4 border-t-indigo-500">
            <CardHeader>
              <CardTitle className="text-xl flex items-center">
                <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mr-2">5</div>
                Consequences
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Label htmlFor="consequences">
                  Explain the consequences if performance does not improve
                </Label>
                <Textarea
                  id="consequences"
                  placeholder="Clearly state the potential outcomes if the goals are not met..."
                  {...register("consequences")}
                  className="min-h-[100px]"
                />
                {errors.consequences && <p className="text-sm font-medium text-destructive mt-1">{errors.consequences.message}</p>}
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <Button
              variant="outline"
              onClick={handleBack}
            >
              Back
            </Button>
            <Button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700"
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  <span>Creating PIP...</span>
                </>
              ) : (
                <>
                  <span>Create PIP</span>
                  <Save className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}