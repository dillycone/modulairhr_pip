'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, Clock, Tag } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";

export default function EditTranscriptPage() {
  const router = useRouter();
  const [title, setTitle] = useState('Untitled Transcript');
  const [transcript, setTranscript] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedTranscript = sessionStorage.getItem('uploadedTranscript');
      if (storedTranscript) {
        setTranscript(storedTranscript);
      } else {
      }
      setIsLoading(false);
    } else {
       setIsLoading(false);
    }
  }, []);

  const handleBack = () => {
    router.back();
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    router.push('/dashboard/create-pip/transcript/summarize');
    
    setIsSaving(false);
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-8 flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

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
            <BreadcrumbLink href="/dashboard/create-pip/transcript-source">Transcript Source</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Edit Transcript</BreadcrumbPage>
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
          <h1 className="text-3xl font-bold">Edit Transcript</h1>
          <p className="text-muted-foreground mt-2">Review and edit the generated transcript</p>
        </div>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-xl">Transcript Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="title">
              Transcript Title
            </label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full"
            />
          </div>
          
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center text-sm text-gray-500">
              <Clock className="h-4 w-4 mr-1" />
              <span>Duration: --:--</span>
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <Tag className="h-4 w-4 mr-1" />
              <span>Speakers: ?</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-xl">Edit Transcript</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            className="min-h-[300px] font-mono text-sm"
            placeholder="Loading transcript... If this persists, try uploading again."
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
            disabled={isSaving || transcript.trim() === ''}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            {isSaving ? 'Saving...' : 'Save and Continue'}
            {!isSaving && <Save className="ml-2 h-4 w-4" />}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
} 