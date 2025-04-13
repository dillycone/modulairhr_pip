'use client';

import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createReviewDateAfterStartDateCamelRefinement } from '@/lib/validations/dates';
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, Save } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
}).merge(createReviewDateAfterStartDateCamelRefinement());

export type PipFormData = z.infer<typeof pipSchema>;

interface PipDetailsFormProps {
  onSubmit: SubmitHandler<PipFormData>;
  onBack?: () => void;
  isSaving?: boolean;
  initialData?: Partial<PipFormData>;
  submitButtonText?: string;
}

export function PipDetailsForm({
  onSubmit,
  onBack,
  isSaving = false,
  initialData = {},
  submitButtonText = "Create PIP"
}: PipDetailsFormProps) {
  // Initialize react-hook-form
  const form = useForm<PipFormData>({
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
      ...initialData
    },
  });
  const { control, handleSubmit, register, formState: { errors } } = form;

  return (
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
          {onBack && (
            <Button
              variant="outline"
              onClick={onBack}
              type="button"
            >
              Back
            </Button>
          )}
          <Button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700"
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : submitButtonText}
            {!isSaving && <Save className="ml-2 h-4 w-4" />}
          </Button>
        </div>
      </div>
    </form>
  );
}