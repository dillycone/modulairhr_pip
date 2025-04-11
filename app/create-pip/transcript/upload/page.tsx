'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useTranscriptFlow } from '../_context/transcript-flow-context';
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
  const { dispatch } = useTranscriptFlow();
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
      
      // Update context with transcript and speaker information
      dispatch({ type: 'SET_TRANSCRIPT', payload: result.transcript });
      dispatch({ type: 'SET_SPEAKERS', payload: speakers });
      
      setSuccess(true);
      
      // Redirect to transcript editing page after a short delay to show success message
      setTimeout(() => {
        router.push('/create-pip/transcript/edit');
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
          <ArrowLeft className="h-5 w-5 text-slate-500" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-violet-500 bg-clip-text text-transparent">Upload Audio File</h1>
          <p className="text-muted-foreground mt-2">Upload an audio file to generate a transcript</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        <Card className="shadow-md border-t-4 border-t-indigo-500">
          <CardHeader className="text-center">
            <CardTitle className="text-xl flex items-center justify-center">
              <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mr-2">1</div>
              Audio File Upload
            </CardTitle>
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
                className={`border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-all ${file ? 'bg-indigo-50 border-indigo-300' : 'border-gray-300 hover:border-indigo-300 hover:bg-gray-50'}`}
                onClick={triggerFileInput}
              >
                <div className={`mx-auto mb-4 h-16 w-16 rounded-full flex items-center justify-center ${file ? 'bg-indigo-100' : 'bg-gray-100'}`}>
                  <Upload className={`h-8 w-8 ${file ? 'text-indigo-600' : 'text-slate-400'}`} />
                </div>
                <h3 className="text-lg font-medium mb-2">
                  {file ? (
                    <span className="text-indigo-600">{file.name}</span>
                  ) : (
                    'Drag and drop or click to upload'
                  )}
                </h3>
                <p className="text-sm text-slate-500 mb-4">
                  Supports MP3, WAV, M4A, and other common audio formats (max 100MB)
                </p>
                <Button 
                  variant={file ? "outline" : "default"}
                  type="button"
                  className={`mx-auto ${file ? 'border-indigo-300 text-indigo-600 hover:bg-indigo-50' : 'bg-indigo-600 hover:bg-indigo-700 text-white'}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    triggerFileInput();
                  }}
                >
                  {file ? 'Choose Different File' : 'Select File'}
                </Button>
              </div>

              {error && (
                <Alert variant="destructive" className="animate-fadeIn">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="bg-green-50 text-green-800 border-green-200 animate-fadeIn">
                  <AlertDescription>File uploaded and transcript generated! Redirecting to editor...</AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md border-t-4 border-t-indigo-500">
          <CardHeader className="text-center">
            <CardTitle className="text-xl flex items-center justify-center">
              <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mr-2">2</div>
              Speaker Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {speakers.map((speaker, index) => (
                <div key={index} className="p-4 border rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-base font-medium flex items-center">
                      <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs mr-2">
                        {index + 1}
                      </div>
                      Speaker {index + 1}
                    </h3>
                    {speakers.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveSpeaker(index)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 h-auto rounded-full"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor={`name-${index}`} className="text-sm mb-1.5 block text-slate-700">Name</Label>
                      <Input
                        id={`name-${index}`}
                        value={speaker.name}
                        onChange={(e) => handleSpeakerChange(index, 'name', e.target.value)}
                        placeholder="e.g., John Smith"
                        className="h-10 border-indigo-100 focus:border-indigo-300 focus:ring-indigo-200"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor={`role-${index}`} className="text-sm mb-1.5 block text-slate-700">Role/Description</Label>
                      <Input
                        id={`role-${index}`}
                        value={speaker.role}
                        onChange={(e) => handleSpeakerChange(index, 'role', e.target.value)}
                        placeholder="e.g., HRBP"
                        className="h-10 border-indigo-100 focus:border-indigo-300 focus:ring-indigo-200"
                      />
                    </div>
                  </div>
                </div>
              ))}
              
              <Button
                type="button"
                variant="outline"
                onClick={handleAddSpeaker}
                className="w-full border-dashed border-indigo-300 text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-400 transition-colors mt-2"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Another Speaker
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-md border-t-4 border-t-indigo-500">
          <CardContent className="p-6">
            <Button
              onClick={handleUpload}
              disabled={!file || isUploading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-md hover:shadow-lg transition-all px-6 py-3 h-auto text-lg font-medium"
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Uploading & Transcribing...
                </>
              ) : (
                <>
                  {file ? 'Upload and Generate Transcript' : 'Select a File to Continue'}
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
}