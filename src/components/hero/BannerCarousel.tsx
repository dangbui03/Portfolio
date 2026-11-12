"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  animate,
  type PanInfo,
} from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
  GripHorizontal,
  Database,
} from "lucide-react";
import { useBannerImages } from "@/hooks/useBannerImages";
import type { BannerItem } from "@/lib/s3-banners";
import type { SignpostRoute } from "@/components/3D/Signpost3D";

const CARD_GAP = 16;

export interface BannerCarouselProps {
  onNavigate?: (href: SignpostRoute) => void;
}

export default function BannerCarousel({ onNavigate }: BannerCarouselProps) {
  const { banners, isLoading, isMockData } = useBannerImages();
  const prefersReducedMotion = useReducedMotion();

  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  const x = useMotionValue(0);

  const [maxDrag, setMaxDrag] = useState(0);
  const [cardStep, setCardStep] = useState(340);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [bouncingCardId, setBouncingCardId] = useState<string | null>(null);
  const [selectedBanner, setSelectedBanner] = useState<BannerItem | null>(null);

  // Track pointer start coordinates to prevent drag-vs-tap gesture conflict
  const pointerStartRef = useRef<{ x: number; y: number } | null>(null);
  const bounceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const updateConstraints = useCallback(() => {
    if (!viewportRef.current || !trackRef.current) return;
    const viewportWidth = viewportRef.current.clientWidth;
    const trackWidth = trackRef.current.scrollWidth;
    const computedMax = Math.max(0, trackWidth - viewportWidth);
    setMaxDrag(computedMax);

    const firstCard = trackRef.current.querySelector<HTMLElement>(
      "[data-banner-card]",
    );
    if (firstCard) {
      setCardStep(firstCard.offsetWidth + CARD_GAP);
    }

    // Clamp current x if window resized wider
    const currentX = x.get();
    if (currentX < -computedMax) {
      x.set(-computedMax);
    } else if (currentX > 0) {
      x.set(0);
    }
  }, [x]);

  useEffect(() => {
    updateConstraints();
    const observer = new ResizeObserver(() => updateConstraints());
    if (viewportRef.current) observer.observe(viewportRef.current);
    if (trackRef.current) observer.observe(trackRef.current);
    window.addEventListener("resize", updateConstraints);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateConstraints);
    };
  }, [updateConstraints, banners.length]);

  useEffect(() => {
    const unsubscribe = x.on("change", (latestX) => {
      if (cardStep <= 0) return;
      const idx = Math.round(Math.abs(latestX) / cardStep);
      const clampedIdx = Math.max(0, Math.min(banners.length - 1, idx));
      setActiveIndex(clampedIdx);
    });
    return () => unsubscribe();
  }, [x, cardStep, banners.length]);

  useEffect(() => {
    return () => {
      if (bounceTimeoutRef.current) {
        clearTimeout(bounceTimeoutRef.current);
      }
    };
  }, []);

  const scrollToIndex = useCallback(
    (index: number) => {
      const clampedIndex = Math.max(0, Math.min(banners.length - 1, index));
      const targetX = Math.max(-maxDrag, Math.min(0, -clampedIndex * cardStep));
      setActiveIndex(clampedIndex);

      if (prefersReducedMotion) {
        x.set(targetX);
      } else {
        animate(x, targetX, {
          type: "spring",
          stiffness: 320,
          damping: 32,
          mass: 0.8,
        });
      }
    },
    [banners.length, cardStep, maxDrag, prefersReducedMotion, x],
  );

  // Magnetic velocity-aware card snap on drag release
  const handleDragEnd = useCallback(
    (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      setIsDragging(false);
      if (cardStep <= 0) return;

      const projectedX = x.get() + info.velocity.x * 0.18;
      const rawIndex = Math.round(Math.abs(projectedX) / cardStep);
      const targetIndex =
        projectedX > 0
          ? 0
          : Math.max(0, Math.min(banners.length - 1, rawIndex));

      scrollToIndex(targetIndex);
    },
    [banners.length, cardStep, scrollToIndex, x],
  );

  const handleCardPointerDown = (e: React.PointerEvent) => {
    pointerStartRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleCardTap = (banner: BannerItem, e: React.MouseEvent) => {
    if (pointerStartRef.current) {
      const dx = Math.abs(e.clientX - pointerStartRef.current.x);
      const dy = Math.abs(e.clientY - pointerStartRef.current.y);
      if (dx > 8 || dy > 8 || isDragging) {
        return;
      }
    }

    setBouncingCardId(banner.id);
    setSelectedBanner(banner);

    if (bounceTimeoutRef.current) {
      clearTimeout(bounceTimeoutRef.current);
    }
    bounceTimeoutRef.current = setTimeout(() => {
      setBouncingCardId(null);
    }, 420);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      scrollToIndex(activeIndex + 1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      scrollToIndex(activeIndex - 1);
    }
  };

  return (
    <section
      aria-label="Featured S3 Banners Carousel"
      onKeyDown={handleKeyDown}
      className="relative z-10 hidden w-full shrink-0 border-b border-[#dccbb1] bg-gradient-to-b from-[#fdfbf7] via-[#f7f0e2] to-[#f4ecdc] pt-3 pb-3.5 shadow-[0_4px_20px_rgba(58,32,20,0.06)] md:block"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Compact Header Bar */}
        <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#d97706]/30 bg-[#f59e0b]/15 px-2.5 py-0.5 text-[11px] font-semibold tracking-wide text-[#78350f]">
              <Database className="h-3 w-3 text-[#b45309]" aria-hidden="true" />
              {isMockData ? "S3 Mock Feed Ready" : "AWS S3 Live Feed"}
            </span>
            <h2 className="font-serif text-base font-bold tracking-tight text-[#3a2014] lg:text-lg">
              Crossroads Dispatch &amp; Highlights
            </h2>
          </div>

          {/* Drag Hint + Accessible Navigation Buttons */}
          <div className="flex items-center gap-2.5">
            <span className="hidden items-center gap-1.5 text-xs font-medium text-[#785a4a] lg:inline-flex">
              <GripHorizontal className="h-3.5 w-3.5 text-[#b45309]" aria-hidden="true" />
              <span>Drag to snap cards</span>
            </span>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => scrollToIndex(activeIndex - 1)}
                disabled={activeIndex <= 0}
                aria-label="Previous banner"
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#dccbb1] bg-[#fdfbf7] text-[#3a2014] shadow-xs transition-colors hover:border-[#b45309] hover:bg-[#f7f2e7] focus-visible:ring-2 focus-visible:ring-[#d97706] focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => scrollToIndex(activeIndex + 1)}
                disabled={activeIndex >= banners.length - 1}
                aria-label="Next banner"
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#dccbb1] bg-[#fdfbf7] text-[#3a2014] shadow-xs transition-colors hover:border-[#b45309] hover:bg-[#f7f2e7] focus-visible:ring-2 focus-visible:ring-[#d97706] focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>

        {/* Draggable Horizontal Viewport */}
        <div
          ref={viewportRef}
          className="relative overflow-hidden rounded-xl py-1"
        >
          <motion.div
            ref={trackRef}
            style={{ x }}
            drag="x"
            dragConstraints={{ left: -maxDrag, right: 0 }}
            dragElastic={0.12}
            onDragStart={() => setIsDragging(true)}
            onDragEnd={handleDragEnd}
            className={`flex gap-4 select-none ${
              isDragging ? "cursor-grabbing" : "cursor-grab"
            }`}
          >
            {banners.map((banner, index) => {
              const isBouncing = bouncingCardId === banner.id;
              const isSelected = selectedBanner?.id === banner.id;

              return (
                <motion.article
                  key={banner.id}
                  data-banner-card
                  tabIndex={0}
                  onPointerDown={handleCardPointerDown}
                  onClick={(e) => handleCardTap(banner, e)}
                  animate={{
                    scale: isBouncing
                      ? [1, 0.95, 1.03, 0.99, 1]
                      : isDragging
                        ? 0.975
                        : 1,
                    opacity: isDragging ? 0.9 : 1,
                    y: isDragging ? 1 : 0,
                  }}
                  whileHover={
                    !isDragging
                      ? { y: -2, transition: { duration: 0.18 } }
                      : undefined
                  }
                  whileTap={{
                    scale: 0.96,
                    transition: {
                      type: "spring",
                      stiffness: 520,
                      damping: 24,
                    },
                  }}
                  transition={
                    isBouncing
                      ? {
                          duration: 0.38,
                          ease: [0.22, 1, 0.36, 1],
                        }
                      : {
                          type: "spring",
                          stiffness: 380,
                          damping: 26,
                          mass: 0.75,
                        }
                  }
                  className={`group relative w-[320px] shrink-0 overflow-hidden rounded-xl border bg-[#3a2014] text-[#fdfbf7] shadow-sm transition-shadow lg:w-[350px] ${
                    isSelected
                      ? "border-[#f59e0b] ring-2 ring-[#d97706]/50 shadow-lg"
                      : "border-[#5c3d2e]/60 hover:shadow-md"
                  }`}
                >
                  {/* Banner Image from S3 / Local Mock */}
                  <div className="relative h-32 w-full overflow-hidden lg:h-36">
                    <img
                      src={banner.imageUrl}
                      alt={banner.alt}
                      draggable={false}
                      loading={index < 3 ? "eager" : "lazy"}
                      className="h-full w-full object-cover transition-transform duration-500 ease-out select-none group-hover:scale-105"
                    />
                    <div
                      className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#27140b] via-[#27140b]/35 to-transparent"
                      aria-hidden="true"
                    />

                    {/* Top Tag Pill & S3 Key Indicator */}
                    <div className="absolute top-2.5 right-2.5 left-2.5 flex items-center justify-between gap-2">
                      <span className="rounded-md bg-[#27140b]/80 px-2 py-0.5 text-[11px] font-semibold text-[#fcd34d] backdrop-blur-xs">
                        {banner.tag}
                      </span>
                      <span className="truncate rounded-md bg-[#27140b]/70 px-1.5 py-0.5 font-mono text-[10px] text-[#e7ddc8]/90 backdrop-blur-xs">
                        {banner.s3Key}
                      </span>
                    </div>

                    {/* Content Overlay */}
                    <div className="absolute right-3 bottom-2.5 left-3 flex items-end justify-between gap-2.5">
                      <div className="min-w-0">
                        <h3 className="truncate font-serif text-base font-bold text-[#fdfbf7] drop-shadow-xs">
                          {banner.title}
                        </h3>
                        <p className="line-clamp-1 text-xs text-[#f6ebd8]/90">
                          {banner.subtitle}
                        </p>
                      </div>

                      {banner.href && (
                        <Link
                          href={banner.href}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onNavigate) {
                              e.preventDefault();
                              onNavigate(banner.href as SignpostRoute);
                            }
                          }}
                          aria-label={`Open ${banner.title}`}
                          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#d97706] text-[#fdfbf7] shadow-sm transition-transform hover:bg-[#b45309] active:scale-95"
                        >
                          <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                        </Link>
                      )}
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </motion.div>
        </div>

        {/* Footer: Pagination Dots & Active Tap Feedback */}
        <div className="mt-1.5 flex flex-wrap items-center justify-between gap-2">
          <div
            className="flex items-center gap-1"
            role="tablist"
            aria-label="Banner slide indicators"
          >
            {banners.map((item, idx) => {
              const isActive = idx === activeIndex;
              return (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  aria-label={`Go to slide ${idx + 1}: ${item.title}`}
                  onClick={() => scrollToIndex(idx)}
                  className="group inline-flex h-5 items-center justify-center px-1 focus-visible:outline-none"
                >
                  <span
                    className={`block h-1.5 rounded-full transition-all duration-300 ${
                      isActive
                        ? "w-6 bg-[#b45309]"
                        : "w-1.5 bg-[#c8b396] group-hover:bg-[#8c6748]"
                    }`}
                  />
                </button>
              );
            })}
          </div>

          <div className="text-[11px] font-medium text-[#785a4a]" aria-live="polite">
            {isLoading ? (
              <span>Syncing S3 bucket...</span>
            ) : selectedBanner ? (
              <span>
                Selected:{" "}
                <strong className="text-[#3a2014]">{selectedBanner.title}</strong>
              </span>
            ) : (
              <span>Tap any banner for tactile preview</span>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
