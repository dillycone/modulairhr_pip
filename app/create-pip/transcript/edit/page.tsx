'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useTranscriptFlow } from '../_context/transcript-flow-context';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, Clock, Tag } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { 
  Breadcrumb, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbList, 
  BreadcrumbPage, 
  BreadcrumbSeparator 
} from "@/components/ui/breadcrumb";

export default function EditTranscriptPage() {
  const router = useRouter();
  const { state, dispatch } = useTranscriptFlow();
  const [title, setTitle] = useState(state.title || 'Untitled Transcript');
  const [transcript, setTranscript] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Estimate duration based on word count (assuming average speaking pace)
  const estimatedDuration = useMemo(() => {
    if (!transcript) return '--:--';
    
    // Average speaking pace is around 150 words per minute
    const wordCount = transcript.split(/\s+/).filter(Boolean).length;
    const durationInMinutes = Math.max(1, Math.ceil(wordCount / 150));
    
    const hours = Math.floor(durationInMinutes / 60);
    const minutes = durationInMinutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  }, [transcript]);

  // Format the transcript display with styled timestamps
  const formattedTranscript = useMemo(() => {
    if (!transcript) return '';
    
    // Add styling to timestamps (format: MM:SS)
    return transcript.replace(
      /\b(\d{1,2}):(\d{2})\b/g, 
      '<span class="text-indigo-600 font-semibold">$1:$2</span>'
    );
  }, [transcript]);

  useEffect(() => {
    if (state.transcript) {
      setTranscript(state.transcript);
    }
    setIsLoading(false);
  }, [state.transcript]);

  const handleBack = () => {
    router.back();
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    // Update context with edited transcript and title
    dispatch({ type: 'SET_TRANSCRIPT', payload: transcript });
    dispatch({ type: 'SET_TITLE', payload: title });
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    router.push('/create-pip/transcript/summarize');
    
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
              <span>Duration: {estimatedDuration}</span>
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <Tag className="h-4 w-4 mr-1" />
              <span>Speakers: {state.speakers?.length || 0}</span>
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
            className="min-h-[300px] font-mono text-sm mb-4"
            placeholder="Loading transcript... If this persists, try uploading again."
          />
          
          {transcript && (
            <div className="mt-4 border rounded-md p-4 bg-gray-50">
              <h3 className="text-sm font-medium mb-2 text-gray-700">Preview with timestamps:</h3>
              <div 
                className="font-mono text-sm whitespace-pre-wrap"
                dangerouslySetInnerHTML={{ __html: formattedTranscript }}
              />
            </div>
          )}
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
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                Save and Continue
                <Save className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
} 