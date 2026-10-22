"use client";

import React from "react";
import SignpostNav from "@/components/hero/SignpostNav";
import { 
  Compass, 
  BookOpen, 
  Briefcase, 
  Send, 
  ArrowUpRight, 
  Clock, 
  Calendar, 
  Mail,
  Globe,
  Share2,
  ChevronUp
} from "lucide-react";

export default function Home() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-[#fdfbf7] text-[#3a2014] selection:bg-[#d97706]/20 selection:text-[#78350f]">
      <SignpostNav />

    </div>
  );
}
