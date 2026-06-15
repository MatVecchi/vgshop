"use client";

import ResetPasswordFields from "@/components/ResetPasswordFields/ResetPasswordFields";
import {
  Card,
  CardHeader,
  CardDescription,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { KeyRound } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

export default function ForgotPasswordConfirm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const uid = searchParams.get("uid");
  const router = useRouter();

  if (!uid || !token) {
    router.push("/login");
  }

  return (
    <Card className="w-full max-w-md border border-border/60 shadow-md bg-card/50 backdrop-blur-sm">
      <CardHeader className="space-y-2 pt-8">
        <CardTitle className="text-2xl font-bold tracking-tight flex justify-center gap-5 items-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <KeyRound className="h-6 w-6" />
          </div>
          Password dimenticata
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground px-4">
          Inserisci il tuo username. Ti sarà inviata una mail con il link per il
          reset della password !
        </CardDescription>
      </CardHeader>

      <CardContent className="pb-8 px-6">
        <ResetPasswordFields forgot={true} uid={uid} token={token} />
      </CardContent>
    </Card>
  );
}
