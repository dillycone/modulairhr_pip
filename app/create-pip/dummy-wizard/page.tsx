'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from "@/components/ui/breadcrumb";
import { ArrowLeft, UploadCloud, FileText, CheckCircle } from "lucide-react";

const TOTAL_STEPS = 4;

export default function DummyWizardPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [fileName, setFileName] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [progressValue, setProgressValue] = useState(0);

  const handleBackNavigation = () => {
    router.back(); // Or router.push('/dashboard/create-pip');
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileName(file.name);
      console.log("File selected:", file.name);
    } else {
      setFileName(null);
    }
  };

  const nextStep = () => {
    if (currentStep < TOTAL_STEPS) {
      if (currentStep === 2) { // Simulate processing after Step 2 (Context)
        setProcessing(true);
        setProgressValue(0);
        // Simulate processing time
        const interval = setInterval(() => {
          setProgressValue((prev) => {
            if (prev >= 100) {
              clearInterval(interval);
              setProcessing(false);
              setCurrentStep((prevStep) => prevStep + 1);
              return 100;
            }
            return prev + 20; // Increment progress
          });
        }, 300); // Adjust timing as needed
      } else {
        setCurrentStep((prevStep) => prevStep + 1);
      }
    } else if (currentStep === TOTAL_STEPS) {
        // Handle final step completion (e.g., navigate or show success)
        console.log("PIP Generation Initiated (Dummy)");
        alert("Dummy PIP generation started! You would navigate or show results here.");
        router.push('/dashboard'); // Example navigation
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prevStep) => prevStep - 1);
      // Reset processing state if going back from review step
      if (currentStep === 3) {
          setProcessing(false);
          setProgressValue(0);
      }
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1: // Upload Step
        return (
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-500 transition-colors">
              <UploadCloud className="h-12 w-12 text-gray-400 mb-4" />
              <p className="text-center text-muted-foreground mb-2">Drag & drop your transcript file here, or click to browse.</p>
              <Label htmlFor="transcript-upload" className="cursor-pointer text-indigo-600 hover:text-indigo-800 font-medium">
                Browse files
              </Label>
              <Input id="transcript-upload" type="file" className="hidden" onChange={handleFileChange} accept=".txt,.docx,.pdf,.md" /> 
              {fileName && <p className="mt-4 text-sm text-green-600 font-medium flex items-center"><FileText className="h-4 w-4 mr-1" /> {fileName}</p>}
            </div>
             <p className="text-xs text-center text-muted-foreground">Accepted formats: .txt, .docx, .pdf, .md</p>
          </CardContent>
        );
      case 2: // Context Step
        return (
          <CardContent className="space-y-4">
             <p className="text-sm text-muted-foreground mb-4">Provide some optional context to help improve the analysis.</p>
            <div>
              <Label htmlFor="meeting-date">Meeting Date (Optional)</Label>
              <Input id="meeting-date" type="date" placeholder="Select date" />
            </div>
            <div>
              <Label htmlFor="participants">Participants (Optional)</Label>
              <Input id="participants" placeholder="e.g., John Doe, Jane Smith" />
            </div>
            <div>
              <Label htmlFor="topic">Primary Topic (Optional)</Label>
              <Textarea id="topic" placeholder="Briefly describe the main topic..." />
            </div>
          </CardContent>
        );
      case 3: // Processing & Review Step
        return (
          <CardContent className="space-y-4">
            {processing ? (
               <div className="flex flex-col items-center justify-center p-8">
                  <p className="text-lg font-medium mb-4">Processing Transcript...</p>
                  <Progress value={progressValue} className="w-full" />
                  <p className="text-sm text-muted-foreground mt-2">{progressValue}% complete</p>
               </div>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">Review the key information extracted from the transcript. You can edit this later.</p>
                <div className="p-4 border rounded-md bg-gray-50">
                   <h4 className="font-semibold mb-2">Potential Issues Identified:</h4>
                   <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                       <li>Missed project deadlines in Q3.</li>
                       <li>Lack of pro-active communication on blockers.</li>
                       <li>Needs improvement in report detail.</li>
                   </ul>
                </div>
                 <div className="p-4 border rounded-md bg-gray-50">
                   <h4 className="font-semibold mb-2">Suggested Goals:</h4>
                   <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                       <li>Deliver project X final report by [Date].</li>
                       <li>Provide daily updates on task progress via Slack.</li>
                   </ul>
                </div>
                 <div className="p-4 border rounded-md bg-gray-50 max-h-40 overflow-y-auto">
                   <h4 className="font-semibold mb-2">Transcript Snippet:</h4>
                   <p className="text-xs text-gray-600 italic">"...and regarding the deadline for the Alpha project, we really needed that submitted last Friday. It's impacting the next phase... we need to ensure communication is more upfront when challenges arise..."</p>
                </div>
              </>
            )}
          </CardContent>
        );
      case 4: // Generate PIP Step
        return (
          <CardContent className="text-center p-8">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
             <p className="text-lg font-medium mb-2">Ready to Generate PIP</p>
             <p className="text-muted-foreground">Click the button below to generate a draft Performance Improvement Plan based on the reviewed information.</p>
             <p className="text-xs text-muted-foreground mt-4">(In a real app, this would likely take you to an editor pre-filled with the generated content)</p>
          </CardContent>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-8">
        {/* Breadcrumbs */}
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
             <BreadcrumbLink onClick={(e) => { e.preventDefault(); router.push('/dashboard/create-pip/transcript'); }}>From Transcript</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Upload Wizard (Dummy)</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

        {/* Back Button and Title */}
       <div className="flex items-center mb-8">
        <Button
          variant="ghost"
          className="mr-4 p-0 h-auto"
          onClick={handleBackNavigation}
        >
          <ArrowLeft className="h-5 w-5 text-slate-500" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-violet-500 bg-clip-text text-transparent">
            Create PIP from Transcript (Wizard)
          </h1>
           <p className="text-muted-foreground text-sm mt-1">Step {currentStep} of {TOTAL_STEPS}</p>
        </div>
      </div>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>
            Step {currentStep}: {
              currentStep === 1 ? 'Upload Transcript' :
              currentStep === 2 ? 'Provide Context' :
              currentStep === 3 ? (processing ? 'Processing...' : 'Review Extracted Info') :
              'Generate PIP'
            }
          </CardTitle>
           {currentStep === 1 && <CardDescription>Select the meeting transcript file.</CardDescription>}
           {currentStep === 2 && <CardDescription>Add optional details about the meeting.</CardDescription>}
           {currentStep === 3 && !processing && <CardDescription>Verify the AI-extracted information.</CardDescription>}
           {currentStep === 4 && <CardDescription>Confirm to proceed with PIP generation.</CardDescription>}
        </CardHeader>
            {renderStepContent()}
        <CardFooter className="flex justify-between border-t pt-6">
          <Button variant="outline" onClick={prevStep} disabled={currentStep === 1 || processing}>
            Previous
          </Button>
          <Button
            onClick={nextStep}
            disabled={processing || (currentStep === 1 && !fileName)} // Disable next if processing or on step 1 without a file
             className="bg-indigo-600 hover:bg-indigo-700"
          >
            {currentStep === TOTAL_STEPS ? 'Generate PIP' : 'Next'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
} 