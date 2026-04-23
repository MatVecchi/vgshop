import React from "react";
import Link from "next/link";
import Image from "next/image";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex justify-center">
      <div className="flex flex-col w-full p-4 max-w-7xl">
        <Link href="/">
          <Image src="/favicon.ico" alt="Logo" width={32} height={32} />
        </Link>
        <div className="w-full flex items-center justify-center min-h-screen">
          {children}
        </div>
      </div>
    </div>
  );
}
