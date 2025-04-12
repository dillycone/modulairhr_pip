'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranscriptFlow } from '../_context/transcript-flow-context';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Search, Calendar, Clock, FileText, User, ExternalLink } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from "@/components/ui/breadcrumb";
import { format } from "date-fns";

interface Transcript {
  id: string;
  title: string;
  date: string;
  duration: string;
  speakers: number;
  content: string;
}

export default function SavedTranscriptsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [transcripts, setTranscripts] = useState<Transcript[]>([]);

  useEffect(() => {
    // Simulate loading transcripts from API
    const loadTranscripts = async () => {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock data
      const mockTranscripts: Transcript[] = [
        {
          id: '1',
          title: 'Performance Review - John Doe',
          date: '2025-03-15',
          duration: '00:45:30',
          speakers: 2,
          content: 'This is a transcript of a performance review meeting with John Doe.'
        },
        {
          id: '2',
          title: 'Coaching Session - Jane Smith',
          date: '2025-03-10',
          duration: '00:32:15',
          speakers: 3,
          content: 'This is a transcript of a coaching session with Jane Smith.'
        },
        {
          id: '3',
          title: 'Improvement Discussion - Alex Johnson',
          date: '2025-03-01',
          duration: '01:12:45',
          speakers: 2,
          content: 'This is a transcript of an improvement discussion with Alex Johnson.'
        },
        {
          id: '4',
          title: 'Department Meeting - Q1 Review',
          date: '2025-02-25',
          duration: '01:30:00',
          speakers: 5,
          content: 'This is a transcript of a department meeting reviewing Q1 performance.'
        }
      ];
      
      setTranscripts(mockTranscripts);
      setIsLoading(false);
    };
    
    loadTranscripts();
  }, []);

  const handleBack = () => {
    router.back();
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const { dispatch } = useTranscriptFlow();

  const handleSelectTranscript = (transcript: Transcript) => {
    // Store transcript in context
    dispatch({ type: 'SET_TRANSCRIPT', payload: transcript.content });
    dispatch({ type: 'SET_TITLE', payload: transcript.title });
    
    // Navigate to edit page
    router.push('/create-pip/transcript/edit');
  };

  const filteredTranscripts = transcripts.filter(transcript =>
    transcript.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto p-8">
      <Breadcrumb className="mb-4">
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
            <BreadcrumbLink href="/create-pip/transcript-source">Transcript Source</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Saved Transcripts</BreadcrumbPage>
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
            Saved Transcripts
          </h1>
          <p className="text-muted-foreground mt-2">Select a transcript to use for your PIP</p>
        </div>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
        <Input
          type="text"
          placeholder="Search transcripts..."
          className="pl-10"
          value={searchQuery}
          onChange={handleSearchChange}
        />
      </div>

      <div className="space-y-4">
        {isLoading ? (
          // Loading skeletons
          Array.from({ length: 3 }).map((_, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="flex flex-col space-y-3">
                  <Skeleton className="h-6 w-3/4" />
                  <div className="flex space-x-4">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-4 w-1/4" />
                  </div>
                  <Skeleton className="h-4 w-full mt-2" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </CardContent>
            </Card>
          ))
        ) : filteredTranscripts.length > 0 ? (
          filteredTranscripts.map(transcript => (
            <Card
              key={transcript.id}
              className="hover:shadow-md transition-shadow duration-300 hover:border-indigo-200 cursor-pointer"
              onClick={() => handleSelectTranscript(transcript)}
            >
              <CardContent className="p-6">
                <div className="flex flex-col space-y-3">
                  <h3 className="text-xl font-semibold text-gray-800">{transcript.title}</h3>
                  
                  <div className="flex flex-wrap gap-3 text-sm text-gray-500">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>{format(new Date(transcript.date), 'MMM d, yyyy')}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>Duration: {transcript.duration}</span>
                    </div>
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-1" />
                      <span>{transcript.speakers} speakers</span>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 line-clamp-2 mt-2">
                    {transcript.content.substring(0, 120)}...
                  </p>
                  
                  <div className="flex justify-end mt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectTranscript(transcript);
                      }}
                    >
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Use This Transcript
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-12 border rounded-lg bg-gray-50">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-700 mb-1">No transcripts found</h3>
            <p className="text-gray-500">Try adjusting your search or uploading a new audio file</p>
          </div>
        )}
      </div>
    </div>
  );
}