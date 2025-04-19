"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion, AnimatePresence, useAnimation } from "framer-motion"
import { ChevronLeft, FileText, MessageSquare, Edit, RefreshCw, CheckCircle2, BarChart3 } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface Issue {
  id: number
  title: string
  description: string
  category: "performance" | "communication" | "quality"
  status: "queued" | "generating" | "complete"
}

export default function PIPGenerationProPage() {
  const [generatingState, setGeneratingState] = useState<"initializing" | "analyzing" | "generating" | "complete">(
    "initializing",
  )
  const [issues, setIssues] = useState<Issue[]>([])
  const [progress, setProgress] = useState(0)
  const [currentIssueIndex, setCurrentIssueIndex] = useState(0)
  const [showTypingEffect, setShowTypingEffect] = useState(false)
  const [typingText, setTypingText] = useState("")
  const [analysisText, setAnalysisText] = useState("")

  // Simulate the generation process
  useEffect(() => {
    const startGeneration = async () => {
      // Initializing phase
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Analyzing phase
      setGeneratingState("analyzing")
      await simulateAnalysisPhase()

      // Generating phase
      setGeneratingState("generating")
      await generateIssues()

      // Complete phase
      setGeneratingState("complete")
    }

    startGeneration()
  }, [])

  const simulateAnalysisPhase = async () => {
    const analysisSteps = [
      "Analyzing transcript data...",
      "Identifying performance patterns...",
      "Detecting improvement areas...",
      "Categorizing issues...",
      "Preparing issue generation...",
    ]

    for (let i = 0; i < analysisSteps.length; i++) {
      setAnalysisText(analysisSteps[i])
      setProgress((i + 1) * 15)
      await new Promise((resolve) => setTimeout(resolve, 1200))
    }
  }

  const generateIssues = async () => {
    // Simulate streaming issues from an LLM
    const issueData: Omit<Issue, "status">[] = [
      {
        id: 1,
        title: "Missed Project Deadlines",
        description:
          "Consistently failed to meet agreed-upon project deadlines, causing delays in team deliverables and affecting the overall project timeline. In the past quarter, 4 out of 6 assigned tasks were completed after the deadline without prior communication about delays.",
        category: "performance",
      },
      {
        id: 2,
        title: "Communication Issues",
        description:
          "Inadequate communication with team members about project status and blockers. Often fails to respond to messages in a timely manner and does not proactively update the team on progress. This has led to duplicate work and misunderstandings about task ownership.",
        category: "communication",
      },
      {
        id: 3,
        title: "Quality of Work",
        description:
          "Deliverables frequently contain errors that require significant revisions by other team members. Code submissions have had an average of 7 issues identified during code reviews, compared to the team average of 2. Documentation is often incomplete or unclear.",
        category: "quality",
      },
      {
        id: 4,
        title: "Meeting Participation",
        description:
          "Limited engagement during team meetings with minimal contribution to discussions. Often appears distracted or unprepared for agenda items relevant to assigned responsibilities. Has not presented project updates as required in weekly team meetings.",
        category: "communication",
      },
    ]

    // Queue all issues first
    setIssues(issueData.map((issue) => ({ ...issue, status: "queued" })))

    // Generate each issue with a typing effect
    for (let i = 0; i < issueData.length; i++) {
      setCurrentIssueIndex(i)

      // Update status to generating
      setIssues((prev) => prev.map((issue, idx) => (idx === i ? { ...issue, status: "generating" } : issue)))

      // Simulate progress
      setProgress(75 + ((i + 1) / issueData.length) * 25)

      // Simulate typing effect for description
      setShowTypingEffect(true)
      const text = issueData[i].description
      let currentText = ""

      for (let j = 0; j < text.length; j++) {
        currentText += text[j]
        setTypingText(currentText)
        // Random typing speed between 10ms and 30ms
        await new Promise((resolve) => setTimeout(resolve, Math.random() * 20 + 10))
      }

      setShowTypingEffect(false)

      // Mark as complete after typing finishes
      await new Promise((resolve) => setTimeout(resolve, 300))
      setIssues((prev) => prev.map((issue, idx) => (idx === i ? { ...issue, status: "complete" } : issue)))

      // Pause between issues
      await new Promise((resolve) => setTimeout(resolve, 800))
    }
  }

  const getCategoryIcon = (category: Issue["category"]) => {
    switch (category) {
      case "performance":
        return <BarChart3 className="h-4 w-4" />
      case "communication":
        return <MessageSquare className="h-4 w-4" />
      case "quality":
        return <FileText className="h-4 w-4" />
    }
  }

  const getCategoryColor = (category: Issue["category"]) => {
    switch (category) {
      case "performance":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "communication":
        return "bg-indigo-100 text-indigo-800 border-indigo-200"
      case "quality":
        return "bg-purple-100 text-purple-800 border-purple-200"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="container mx-auto py-8 px-4 max-w-7xl">
        <div className="flex items-center mb-6">
          <Link href="/dashboard" className="flex items-center text-gray-500 hover:text-gray-700 mr-4">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back
          </Link>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-indigo-700">
            Generate Performance Improvement Plan
          </h1>
        </div>

        {/* Progress bar and status */}
        <div className="w-full max-w-3xl mx-auto mb-12">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium text-indigo-700">
              {generatingState === "initializing"
                ? "Initializing..."
                : generatingState === "analyzing"
                  ? "Analyzing Transcript..."
                  : generatingState === "generating"
                    ? "Generating PIP..."
                    : "Generation Complete"}
            </span>
            <span className="text-sm font-medium text-indigo-700">{Math.round(progress)}%</span>
          </div>
          <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600"
              initial={{ width: "0%" }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>

          {/* Status text */}
          <div className="mt-6 text-center">
            <h2 className="text-xl font-bold text-gray-900">
              {generatingState === "initializing"
                ? "Initializing"
                : generatingState === "analyzing"
                  ? "Analyzing Performance Data"
                  : generatingState === "generating"
                    ? `Generating Issue ${currentIssueIndex + 1} of ${issues.length}`
                    : "PIP Generation Complete"}
            </h2>

            {generatingState === "analyzing" && <p className="text-indigo-700 mt-2 font-medium">{analysisText}</p>}

            {generatingState === "complete" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-4 inline-flex items-center bg-green-100 text-green-800 px-4 py-2 rounded-md"
              >
                <CheckCircle2 className="w-5 h-5 mr-2" />
                <span>All issues successfully generated</span>
              </motion.div>
            )}
          </div>
        </div>

        {/* Main content */}
        <div className="max-w-6xl mx-auto">
          {/* Issues grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
            <AnimatePresence>
              {issues.map((issue, index) => (
                <IssueCard
                  key={issue.id}
                  issue={issue}
                  index={index}
                  isCurrentlyGenerating={index === currentIssueIndex && issue.status === "generating"}
                  showTypingEffect={showTypingEffect && index === currentIssueIndex}
                  typingText={typingText}
                  getCategoryIcon={getCategoryIcon}
                  getCategoryColor={getCategoryColor}
                />
              ))}
            </AnimatePresence>
          </div>

          {/* Action buttons */}
          {generatingState === "complete" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-12 flex flex-col sm:flex-row justify-center items-center gap-4 p-6 bg-gradient-to-r from-slate-50 to-indigo-50 rounded-xl"
            >
              <Button variant="outline" className="border-indigo-300 text-indigo-700 hover:bg-indigo-50">
                <RefreshCw className="mr-2 h-4 w-4" />
                Regenerate Issues
              </Button>
              <Button className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white">
                Continue to Review
              </Button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}

interface IssueCardProps {
  issue: Issue
  index: number
  isCurrentlyGenerating: boolean
  showTypingEffect: boolean
  typingText: string
  getCategoryIcon: (category: Issue["category"]) => React.ReactNode
  getCategoryColor: (category: Issue["category"]) => string
}

function IssueCard({
  issue,
  index,
  isCurrentlyGenerating,
  showTypingEffect,
  typingText,
  getCategoryIcon,
  getCategoryColor,
}: IssueCardProps) {
  const cardControls = useAnimation()

  useEffect(() => {
    if (issue.status === "generating") {
      cardControls.start({
        boxShadow: ["0px 0px 0px rgba(79, 70, 229, 0.2)", "0px 0px 20px rgba(79, 70, 229, 0.4)"],
        transition: {
          repeat: Number.POSITIVE_INFINITY,
          repeatType: "reverse",
          duration: 1,
        },
      })
    } else if (issue.status === "complete") {
      cardControls.start({
        boxShadow: "0px 8px 30px rgba(0, 0, 0, 0.08)",
      })
    }
  }, [issue.status, cardControls])

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 50,
        scale: 0.9,
      }}
      animate={{
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
          type: "spring",
          stiffness: 100,
          damping: 15,
          delay: index * 0.2,
        },
      }}
      exit={{ opacity: 0, scale: 0.8 }}
    >
      <motion.div
        className={`rounded-xl overflow-hidden ${
          issue.status === "queued"
            ? "bg-gray-50 border border-gray-200"
            : issue.status === "generating"
              ? "bg-gradient-to-br from-indigo-50 to-slate-50 border border-indigo-200"
              : "bg-white border border-gray-100"
        }`}
        animate={cardControls}
      >
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center">
              <span className="flex items-center justify-center w-8 h-8 rounded-md bg-indigo-100 text-indigo-700 font-bold mr-3">
                {issue.id}
              </span>
              <h3 className="text-xl font-bold text-gray-900">{issue.title}</h3>
            </div>

            {issue.status === "queued" && <div className="h-6 w-6 bg-gray-200 rounded-full"></div>}

            {issue.status === "generating" && (
              <div className="h-6 w-6 relative">
                <motion.div
                  className="absolute inset-0 bg-indigo-400 rounded-full"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.7, 1, 0.7],
                  }}
                  transition={{
                    repeat: Number.POSITIVE_INFINITY,
                    duration: 1.5,
                  }}
                />
              </div>
            )}

            {issue.status === "complete" && (
              <div className="h-6 w-6 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center">
                <svg
                  className="h-3 w-3 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
            )}
          </div>

          {/* Category Badge - only showing category, no severity */}
          {issue.status === "complete" && (
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge className={`${getCategoryColor(issue.category)} border`}>
                <span className="flex items-center">
                  {getCategoryIcon(issue.category)}
                  <span className="ml-1 capitalize">{issue.category}</span>
                </span>
              </Badge>
            </div>
          )}

          <div className="mt-2">
            {issue.status === "queued" && (
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                <div className="h-4 bg-gray-200 rounded w-4/6"></div>
              </div>
            )}

            {issue.status === "generating" && isCurrentlyGenerating && showTypingEffect ? (
              <div className="min-h-[100px] bg-white bg-opacity-50 rounded-lg p-3 border border-indigo-100">
                <p className="text-gray-700">
                  {typingText}
                  <span className="inline-block w-1 h-4 bg-indigo-500 ml-0.5 animate-pulse"></span>
                </p>
              </div>
            ) : (
              issue.status === "generating" && (
                <div className="min-h-[100px] space-y-2 bg-white bg-opacity-50 rounded-lg p-3 border border-indigo-100">
                  <div className="h-4 bg-indigo-100 rounded animate-pulse w-full"></div>
                  <div className="h-4 bg-indigo-100 rounded animate-pulse w-5/6"></div>
                  <div className="h-4 bg-indigo-100 rounded animate-pulse w-4/6"></div>
                </div>
              )
            )}

            {issue.status === "complete" && (
              <div className="min-h-[100px] bg-white rounded-lg p-4 border border-gray-100">
                <p className="text-gray-700">{issue.description}</p>
              </div>
            )}
          </div>
        </div>

        {/* Card footer */}
        {issue.status === "complete" && (
          <div className="bg-gray-50 px-6 py-3 flex justify-end border-t border-gray-100">
            <Button variant="ghost" size="sm" className="text-gray-500 hover:text-indigo-600">
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
          </div>
        )}
      </motion.div>
    </motion.div>
  )
} 