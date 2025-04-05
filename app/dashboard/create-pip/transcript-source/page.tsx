'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, Upload, Mic } from "lucide-react";

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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Saved Transcripts */}
        <Card className="hover:shadow-md transition-shadow duration-300">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center">
              <FileText className="h-6 w-6 text-indigo-600" />
            </div>
            <CardTitle>Saved Transcripts</CardTitle>
            <CardDescription>
              Choose from previously saved transcripts in your account.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center text-sm text-gray-500">
            <p>Access transcripts from previous meetings or imported files.</p>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={handleSavedTranscripts} 
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              Browse Saved Transcripts
            </Button>
          </CardFooter>
        </Card>

        {/* Upload Audio File */}
        <Card className="hover:shadow-md transition-shadow duration-300">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center">
              <Upload className="h-6 w-6 text-indigo-600" />
            </div>
            <CardTitle>Upload Audio</CardTitle>
            <CardDescription>
              Upload an audio recording to be transcribed automatically.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center text-sm text-gray-500">
            <p>Supports MP3, WAV, M4A, and other common audio formats.</p>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={handleUploadAudio} 
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              Upload Audio File
            </Button>
          </CardFooter>
        </Card>

        {/* Record New */}
        <Card className="hover:shadow-md transition-shadow duration-300">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center">
              <Mic className="h-6 w-6 text-indigo-600" />
            </div>
            <CardTitle>Record Conversation</CardTitle>
            <CardDescription>
              Start a new recording session directly in the app.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center text-sm text-gray-500">
            <p>Record and transcribe meetings or conversations in real-time.</p>
          </CardContent>
          <CardFooter>
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