'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Breadcrumb, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbList, 
  BreadcrumbPage, 
  BreadcrumbSeparator 
} from "@/components/ui/breadcrumb";

export default function CreatePIP() {
  const router = useRouter();

  const handleManualCreate = () => {
    router.push('/dashboard/create-pip/manual');
  };

  const handleTranscriptCreate = () => {
    router.push('/dashboard/create-pip/transcript-source');
  };

  return (
    <div className="max-w-6xl mx-auto p-8">
      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink onClick={(e) => { e.preventDefault(); router.push('/dashboard'); }}>Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Create PIP</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Create Performance Improvement Plan</h1>
        <p className="text-muted-foreground mt-2">Choose how you would like to create your PIP</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Manual Creation Card */}
        <Card className="hover:shadow-md transition-shadow duration-300 flex flex-col">
          <CardHeader className="text-center">
            <CardTitle>Create Manually</CardTitle>
            <CardDescription>
              Build your PIP from scratch by entering all details manually.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-grow flex items-center justify-center">
            <div className="h-40 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="64"
                height="64"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-indigo-600"
              >
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="12" y1="18" x2="12" y2="12" />
                <line x1="9" y1="15" x2="15" y2="15" />
              </svg>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleManualCreate} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">
              Start Manual Creation
            </Button>
          </CardFooter>
        </Card>

        {/* Transcript Card */}
        <Card className="hover:shadow-md transition-shadow duration-300 flex flex-col">
          <CardHeader className="text-center">
            <CardTitle>Create From Transcript</CardTitle>
            <CardDescription>
              Use meeting transcripts to automatically generate a PIP with AI assistance.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-grow flex items-center justify-center">
            <div className="h-40 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="64"
                height="64"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-indigo-600"
              >
                <path d="M8 2v4" />
                <path d="M16 2v4" />
                <path d="M3 10h18" />
                <path d="M10 14h8" />
                <path d="M10 18h8" />
                <path d="M3 6h18v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6z" />
                <path d="M6 14h.01" />
                <path d="M6 18h.01" />
              </svg>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleTranscriptCreate} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">
              Start From Transcript
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
} 