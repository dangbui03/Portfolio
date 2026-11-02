"use client";

import React, { useEffect, useState } from "react";
import BannerCarousel from "@/components/hero/BannerCarousel";
import SignpostNav from "@/components/hero/SignpostNav";

export default function Home() {
  const [mountKey, setMountKey] = useState(0);

  useEffect(() => {
    // Snap window to top on crossroads landing
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });

    const handleRestore = () => {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      setMountKey((prev) => prev + 1);
    };

    const handlePageShow = (e: PageTransitionEvent) => {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      if (e.persisted) {
        setMountKey((prev) => prev + 1);
      }
    };

    window.addEventListener("popstate", handleRestore);
    window.addEventListener("pageshow", handlePageShow);

    return () => {
      window.removeEventListener("popstate", handleRestore);
      window.removeEventListener("pageshow", handlePageShow);
    };
  }, []);

  return (
    <main className="flex min-h-screen min-h-[100dvh] w-full flex-col overflow-x-hidden bg-[#f4ecdc] selection:bg-[#d97706]/20 selection:text-[#78350f]">
      {/* Top Horizontal S3 Banner Carousel */}
      <BannerCarousel />

      {/* Pushed-down 3D Wooden Signpost Navigation Area */}
      <section
        aria-label="3D Crossroads Signpost Navigation"
        className="relative w-full flex-1"
      >
        <SignpostNav key={mountKey} />
      </section>
    </main>
  );
}
