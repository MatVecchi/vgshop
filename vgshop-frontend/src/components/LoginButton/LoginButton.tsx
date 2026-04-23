"use client";
import { LogIn } from "lucide-react";
import Link from "next/link";

export default function LoginButton() {
  return (
    <Link href="/login">
      <LogIn className="inline-block mr-2" />
      Login
    </Link>
  );
}
