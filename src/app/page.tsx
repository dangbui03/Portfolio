"use client";

import React from "react";
import SignpostNav from "@/components/hero/SignpostNav";

export default function Home() {
  return (
    <main className="h-screen h-[100dvh] w-full overflow-hidden bg-[#f4ecdc] selection:bg-[#d97706]/20 selection:text-[#78350f]">
      <SignpostNav />
    </main>
  );
}
