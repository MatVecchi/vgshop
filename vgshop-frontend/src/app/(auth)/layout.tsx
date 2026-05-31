import React from "react";
import Link from "next/link";
import Image from "next/image";
import GrainientBg from "@/components/GrainientBg/GrainientBg";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex justify-center">
      <div className="flex flex-col w-full max-w-7xl">
        <GrainientBg>
          <Link href="/" className="absolute top-6 left-6 z-10">
            <Image src="/favicon.ico" alt="Logo" width={32} height={32} />
          </Link>
          <div className="w-full flex items-center justify-center min-h-screen">
            {children}
          </div>
        </GrainientBg>
      </div>
    </div>
  );
}
