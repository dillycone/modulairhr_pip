'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranscriptFlow } from '../_context/transcript-flow-context';

import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar as CalendarIcon, Save } from "lucide-react";
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

// Define the Zod schema for validation
const pipSchema = z.object({
  employeeName: z.string().min(1, { message: "Employee name is required" }),
  employeePosition: z.string().min(1, { message: "Employee position is required" }),
  manager: z.string().min(1, { message: "Manager name is required" }),
  department: z.string().min(1, { message: "Department is required" }),
  startDate: z.date({ required_error: "Start date is required" }),
  reviewDate: z.date({ required_error: "Review date is required" }),
  performanceIssues: z.string().min(1, { message: "Performance issues description is required" }),
  improvementGoals: z.string().min(1, { message: "Improvement goals description is required" }),
  resourcesSupport: z.string().min(1, { message: "Resources/support description is required" }),
  consequences: z.string().min(1, { message: "Consequences description is required" }),
}).refine(data => !data.reviewDate || !data.startDate || data.reviewDate > data.startDate, {
  message: "Review date must be after the start date",
  path: ["reviewDate"], // Attach error to reviewDate field
});

type FormData = z.infer<typeof pipSchema>;

export default function PIPDetailsFromTranscript() {
  const router = useRouter();
  const { state } = useTranscriptFlow();
  const [isSaving, setIsSaving] = useState(false);

  // Initialize react-hook-form
  const form = useForm<FormData>({
    resolver: zodResolver(pipSchema),
    defaultValues: {
      employeeName: '',
      employeePosition: '',
      manager: '',
      department: '',
      startDate: undefined,
      reviewDate: undefined,
      performanceIssues: '',
      improvementGoals: '',
      resourcesSupport: '',
      consequences: '',
    },
  });
  const { control, handleSubmit, register, setValue, formState: { errors } } = form;

  useEffect(() => {
    // Pre-populate fields with data from context if available
    if (state.summary) {
      setValue('performanceIssues', state.summary);
    }
  }, [state.summary, setValue]);

  const handleBack = () => {
    router.back();
  };

  // Define the submit handler for react-hook-form
  const onSubmit: SubmitHandler<FormData> = async (data) => {
    setIsSaving(true);
    console.log('PIP Data:', data);
    // Here you would typically save the data
    await new Promise(resolve => setTimeout(resolve, 1500));
    alert('PIP created successfully! This is a placeholder - in a real app, this would save the data.');
    router.push('/dashboard');
    setIsSaving(false);
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
                  <Label htmlFor="employeeName">Employee Name</Label>
                  <Input
                    id="employeeName"
                    placeholder="Enter employee name"
                    {...register("employeeName")}
                  />
                  {errors.employeeName && <p className="text-sm font-medium text-destructive mt-1">{errors.employeeName.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="employeePosition">Position</Label>
                  <Input
                    id="employeePosition"
                    placeholder="Enter employee position"
                    {...register("employeePosition")}
                  />
                  {errors.employeePosition && <p className="text-sm font-medium text-destructive mt-1">{errors.employeePosition.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="manager">Manager</Label>
                  <Input
                    id="manager"
                    placeholder="Enter manager name"
                    {...register("manager")}
                  />
                  {errors.manager && <p className="text-sm font-medium text-destructive mt-1">{errors.manager.message}</p>}
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
                  <Label htmlFor="startDate">Start Date</Label>
                  <Controller
                    name="startDate"
                    control={control}
                    render={({ field }) => (
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            id="startDate"
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
                  {errors.startDate && <p className="text-sm font-medium text-destructive mt-1">{errors.startDate.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reviewDate">Review Date</Label>
                  <Controller
                    name="reviewDate"
                    control={control}
                    render={({ field }) => (
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            id="reviewDate"
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
                              const startDate = form.getValues("startDate");
                              return startDate ? date <= startDate : false;
                            }}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    )}
                  />
                  {errors.reviewDate && <p className="text-sm font-medium text-destructive mt-1">{errors.reviewDate.message}</p>}
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
                <Label htmlFor="performanceIssues">
                  Describe the specific performance issues or concerns
                </Label>
                <Textarea
                  id="performanceIssues"
                  placeholder="Clearly outline the performance areas needing improvement..."
                  {...register("performanceIssues")}
                  className="min-h-[100px]"
                />
                {errors.performanceIssues && <p className="text-sm font-medium text-destructive mt-1">{errors.performanceIssues.message}</p>}
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
                <Label htmlFor="improvementGoals">
                  Set clear, measurable, achievable, relevant, and time-bound (SMART) goals
                </Label>
                <Textarea
                  id="improvementGoals"
                  placeholder="Define specific goals the employee needs to achieve..."
                  {...register("improvementGoals")}
                  className="min-h-[100px]"
                />
                {errors.improvementGoals && <p className="text-sm font-medium text-destructive mt-1">{errors.improvementGoals.message}</p>}
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
                <Label htmlFor="resourcesSupport">
                  Outline the resources, training, or support that will be provided
                </Label>
                <Textarea
                  id="resourcesSupport"
                  placeholder="List any training, coaching, tools, or other support..."
                  {...register("resourcesSupport")}
                  className="min-h-[100px]"
                />
                {errors.resourcesSupport && <p className="text-sm font-medium text-destructive mt-1">{errors.resourcesSupport.message}</p>}
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
              {isSaving ? 'Creating PIP...' : 'Create PIP'}
              {!isSaving && <Save className="ml-2 h-4 w-4" />}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}