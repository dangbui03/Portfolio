"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type GravityLevel = "normal" | "low" | "zero";

interface GravityConfig {
  floatDistance: number;   // Max pixel amplitude of floating items
  floatDurationMultiplier: number; // Float duration multiplier (slower in low gravity)
  particleSpeed: number;    // Base speed of canvas particles
  repelForce: number;      // Cursor repel distance/force multiplier
  gravityMultiplier: number; // General visual modifier
}

interface GravityContextType {
  gravity: GravityLevel;
  setGravity: (level: GravityLevel) => void;
  config: GravityConfig;
}

const gravityConfigs: Record<GravityLevel, GravityConfig> = {
  normal: {
    floatDistance: 8,
    floatDurationMultiplier: 1,
    particleSpeed: 0.8,
    repelForce: 1,
    gravityMultiplier: 1,
  },
  low: {
    floatDistance: 24,
    floatDurationMultiplier: 1.5,
    particleSpeed: 0.3,
    repelForce: 1.8,
    gravityMultiplier: 0.3,
  },
  zero: {
    floatDistance: 45,
    floatDurationMultiplier: 2.2,
    particleSpeed: 0.05,
    repelForce: 3.0,
    gravityMultiplier: 0,
  },
};

const GravityContext = createContext<GravityContextType | undefined>(undefined);

export const GravityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [gravity, setGravityState] = useState<GravityLevel>("normal");
  const [config, setConfig] = useState<GravityConfig>(gravityConfigs.normal);

  const setGravity = (level: GravityLevel) => {
    setGravityState(level);
    setConfig(gravityConfigs[level]);
  };

  return (
    <GravityContext.Provider value={{ gravity, setGravity, config }}>
      {children}
    </GravityContext.Provider>
  );
};

export const useGravity = () => {
  const context = useContext(GravityContext);
  if (!context) {
    throw new Error("useGravity must be used within a GravityProvider");
  }
  return context;
};
