'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useTranscriptFlow } from '../_context/transcript-flow-context';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ChevronRight, Clock, Users, PencilLine, AlignLeft } from "lucide-react";
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
    if (!transcript) return '1m';
    
    // Average speaking pace is around 150 words per minute
    const wordCount = transcript.split(/\s+/).filter(Boolean).length;
    const durationInMinutes = Math.max(1, Math.ceil(wordCount / 150));
    
    return `${durationInMinutes}m`;
  }, [transcript]);

  // Format the transcript display with styled timestamps
  const formattedTranscript = useMemo(() => {
    if (!transcript) return '';
    
    // Add styling to timestamps (format: MM:SS) - specifically targeting line beginnings
    // which is the format provided by the API transcription
    return transcript.replace(
      /(^|\n)(\d{1,2}):(\d{2})\b/g, 
      '$1<span class="text-blue-600 font-medium">$2:$3</span>'
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
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-sm text-gray-500">Loading transcript...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <Breadcrumb className="mb-6 text-sm text-gray-500">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/create-pip">Create PIP</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/create-pip/transcript-source">Transcript</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Edit</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      
      <div className="flex items-center gap-3 mb-8">
        <Button 
          variant="ghost" 
          size="sm"
          className="p-0 h-9 w-9 rounded-full bg-white border border-gray-200 hover:bg-gray-50 shadow-sm"
          onClick={handleBack}
        >
          <ArrowLeft className="h-4 w-4 text-gray-700" />
        </Button>
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-gray-900">Edit Transcript</h1>
          <p className="text-sm text-gray-500">Refine your podcast transcript before analysis</p>
        </div>
      </div>

      <Card className="mb-6 shadow-lg border border-gray-100 rounded-xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 py-4 px-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <PencilLine className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-lg font-semibold text-gray-900">Transcript Details</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block" htmlFor="title">
                Transcript Title
              </label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full"
                placeholder="Enter a descriptive title for this transcript"
              />
            </div>
            
            <div className="flex gap-8 mt-4">
              <div className="flex items-center">
                <Clock className="h-4 w-4 text-gray-500 mr-2" />
                <span className="text-sm font-medium">{estimatedDuration}</span>
                <span className="text-sm text-gray-500 ml-2">Duration</span>
              </div>
              <div className="flex items-center">
                <Users className="h-4 w-4 text-gray-500 mr-2" />
                <span className="text-sm font-medium">{state.speakers?.length || 2}</span>
                <span className="text-sm text-gray-500 ml-2">Speakers</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-lg border border-gray-100 rounded-xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 py-4 px-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <AlignLeft className="h-5 w-5 text-blue-600" />
            <div>
              <CardTitle className="text-lg font-semibold text-gray-900">Transcript Editor</CardTitle>
              <CardDescription className="text-sm text-gray-600 mt-1">
                Edit text with live timestamp preview
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-6 space-y-6">
          <Textarea
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            className="min-h-[400px] font-mono text-sm leading-relaxed border-gray-200 hover:border-gray-300 
              focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-colors"
            placeholder="Paste or edit your transcript here..."
          />
          
          {transcript && (
            <div className="mt-5 space-y-3">
              <h3 className="text-sm font-semibold text-gray-700">Formatted Preview</h3>
              <div className="rounded-lg border border-gray-200 bg-white p-4 max-h-[200px] overflow-y-auto">
                <div 
                  className="font-mono text-sm whitespace-pre-wrap leading-relaxed text-gray-700"
                  dangerouslySetInnerHTML={{ __html: formattedTranscript }}
                />
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex justify-end gap-4 py-5 px-6 bg-gray-50 border-t border-gray-200">
          <Button 
            variant="outline" 
            onClick={handleBack}
            className="h-10 px-6 border-gray-300 text-gray-700 hover:bg-gray-50/80"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving || transcript.trim() === ''}
            className="h-10 px-6 bg-blue-600 hover:bg-blue-700 text-white transition-colors"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <span>Save and Continue</span>
                <ChevronRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
} 