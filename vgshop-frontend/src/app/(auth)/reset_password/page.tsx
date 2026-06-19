"use client";
import { Suspense } from "react";
import ResetPasswordFields from "@/components/ResetPasswordFields/ResetPasswordFields";
import {
  Card,
  CardHeader,
  CardDescription,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { KeyRound } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ForgotPasswordConfirm() {
  const router = useRouter();

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
        <Suspense
          fallback={
            <div className="text-center py-4 text-sm text-muted-foreground">
              Caricamento modulo...
            </div>
          }
        >
          <ResetPasswordFields forgot={true} />
        </Suspense>
      </CardContent>
    </Card>
  );
}
