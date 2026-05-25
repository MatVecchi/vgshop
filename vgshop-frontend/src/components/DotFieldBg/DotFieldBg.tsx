"use client";

import React from "react";
import DotField from "@/components/ui/DotField/DotField";
import { useEffect, useState } from "react";

interface HeroBackgroundWrapperProps {
  children: React.ReactNode;
}

export default function DotFieldBg({ children }: HeroBackgroundWrapperProps) {
  return (
    <div className="relative overflow-hidden bg-slate-950 text-white shadow-xl rounded-b-3xl w-full min-h-screen">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <DotField sparkle={true} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto w-full px-4">
        {children}
      </div>
    </div>
  );
}
