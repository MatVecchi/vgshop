"use client";

import React from "react";
import Grainient from "@/components/ui/Grainient/Grainient";

interface HeroBackgroundWrapperProps {
  children: React.ReactNode;
}

export default function GrainientBg({ children }: HeroBackgroundWrapperProps) {
  return (
    <div className="relative overflow-hidden bg-slate-950 text-white shadow-xl rounded-b-3xl w-full min-h-screen">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Grainient
          color1="#1e293b"
          color2="#1e1b4b"
          color3="#581c87"
          timeSpeed={0.9}
          colorBalance={0}
          warpStrength={1}
          warpFrequency={5}
          warpSpeed={2}
          warpAmplitude={50}
          blendAngle={0}
          blendSoftness={0.05}
          rotationAmount={500}
          noiseScale={2}
          grainAmount={0.1}
          grainScale={2}
          grainAnimated={false}
          contrast={1.5}
          gamma={1}
          saturation={1}
          centerX={0}
          centerY={0}
          zoom={0.9}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto w-full px-4">
        {children}
      </div>
    </div>
  );
}
