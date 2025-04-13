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
import { useTranscriptFlow } from '../_context/transcript-flow-context';

interface Speaker {
  name: string;
  role: string;
}

export default function RecordAudioPage() {
  const router = useRouter();
  const { dispatch } = useTranscriptFlow();
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
      }
    }
  };

  const handleSubmit = async () => {
    if (!recordingData) {
      setError('No recording available to transcribe');
      return;
    }

    // Validate speakers
    const hasEmptySpeaker = speakers.some(speaker => !speaker.name || !speaker.role);
    if (hasEmptySpeaker) {
      setError('Please fill in all speaker names and roles');
      return;
    }

    setIsTranscribing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('audio', recordingData);
      formData.append('speakers', JSON.stringify(speakers));

      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to transcribe audio');
      }

      // Get the response data
      const result = await response.json();
      
      // Update context with transcript and speaker information
      dispatch({ type: 'SET_TRANSCRIPT', payload: result.transcript });
      dispatch({ type: 'SET_SPEAKERS', payload: speakers });

      setSuccess(true);
      router.push('/create-pip/transcript/edit');
    } catch (err) {
      console.error('Error transcribing:', err);
      setError('Failed to transcribe the recording. Please try again.');
    } finally {
      setIsTranscribing(false);
    }
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
            <BreadcrumbLink onClick={(e) => { e.preventDefault(); router.push('/create-pip'); }}>Create PIP</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Record Meeting</BreadcrumbPage>
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
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-violet-500 bg-clip-text text-transparent">
            Record Performance Discussion
          </h1>
          <p className="text-muted-foreground mt-2">Record and transcribe your performance improvement discussion</p>
        </div>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Meeting Participants</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {speakers.map((speaker, index) => (
              <div key={index} className="flex gap-4 items-start">
                <div className="flex-1 space-y-2">
                  <Label>Name</Label>
                  <Input
                    placeholder="Enter participant name"
                    value={speaker.name}
                    onChange={(e) => handleSpeakerChange(index, 'name', e.target.value)}
                  />
                </div>
                <div className="flex-1 space-y-2">
                  <Label>Role</Label>
                  <Input
                    placeholder="Enter participant role"
                    value={speaker.role}
                    onChange={(e) => handleSpeakerChange(index, 'role', e.target.value)}
                  />
                </div>
                {speakers.length > 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="mt-8"
                    onClick={() => handleRemoveSpeaker(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button
              variant="outline"
              onClick={handleAddSpeaker}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Participant
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-8">
            <div className="flex justify-center items-center space-x-4">
              {!isRecording ? (
                <Button
                  size="lg"
                  onClick={startRecording}
                  className="bg-indigo-600 hover:bg-indigo-700"
                  disabled={isTranscribing}
                >
                  <Mic className="h-5 w-5 mr-2" />
                  Start Recording
                </Button>
              ) : (
                <Button
                  size="lg"
                  onClick={stopRecording}
                  variant="destructive"
                  disabled={isTranscribing}
                >
                  <Square className="h-5 w-5 mr-2" />
                  Stop Recording
                </Button>
              )}
            </div>

            {recordingTime > 0 && (
              <div className="text-center">
                <p className="text-2xl font-mono">
                  {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}
                </p>
              </div>
            )}

            {recordingData && !isRecording && (
              <div className="space-y-4">
                <div className="flex justify-center">
                  <audio src={URL.createObjectURL(recordingData)} controls />
                </div>
                <Button
                  className="w-full bg-indigo-600 hover:bg-indigo-700"
                  onClick={handleSubmit}
                  disabled={isTranscribing}
                >
                  {isTranscribing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Transcribing...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save and Transcribe
                    </>
                  )}
                </Button>
              </div>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}