'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Mic, Square, Play, Save, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

export default function RecordAudioPage() {
  const router = useRouter();
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordingData, setRecordingData] = useState<Blob | null>(null);
  const [speakers, setSpeakers] = useState<Speaker[]>([{ name: '', role: '' }]);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
      }
    };
  }, []);

  const handleBack = () => {
    router.back();
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

  const startRecording = async () => {
    setError(null);
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];
      
      mediaRecorderRef.current.addEventListener('dataavailable', event => {
        audioChunksRef.current.push(event.data);
      });
      
      mediaRecorderRef.current.addEventListener('stop', () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setRecordingData(audioBlob);
        
        // Stop all audio tracks
        stream.getTracks().forEach(track => track.stop());
      });
      
      // Start recording
<file path="/app/dashboard/create-pip/transcript/record/page.tsx" action="create">
  <change>
    <description>Continue creating the missing record page referenced in transcript-source</description>
    <content>
===
'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Mic, Square, Play, Save, Loader2, Plus, Trash2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

export default function RecordAudioPage() {
  const router = useRouter();
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordingData, setRecordingData] = useState<Blob | null>(null);
  const [speakers, setSpeakers] = useState<Speaker[]>([{ name: '', role: '' }]);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
      }
    };
  }, []);

  const handleBack = () => {
    router.back();
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

  const startRecording = async () => {
    setError(null);
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];
      
      mediaRecorderRef.current.addEventListener('dataavailable', event => {
        audioChunksRef.current.push(event.data);
      });
      
      mediaRecorderRef.current.addEventListener('stop', () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setRecordingData(audioBlob);
        
        // Stop all audio tracks
        stream.getTracks().forEach(track => track.stop());
      });
      
      // Start recording
      mediaRecorderRef.current.start();
      setIsRecording(true);
      
      // Start timer
      let seconds = 0;
      timerRef.current = window.setInterval(() => {
        seconds += 1;
        setRecordingTime(seconds);
      }, 1000);
      
    } catch (err) {
      console.error('Error accessing microphone:', err);
      setError('Could not access the microphone. Please ensure your browser has permissions to use audio recording.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      // Clear timer
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const handleTranscribe = async () => {
    if (!recordingData) {
      setError('No recording available to transcribe');
      return;
    }

    if (speakers.some(speaker => !speaker.name.trim())) {
      setError('Please provide names for all speakers');
      return;
    }

    setIsTranscribing(true);
    setError(null);
    setSuccess(false);

    const formData = new FormData();
    formData.append('file', recordingData, 'recording.webm');
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
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // In a real app, you would send the data to an API
      // const response = await fetch('/api/transcribe', {
      //   method: 'POST',
      //   body: formData,
      // });
      // const result = await response.json();
      
      // For demo purposes, just create a sample transcript
      const sampleTranscript = speakers.reduce((acc, speaker, index) => {
        return acc + `00:${index * 15} ${speaker.name}: This is a sample transcript line for demonstration purposes.\n`;
      }, '');
      
      // Store transcript in session storage
      sessionStorage.setItem('uploadedTranscript', sampleTranscript);
      sessionStorage.setItem('speakers', JSON.stringify(speakers));
      
      setSuccess(true);
      
      // Redirect to transcript editing page after a short delay
      setTimeout(() => {
        router.push('/dashboard/create-pip/transcript/edit');
      }, 1500);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error transcribing recording. Please try again.';
      setError(errorMessage);
      console.error(err);
    } finally {
      setIsTranscribing(false);
    }
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
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
            <BreadcrumbPage>Record Audio</BreadcrumbPage>
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
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-violet-500 bg-clip-text text-transparent">Record Audio</h1>
          <p className="text-muted-foreground mt-2">Record a conversation to generate a transcript</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        <Card className="shadow-md border-t-4 border-t-indigo-500">
          <CardHeader className="text-center">
            <CardTitle className="text-xl flex items-center justify-center">
              <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mr-2">1</div>
              Audio Recording
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-8 space-y-6">
              <div className="text-6xl font-mono font-semibold">
                {formatTime(recordingTime)}
              </div>
              
              <div className="flex items-center justify-center gap-4">
                {!isRecording && !recordingData && (
                  <Button
                    onClick={startRecording}
                    className="rounded-full w-16 h-16 bg-red-500 hover:bg-red-600 flex items-center justify-center"
                  >
                    <Mic className="h-8 w-8" />
                  </Button>
                )}
                
                {isRecording && (
                  <Button
                    onClick={stopRecording}
                    className="rounded-full w-16 h-16 bg-slate-800 hover:bg-slate-900 flex items-center justify-center"
                  >
                    <Square className="h-8 w-8" />
                  </Button>
                )}
                
                {!isRecording && recordingData && (
                  <div className="flex gap-4">
                    <Button
                      onClick={startRecording}
                      className="rounded-full w-12 h-12 bg-indigo-500 hover:bg-indigo-600 flex items-center justify-center"
                    >
                      <Play className="h-6 w-6" />
                    </Button>
                  </div>
                )}
              </div>
              
              {recordingData && (
                <div className="text-center">
                  <p className="text-green-600 font-medium mb-2">Recording completed</p>
                  <p className="text-sm text-slate-500">Duration: {formatTime(recordingTime)}</p>
                </div>
              )}
              
              {error && (
                <Alert variant="destructive" className="animate-fadeIn">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              {success && (
                <Alert className="bg-green-50 text-green-800 border-green-200 animate-fadeIn">
                  <AlertDescription>Recording transcribed successfully! Redirecting to editor...</AlertDescription>
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
              onClick={handleTranscribe}
              disabled={!recordingData || isTranscribing}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-md hover:shadow-lg transition-all px-6 py-3 h-auto text-lg font-medium"
            >
              {isTranscribing ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Transcribing...
                </>
              ) : (
                <>
                  {recordingData ? 'Generate Transcript' : 'Record Audio to Continue'}
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