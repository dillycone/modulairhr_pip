'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SubmitHandler } from 'react-hook-form';
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from "@/components/ui/breadcrumb";
import { PipDetailsForm, PipFormData } from '@/components/pip/pip-details-form';

export default function ManualPIPCreation() {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);

  const handleManualSubmit: SubmitHandler<PipFormData> = async (data) => {
    setIsSaving(true);
    console.log('Manual PIP Data:', data);
    // Here you would typically save the data
    await new Promise(resolve => setTimeout(resolve, 1500));
    alert('PIP created successfully! This is a placeholder - in a real app, this would save the data.');
    router.push('/dashboard'); 
    setIsSaving(false);
  };

  const handleBack = () => router.back();

  return (
    <div className="max-w-4xl mx-auto p-8">
      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink onClick={(e) => { e.preventDefault(); router.push('/dashboard'); }}>Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink onClick={(e) => { e.preventDefault(); router.push('/dashboard/create-pip'); }}>Create PIP</BreadcrumbLink>
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
          <ArrowLeft className="h-5 w-5 text-slate-500" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-violet-500 bg-clip-text text-transparent">
            Create Performance Improvement Plan
          </h1>
          <p className="text-muted-foreground mt-2">Fill out the form below to create a PIP manually</p>
        </div>
      </div>

      <PipDetailsForm
        onSubmit={handleManualSubmit}
        isSaving={isSaving}
        onBack={handleBack}
        submitButtonText="Create Manual PIP"
      />
    </div>
  );
}