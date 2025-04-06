'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Upload, Loader2, Plus, Trash2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Breadcrumb, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbList, 
  BreadcrumbPage, 
  BreadcrumbSeparator 
} from "@/components/ui/breadcrumb";

interface Speaker {
  name: string;
  role: string;
}

export default function UploadAudioPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [speakers, setSpeakers] = useState<Speaker[]>([{ name: '', role: '' }]);

  const handleBack = () => {
    router.back();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    setError(null);
    setSuccess(false); // Reset success state on new file selection
    
    if (selectedFile) {
      // Check if file is an audio file
      if (!selectedFile.type.startsWith('audio/')) {
        setError('Please upload an audio file (MP3, WAV, M4A, etc.)');
        setFile(null); // Clear invalid file
        return;
      }
      
      // Check file size (max 100MB)
      if (selectedFile.size > 100 * 1024 * 1024) {
        setError('File size exceeds 100MB limit');
        setFile(null); // Clear invalid file
        return;
      }
      
      setFile(selectedFile);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleAddSpeaker = () => {
    setSpeakers([...speakers, { name: '', role: '' }]);
  };

  const handleRemoveSpeaker = (index: number) => {
    if (speakers.length > 1) {
      const newSpeakers = [...speakers];
      newSpeakers.splice(index, 1);
      setSpeakers(newSpeakers);
    }
  };

  const handleSpeakerChange = (index: number, field: keyof Speaker, value: string) => {
    const newSpeakers = [...speakers];
    newSpeakers[index][field] = value;
    setSpeakers(newSpeakers);
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file to upload');
      return;
    }

    if (speakers.some(speaker => !speaker.name.trim())) {
      setError('Please provide names for all speakers');
      return;
    }

    setIsUploading(true);
    setError(null);
    setSuccess(false);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('speakers', JSON.stringify(speakers));
    formData.append('prompt', `Analyze the provided audio file to perform speaker diarization and generate accurate timestamps.

Instructions:
1. Identify each distinct speaker in the conversation using the provided speaker information:
${speakers.map((s, i) => `   - Replace "Speaker ${i + 1}" with "${s.name}" (${s.role})`).join('\n')}
2. Determine the precise start time for each speaker's utterance based on the source timing.
3. Format the output with each utterance on a new line, starting with the accurate timestamp in MM:SS format, followed by the speaker's name and a colon.

Example Output Format:
00:05 ${speakers[0]?.name || 'Speaker'}: [utterance]
00:09 ${speakers[1]?.name || 'Speaker'}: [utterance]
01:15 ${speakers[0]?.name || 'Speaker'}: [utterance]`);

    try {
      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Transcription failed');
      }
      
      // Store transcript and speaker information in Session Storage
      sessionStorage.setItem('uploadedTranscript', result.transcript);
      sessionStorage.setItem('speakers', JSON.stringify(speakers));
      
      setSuccess(true);
      
      // Redirect to transcript editing page after a short delay to show success message
      setTimeout(() => {
        router.push('/dashboard/create-pip/transcript/edit');
      }, 1500);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error uploading or transcribing file. Please try again.';
      setError(errorMessage);
      console.error(err);
    } finally {
      setIsUploading(false);
    }
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
            <BreadcrumbLink href="/dashboard/create-pip/transcript-source">Transcript Source</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Upload Audio</BreadcrumbPage>
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
          <h1 className="text-3xl font-bold">Upload Audio File</h1>
          <p className="text-muted-foreground mt-2">Upload an audio file to generate a transcript</p>
        </div>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-xl">Speaker Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {speakers.map((speaker, index) => (
              <div key={index} className="space-y-4 p-4 border rounded-lg bg-slate-50">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Speaker {index + 1}</h3>
                  {speakers.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveSpeaker(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor={`name-${index}`}>Name</Label>
                  <Input
                    id={`name-${index}`}
                    value={speaker.name}
                    onChange={(e) => handleSpeakerChange(index, 'name', e.target.value)}
                    placeholder="e.g., John Smith"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor={`role-${index}`}>Role/Description</Label>
                  <Textarea
                    id={`role-${index}`}
                    value={speaker.role}
                    onChange={(e) => handleSpeakerChange(index, 'role', e.target.value)}
                    placeholder="e.g., HRBP - primarily asks questions and listens"
                    className="resize-none"
                    rows={2}
                  />
                </div>
              </div>
            ))}
            
            <Button
              type="button"
              variant="outline"
              onClick={handleAddSpeaker}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Another Speaker
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-xl">Audio File Upload</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="audio/*"
              onChange={handleFileChange}
            />
            
            <div 
              className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={triggerFileInput}
            >
              <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-indigo-100 flex items-center justify-center">
                <Upload className="h-8 w-8 text-indigo-600" />
              </div>
              <h3 className="text-lg font-medium mb-2">
                {file ? file.name : 'Drag and drop or click to upload'}
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                Supports MP3, WAV, M4A, and other common audio formats (max 100MB)
              </p>
              <Button 
                variant="outline" 
                type="button"
                className="mx-auto"
                onClick={(e) => {
                  e.stopPropagation();
                  triggerFileInput();
                }}
              >
                Select File
              </Button>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="bg-green-50 text-green-800 border-green-200">
                <AlertDescription>File uploaded and transcript generated! Redirecting to editor...</AlertDescription>
              </Alert>
            )}

            <div className="flex justify-end">
              <Button
                onClick={handleUpload}
                disabled={!file || isUploading}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading & Transcribing...
                  </>
                ) : (
                  'Upload and Generate Transcript'
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 