"use client";

import React, { useEffect, useState } from "react";
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
    <main className="h-screen h-[100dvh] w-full overflow-hidden bg-[#f4ecdc] selection:bg-[#d97706]/20 selection:text-[#78350f]">
      <SignpostNav key={mountKey} />
    </main>
  );
}
