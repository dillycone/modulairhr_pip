"use client"

import { useEffect, useState, useRef } from "react"

interface StatsCounterProps {
  value: number
  label: string
  suffix?: string
  duration?: number
}

export default function StatsCounter({ value, label, suffix = "", duration = 2000 }: StatsCounterProps) {
  const [count, setCount] = useState(0)
  const countRef = useRef(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1 },
    )

    if (countRef.current) {
      observer.observe(countRef.current)
    }

    return () => {
      if (countRef.current) {
        observer.disconnect()
      }
    }
  }, [])

  useEffect(() => {
    if (!isVisible) return

    let start = 0
    const end = Math.min(value, 9999)
    const increment = end / (duration / 16)
    const timer = setInterval(() => {
      start += increment
      setCount(Math.min(Math.floor(start), end))
      if (start >= end) clearInterval(timer)
    }, 16)

    return () => clearInterval(timer)
  }, [value, duration, isVisible])

  return (
    <div className="flex flex-col items-center text-center" ref={countRef}>
      <div className="text-4xl font-bold text-indigo-600">
        {count.toLocaleString()}
        {suffix}
      </div>
      <div className="text-slate-600 mt-2">{label}</div>
    </div>
  )
}

