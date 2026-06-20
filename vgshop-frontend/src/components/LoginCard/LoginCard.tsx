"use client";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/dist/client/link";
import { PasswordInput } from "../PasswordInput/PasswordInput";
import { LockKeyhole, User } from "lucide-react";
import ErrorMessage from "../ErrorMessage/ErrorMessage";

export function LoginCard() {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const router = useRouter();

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.post("/api/login/", {
        username: username,
        password: password,
      });

      toast.success(response.data.message);
      router.push("/");
    } catch (error: any) {
      if (error.status === 401) {
        setErrorMessage(error.response.data.message);
      } else {
        setErrorMessage("Something went wrong, try again");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center w-full mx-auto px-4">
      <Card className="w-full max-w-md border border-border/60 shadow-md bg-card/50 backdrop-blur-sm pb-0!">
        <CardHeader className="space-y-2 text-center pt-8">
          <CardTitle className="text-2xl font-bold tracking-tight flex items-center justify-center gap-4 -ml-10">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <LockKeyhole className="h-5 w-5" />
            </div>
            Login
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground px-4">
            Inserisci le tue credenziali per accedere al tuo account
          </CardDescription>
        </CardHeader>

        <CardContent className="px-6 pb-4">
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-2">
              <Label
                htmlFor="username"
                className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/90 flex items-center gap-1.5"
              >
                <User className="w-3.5 h-3.5 text-primary/80" />
                Username
              </Label>
              <Input
                id="username"
                type="text"
                placeholder="MarioRossi"
                className="w-full h-10 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-primary"
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="password"
                  className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/90 flex items-center gap-1.5"
                >
                  <LockKeyhole className="w-3.5 h-3.5 text-primary/80" />
                  Password
                </Label>
                <Button
                  variant="link"
                  className="p-0 h-auto text-xs text-muted-foreground hover:text-primary font-medium transition-colors"
                  asChild
                >
                  <Link href="/forgot_password">Password dimenticata?</Link>
                </Button>
              </div>
              <PasswordInput
                id="password"
                placeholder="••••••••"
                className="w-full h-10 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-primary "
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            {errorMessage && (
              <div className="pt-2">
                <ErrorMessage message={[errorMessage]} />
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-10 bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm text-sm font-medium transition-all transform active:scale-[0.99] mt-2"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <Spinner className="h-4 w-4" />
                  <span>Accesso in corso...</span>
                </div>
              ) : (
                "Accedi"
              )}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex items-center justify-center border-t border-border/60 py-4 bg-muted/30 rounded-b-lg text-sm text-muted-foreground gap-1">
          <span>Non hai un account?</span>
          <Button
            variant="link"
            className="p-0 h-auto font-semibold text-primary hover:underline"
            asChild
          >
            <Link href="/register">Registrati</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
