"use client";

import React, { useRef, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

// Omit conflicting event handlers to reconcile standard button attributes with Framer Motion keys
type MotionButtonProps = Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "onDrag" | "onDragStart" | "onDragEnd" | "onAnimationStart"
>;

interface GravityButtonProps extends MotionButtonProps {
  children: React.ReactNode;
  className?: string;
  magneticPull?: number; // Attraction strength (default 0.35)
}

export const GravityButton: React.FC<GravityButtonProps> = ({
  children,
  className,
  magneticPull = 0.35,
  ...props
}) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // Distance from button center
    const xDist = e.clientX - centerX;
    const yDist = e.clientY - centerY;

    // Apply attractive gravity force (magnetic effect)
    setPosition({
      x: xDist * magneticPull,
      y: yDist * magneticPull,
    });
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
  };

  return (
    <motion.button
      ref={buttonRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
      className={cn(
        "px-6 py-3 rounded-full font-medium relative overflow-hidden group select-none cursor-pointer",
        "bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500",
        "text-white shadow-[0_4px_20px_rgba(99,102,241,0.25)] hover:shadow-[0_4px_25px_rgba(6,182,212,0.4)]",
        "transition-all duration-300 active:scale-95 border border-white/10",
        className
      )}
      {...props}
    >
      {/* Glint glow effect */}
      <span className="absolute inset-0 bg-white/20 translate-y-[100%] group-hover:translate-y-[-100%] transition-transform duration-700 ease-out pointer-events-none" />
      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>
    </motion.button>
  );
};
