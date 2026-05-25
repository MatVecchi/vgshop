import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface ErrorMessageProps extends HTMLAttributes<HTMLDivElement> {
  message?: string | string[] | null;
}

export default function ErrorMessage({
  message,
  className,
  ...props
}: ErrorMessageProps) {
  if (!message) return null;

  const displayMessage = Array.isArray(message) ? message[0] : message;

  if (!displayMessage) return null;

  return (
    <div
      className={cn(
        "flex items-center gap-1.5 mt-1.5 text-sm font-medium text-destructive",
        "animate-in fade-in slide-in-from-top-1 duration-200",
        className,
      )}
      {...props}
    >
      <svg
        className="w-4 h-4 shrink-0"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
      <span>{displayMessage}</span>
    </div>
  );
}
