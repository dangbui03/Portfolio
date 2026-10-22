"use client";

import React, { useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useGravity } from "../visual/GravityPhysics";
import { cn } from "@/lib/utils";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  floatDelay?: number; // Delay in float animations to break uniform movement
  enableTilt?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className,
  floatDelay = 0,
  enableTilt = true,
}) => {
  const { config } = useGravity();
  const cardRef = useRef<HTMLDivElement>(null);
  
  // Motion states for 3D Tilt Effect
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Smooth springs for dampening movement
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [10, -10]), { stiffness: 120, damping: 20 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-10, 10]), { stiffness: 120, damping: 20 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!enableTilt || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left - width / 2;
    const mouseY = e.clientY - rect.top - height / 2;
    
    // Normalize coordinates from -0.5 to 0.5
    x.set(mouseX / width);
    y.set(mouseY / height);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{
        y: [0, -config.floatDistance, 0],
      }}
      transition={{
        repeat: Infinity,
        duration: 6 * config.floatDurationMultiplier,
        ease: "easeInOut",
        delay: floatDelay,
      }}
      style={{
        rotateX: enableTilt ? rotateX : 0,
        rotateY: enableTilt ? rotateY : 0,
        transformStyle: "preserve-3d",
      }}
      className={cn(
        "glass-panel rounded-2xl p-6 relative overflow-hidden transition-all duration-300",
        "before:absolute before:inset-0 before:p-[1px] before:rounded-2xl",
        "before:bg-gradient-to-br before:from-white/12 before:via-transparent before:to-white/5",
        "before:-z-10",
        className
      )}
    >
      {/* Dynamic ambient hover glow */}
      <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/0 via-cyan-500/0 to-cyan-500/4 opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      <div className="relative z-10" style={{ transform: "translateZ(20px)" }}>
        {children}
      </div>
    </motion.div>
  );
};
