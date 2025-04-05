'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, Upload, Mic } from "lucide-react";
import { 
  Breadcrumb, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbList, 
  BreadcrumbPage, 
  BreadcrumbSeparator 
} from "@/components/ui/breadcrumb";

export default function TranscriptSourcePage() {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  const handleSavedTranscripts = () => {
    router.push('/dashboard/create-pip/transcript/saved');
  };

  const handleUploadAudio = () => {
    router.push('/dashboard/create-pip/transcript/upload');
  };

  const handleRecordNew = () => {
    router.push('/dashboard/create-pip/transcript/record');
  };

  return (
    <div className="max-w-6xl mx-auto p-8">
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
            <BreadcrumbPage>Transcript Source</BreadcrumbPage>
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
          <h1 className="text-3xl font-bold">Choose Transcript Source</h1>
          <p className="text-muted-foreground mt-2">Select where you want to get your transcript from</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Saved Transcripts */}
        <Card className="hover:shadow-md transition-shadow duration-300 flex flex-col h-[400px]">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto mb-5 h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center">
              <FileText className="h-6 w-6 text-indigo-600" />
            </div>
            <CardTitle className="mb-3">Start with a Saved Transcript</CardTitle>
            <CardDescription className="text-base">
              Choose from previously saved transcripts in your account.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center text-gray-500 pb-0 flex-grow">
            <p className="text-sm">Access transcripts from previous meetings or imported files.</p>
          </CardContent>
          <CardFooter className="mt-auto">
            <Button 
              onClick={handleSavedTranscripts} 
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              Browse Saved Transcripts
            </Button>
          </CardFooter>
        </Card>

        {/* Upload Audio File */}
        <Card className="hover:shadow-md transition-shadow duration-300 flex flex-col h-[400px]">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto mb-5 h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center">
              <Upload className="h-6 w-6 text-indigo-600" />
            </div>
            <CardTitle className="mb-3">Use an Audio Recording to Generate a Transcript</CardTitle>
            <CardDescription className="text-base">
              Upload an audio recording to be transcribed automatically.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center text-gray-500 pb-0 flex-grow">
            <p className="text-sm">Supports MP3, WAV, M4A, and other common audio formats.</p>
          </CardContent>
          <CardFooter className="mt-auto">
            <Button 
              onClick={handleUploadAudio} 
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              Use Audio Recording
            </Button>
          </CardFooter>
        </Card>

        {/* Record New */}
        <Card className="hover:shadow-md transition-shadow duration-300 flex flex-col h-[400px]">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto mb-5 h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center">
              <Mic className="h-6 w-6 text-indigo-600" />
            </div>
            <CardTitle className="mb-3">Record a New Conversation and Generate a Transcript</CardTitle>
            <CardDescription className="text-base">
              Start a new recording session directly in the app.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center text-gray-500 pb-0 flex-grow">
            <p className="text-sm">Record and transcribe meetings or conversations in real-time.</p>
          </CardContent>
          <CardFooter className="mt-auto">
            <Button 
              onClick={handleRecordNew} 
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              Start Recording
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
} 