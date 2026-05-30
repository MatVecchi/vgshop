"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import Link from "next/link";
import { FieldGroup, Field } from "@/components/ui/field";
import ErrorMessage from "@/components/ErrorMessage/ErrorMessage";
import { User, KeyRound } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import api from "@/lib/api";
import { toast } from "sonner";

export default function ForgotPassword() {
  const [username, setUsername] = useState<string>("");
  const [submitLoading, setSubmitLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<Record<string, string[]>>(
    {},
  );

  const handleReset = () => {
    setUsername("");
    setErrorMessage({});
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setSubmitLoading(true);
    setErrorMessage({});

    try {
      const formData = new FormData();
      formData.append("username", username);

      const response = await api.post("/api/lost_password/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Abbiamo inviato l'email !");
      handleReset();
    } catch (e: any) {
      if (e.response && e.response.data) {
        if (e.response.data.message) {
          toast.error(e.response.data.message[0]);
        } else {
          setErrorMessage(e.response.data);
        }
      } else {
        toast.error(
          "Errore nella richiesta di modifica delle password! riprova",
        );
      }
    } finally {
      setSubmitLoading(false);
    }
  };

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
        <form onSubmit={handleSubmit}>
          <FieldGroup className="space-y-5">
            <Field className="flex flex-col gap-2">
              <label
                htmlFor="username"
                className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/90 flex items-center gap-1.5"
              >
                <User className="w-3.5 h-3.5 text-primary/80" />
                Username
              </label>
              <Input
                id="username"
                type="text"
                placeholder="es. mario_rossi"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full transition-all duration-200 focus-visible:ring-2 focus-visible:ring-primary"
                required
                disabled={submitLoading}
              />
              <ErrorMessage message={errorMessage.username} />
            </Field>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/60 mt-6">
              <Button
                type="button"
                variant="destructive"
                className="text-muted-foreground hover:text-foreground px-4 h-10 text-sm font-medium transition-colors"
                onClick={handleReset}
                disabled={submitLoading}
              >
                Annulla
              </Button>
              <Button
                type="submit"
                disabled={submitLoading || !username}
                className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm h-10 px-5 text-sm font-medium transition-all transform active:scale-[0.98] disabled:opacity-50"
              >
                {submitLoading ? <Spinner /> : "Conferma"}
              </Button>
            </div>
          </FieldGroup>
        </form>
      </CardContent>

      <CardFooter className="flex items-center justify-center border-t border-border/60 py-4 bg-muted/30 rounded-b-lg text-sm text-muted-foreground gap-1">
        <span>Hai ricordato la password?</span>
        <Button
          variant="link"
          className="p-0 h-auto font-semibold text-primary hover:underline"
          asChild
        >
          <Link href="/login">Torna al login</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
