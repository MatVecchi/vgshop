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
    <Card className="w-full mx-auto my-28 max-w-sm">
      <CardHeader>
        <CardTitle>Effettua il login</CardTitle>
        <CardDescription>
          Inserisci il tuo username qui sotto per accedere al tuo account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
          <div className="grid gap-2">
            <Label htmlFor="username">Username</Label>
            <Input
              onChange={(e) => setUsername(e.target.value)}
              id="username"
              type="text"
              placeholder="Username"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              onChange={(e) => setPassword(e.target.value)}
              id="password"
              type="password"
              placeholder="Password"
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
            {loading && <Spinner className="ml-2" data-icon="inline-start" />}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col gap-2">
        {errorMessage && (
          <p className="text-sm text-red-500 text-center">{errorMessage}</p>
        )}

        <div className="flex items-center justify-center text-xs text-gray-500 gap-4">
          <span>Non hai un account?</span>
          <Button
            variant="link"
            className="p-1 h-auto font-semibold" // Riducendo il padding e l'altezza, sta meglio in linea
            asChild
          >
            <Link href="/register">Registrati</Link>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
