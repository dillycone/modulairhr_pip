'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, Sparkles } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { CardDescription } from "@/components/ui/card";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export default function SummarizeTranscriptPage() {
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);
  const [summary, setSummary] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleBack = () => {
    router.back();
  };

  const handleGenerateSummary = async () => {
    setIsGenerating(true);
    
    // Simulate API call to generate summary
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const generatedSummary = `This meeting focused on outlining the objectives for the new project. 
    
Key points discussed:
- The main deliverable is the new feature implementation
- Development timeline is set for a six-week cycle
- Both speakers agreed to focus on key deliverables first

Action items:
1. Create detailed project plan
2. Schedule follow-up meeting to review progress
3. Allocate resources for the six-week development cycle`;
    
    setSummary(generatedSummary);
    setIsGenerating(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    // Simulate saving
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Navigate to PIP creation
    router.push('/dashboard/create-pip/details');
    
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
            <BreadcrumbLink onClick={(e) => { e.preventDefault(); router.push('/dashboard/create-pip'); }}>Create PIP</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink onClick={(e) => { e.preventDefault(); router.push('/dashboard/create-pip/transcript-source'); }}>Transcript Source</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Summarize Transcript</BreadcrumbPage>
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
          <h1 className="text-3xl font-bold">Summarize Transcript</h1>
          <p className="text-muted-foreground mt-2">Generate or write a summary of the transcript</p>
        </div>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-xl">Transcript Summary</CardTitle>
          <CardDescription>
            Review the generated summary of your transcript.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-slate-500">
              Generate an AI summary or write your own summary of the transcript.
            </p>
            <Button
              onClick={handleGenerateSummary}
              disabled={isGenerating}
              className="flex items-center"
              variant="outline"
            >
              {isGenerating ? (
                <>Generating...</>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate AI Summary
                </>
              )}
            </Button>
          </div>
          
          <Textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            className="min-h-[300px]"
            placeholder="Enter or generate a summary of the transcript..."
          />
        </CardContent>
        <CardFooter className="flex justify-end space-x-4">
          <Button 
            variant="outline"
            onClick={handleBack}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving || !summary.trim()}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            {isSaving ? 'Saving...' : 'Save and Continue to PIP'}
            {!isSaving && <Save className="ml-2 h-4 w-4" />}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
} 