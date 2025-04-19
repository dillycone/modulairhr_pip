"use client"

import { useState } from "react"
import Link from "next/link"
import { FileText, Upload, Mic, ChevronLeft } from "lucide-react"
import React from "react"

export default function PIPCreationPage() {
  const [activeTab, setActiveTab] = useState("transcript")
  
  return (
    <div className="w-full px-8 py-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-6 mb-8">
        <Link href="/dashboard" className="flex items-center text-gray-500 hover:text-gray-700">
          <ChevronLeft className="h-5 w-5 mr-1" />
          <span>Back</span>
        </Link>
        <h1 className="text-3xl font-bold">Create Performance Improvement Plan</h1>
      </div>
      
      <div className="w-full mb-10 rounded-lg border-2 border-gray-300 overflow-hidden shadow-md">
        <div className="grid grid-cols-2">
          <button 
            className={`py-4 text-center font-medium transition-all ${activeTab === "transcript" 
              ? "bg-white text-indigo-700 border-b-2 border-indigo-600 shadow-[0_4px_0_-2px_rgba(79,70,229,0.2)]" 
              : "bg-gradient-to-b from-gray-100 to-gray-200 text-gray-700 hover:from-gray-50 hover:to-gray-100"}`}
            onClick={() => setActiveTab("transcript")}
          >
            Create from Transcript
          </button>
          <button 
            className={`py-4 text-center font-medium transition-all ${activeTab === "template" 
              ? "bg-white text-indigo-700 border-b-2 border-indigo-600 shadow-[0_4px_0_-2px_rgba(79,70,229,0.2)]" 
              : "bg-gradient-to-b from-gray-100 to-gray-200 text-gray-700 hover:from-gray-50 hover:to-gray-100"}`}
            onClick={() => setActiveTab("template")}
          >
            Create from Template
          </button>
        </div>
      </div>
      
      {activeTab === "transcript" && (
        <div className="px-2">
          <div className="mb-10">
            <h2 className="text-2xl font-bold mb-2">Choose Transcript Source</h2>
            <p className="text-gray-600">Select where you want to get your transcript from</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <TranscriptCard
              icon={<FileText className="text-indigo-600 h-6 w-6" />}
              title="Start with a Saved Transcript"
              description="Choose from previously saved transcripts in your account."
              secondaryText="Access transcripts from previous meetings or imported files."
              buttonText="Browse Saved Transcripts"
            />
            
            <TranscriptCard
              icon={<Upload className="text-indigo-600 h-6 w-6" />}
              title="Use an Audio Recording to Generate a Transcript"
              description="Upload an audio recording to be transcribed automatically."
              secondaryText="Supports MP3, WAV, M4A, and other common audio formats."
              buttonText="Use Audio Recording"
            />
            
            <TranscriptCard
              icon={<Mic className="text-indigo-600 h-6 w-6" />}
              title="Record a New Conversation and Generate a Transcript"
              description="Start a new recording session directly in the app."
              secondaryText="Record and transcribe meetings or conversations in real-time."
              buttonText="Start Recording"
            />
          </div>
        </div>
      )}
      
      {activeTab === "template" && (
        <div className="px-2">
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-2">Select a Template</h2>
            <p className="text-gray-600">Choose the template you want to use to create the Performance Improvement Plan.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <TemplateCard
              icon={<FileText className="text-indigo-600 h-6 w-6" />}
              title="Standard PIP Template"
              description="Default template for performance improvement plans with standard sections for goals, timelines, and progress tracking."
            />
            
            <TemplateCard
              icon={
                <svg className="h-6 w-6 text-indigo-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 18V14M12 18V12M16 18V9M6 10L8 8L10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              }
              title="Sales Performance Template"
              description="Customized for tracking sales performance metrics including targets, conversion rates, and customer satisfaction scores."
            />
            
            <TemplateCard
              icon={
                <svg className="h-6 w-6 text-indigo-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10 20L14 4M19 9L22 12L19 15M5 15L2 12L5 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              }
              title="Technical Skills Template"
              description="Focused on technical competency improvement with sections for skill assessment, learning objectives, and practical applications."
            />
          </div>
        </div>
      )}
    </div>
  )
}

interface TranscriptCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  secondaryText: string;
  buttonText: string;
}

function TranscriptCard({ icon, title, description, secondaryText, buttonText }: TranscriptCardProps) {
  return (
    <div className="border-2 border-gray-300 rounded-lg overflow-hidden h-full shadow-[0_4px_12px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.12)] transition-all hover:border-indigo-300 hover:-translate-y-1">
      <div className="p-8 flex flex-col items-center text-center h-full bg-gradient-to-b from-white to-gray-50">
        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-4 rounded-full mb-5 shadow-inner">
          {icon}
        </div>
        <h3 className="text-xl font-bold mb-3">{title}</h3>
        <p className="text-gray-600 mb-2">{description}</p>
        <p className="text-gray-500 text-sm">{secondaryText}</p>
        <div className="mt-auto pt-8 w-full">
          <button className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white py-3 px-4 rounded-md font-medium transition-all shadow-md hover:shadow-lg active:shadow-inner">
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  )
}

interface TemplateCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function TemplateCard({ icon, title, description }: TemplateCardProps) {
  return (
    <div className="border-2 border-gray-300 rounded-lg overflow-hidden h-full shadow-[0_4px_12px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.12)] transition-all hover:border-indigo-300 hover:-translate-y-1">
      <div className="p-8 flex flex-col items-center text-center h-full bg-gradient-to-b from-white to-gray-50">
        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-4 rounded-full mb-5 shadow-inner">
          {icon}
        </div>
        <h3 className="text-xl font-bold mb-3">{title}</h3>
        <p className="text-gray-600">{description}</p>
        <div className="mt-auto pt-8 w-full">
          <button className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white py-3 px-4 rounded-md font-medium transition-all shadow-md hover:shadow-lg active:shadow-inner">
            Select Template
          </button>
        </div>
      </div>
    </div>
  )
} 