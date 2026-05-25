"use client";

import React from "react";
import LightRays from "@/components/ui/LightRay/LightRays";

interface HeroBackgroundWrapperProps {
  children: React.ReactNode;
}

export default function LightRaysBg({ children }: HeroBackgroundWrapperProps) {
  return (
    <div className="relative overflow-hidden bg-slate-950 text-white shadow-xl rounded-b-3xl w-full min-h-screen">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <LightRays
          raysOrigin="top-center"
          raysColor="#A855F7"
          raysSpeed={0.9}
          lightSpread={1}
          rayLength={0.8}
          pulsating={false}
          fadeDistance={3.5}
          saturation={1}
          followMouse
          mouseInfluence={0.05}
          noiseAmount={0}
          distortion={0}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto w-full px-4">
        {children}
      </div>
    </div>
  );
}
