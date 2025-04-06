'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from "@/components/ui/breadcrumb";
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

interface FormData {
  employeeName: string;
  employeePosition: string;
  manager: string;
  department: string;
  startDate: Date | undefined;
  reviewDate: Date | undefined;
  performanceIssues: string;
  improvementGoals: string;
  resourcesSupport: string;
  consequences: string;
}

export default function ManualPIPCreation() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
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
  });

  const handleBack = () => {
    router.back();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (name: 'startDate' | 'reviewDate', date: Date | undefined) => {
    setFormData(prev => ({ ...prev, [name]: date }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('PIP Data:', formData);
    // Here you would typically save the data and navigate to the next step
    alert('PIP created successfully! This is a placeholder - in a real app, this would save the data.');
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard/create-pip">Create PIP</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Manual Creation</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      
      <div className="flex items-center mb-8">
        <Button 
          variant="ghost" 
          className="mr-4 p-0 h-auto" 
          onClick={handleBack}
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-violet-500 bg-clip-text text-transparent">
            Create Performance Improvement Plan
          </h1>
          <p className="text-muted-foreground mt-2">Fill out the form below to create a PIP manually</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
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
                    name="employeeName" 
                    placeholder="Enter employee name"
                    value={formData.employeeName}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="employeePosition">Position</Label>
                  <Input 
                    id="employeePosition" 
                    name="employeePosition" 
                    placeholder="Enter employee position"
                    value={formData.employeePosition}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="manager">Manager</Label>
                  <Input 
                    id="manager" 
                    name="manager" 
                    placeholder="Enter manager name"
                    value={formData.manager}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Select 
                    onValueChange={(value) => handleSelectChange('department', value)}
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
                </div>
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <div className="border rounded-md p-2">
                    {formData.startDate ? (
                      <div className="p-2">{format(formData.startDate, 'PP')}</div>
                    ) : (
                      <div className="text-muted-foreground p-2">Pick a date</div>
                    )}
                    <Calendar
                      mode="single"
                      selected={formData.startDate}
                      onSelect={(date) => handleDateChange('startDate', date)}
                      className="rounded-md border"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Review Date</Label>
                  <div className="border rounded-md p-2">
                    {formData.reviewDate ? (
                      <div className="p-2">{format(formData.reviewDate, 'PP')}</div>
                    ) : (
                      <div className="text-muted-foreground p-2">Pick a date</div>
                    )}
                    <Calendar
                      mode="single"
                      selected={formData.reviewDate}
                      onSelect={(date) => handleDateChange('reviewDate', date)}
                      className="rounded-md border"
                    />
                  </div>
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
                  name="performanceIssues"
                  placeholder="Detail the performance issues that need to be addressed..."
                  className="min-h-[150px]"
                  value={formData.performanceIssues}
                  onChange={handleChange}
                  required
                />
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
                  Outline specific, measurable goals for improvement
                </Label>
                <Textarea
                  id="improvementGoals"
                  name="improvementGoals"
                  placeholder="List specific goals, targets, and timeline for improvement..."
                  className="min-h-[150px]"
                  value={formData.improvementGoals}
                  onChange={handleChange}
                  required
                />
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
                  Detail the resources, training, or support that will be provided
                </Label>
                <Textarea
                  id="resourcesSupport"
                  name="resourcesSupport"
                  placeholder="Describe the support, resources, or training that will be made available..."
                  className="min-h-[150px]"
                  value={formData.resourcesSupport}
                  onChange={handleChange}
                  required
                />
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
                  Outline potential consequences if improvement goals are not met
                </Label>
                <Textarea
                  id="consequences"
                  name="consequences"
                  placeholder="Describe potential actions if performance does not improve..."
                  className="min-h-[150px]"
                  value={formData.consequences}
                  onChange={handleChange}
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end mt-6">
            <Button 
              type="submit" 
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6"
            >
              Create PIP
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
} 