"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    
    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error("Failed to join waitlist");
      }

      setStatus("success");
      setMessage("Thanks for joining our waitlist! We'll be in touch soon.");
      setEmail("");
    } catch (error) {
      setStatus("error");
      setMessage("Sorry, something went wrong. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-md">
      <div className="flex flex-col sm:flex-row gap-3">
        <Input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="flex-1 h-12 text-base"
          disabled={status === "loading"}
        />
        <Button 
          type="submit" 
          disabled={status === "loading"}
          className="h-12 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-medium"
        >
          {status === "loading" ? "Joining..." : "Join Waitlist"}
        </Button>
      </div>
      {message && (
        <p className={`text-sm mt-1 ${status === "success" ? "text-green-600" : "text-red-600"}`}>
          {message}
        </p>
      )}
    </form>
  );
} 