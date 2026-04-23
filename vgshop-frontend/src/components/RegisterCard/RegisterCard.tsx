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
import { Switch } from "@/components/ui/switch";
import { useState } from "react";
import { toast } from "sonner";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import Link from "next/dist/client/link";

export function RegisterCard() {
  const [isPublisher, setisPublisher] = useState<boolean>(false);
  const [username, setUsername] = useState<string>("");
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [piva, setPiva] = useState<string | null>("");
  const [website, setWebsite] = useState<string | null>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  const router = useRouter();

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.post("/api/register/", {
        username: username,
        password: password,
        first_name: firstName,
        last_name: lastName,
        email: email,
        isPublisher: isPublisher,
        piva: piva,
        website: website,
      });

      toast.success("Registration completed ! ");
      router.push("/login");
    } catch (e: any) {
      if (e.response && e.response.data) {
        setErrors(e.response.data);
      } else {
        toast.error("Something went wrong, try again !");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full mx-auto my-28 max-w-sm">
      <CardHeader>
        <CardTitle>Registrati</CardTitle>
        <CardDescription>
          Inserisci i tuoi dati qui sotto per registrarti
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="name">Username</Label>
              <Input
                id="name"
                placeholder="Mario.Rossi"
                onChange={(e) => setUsername(e.target.value)}
              />
              {errors.username && (
                <p className="text-sm text-red-500 text-destructive-foreground">
                  {errors.username[0]}
                </p>
              )}
            </div>

            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="first_name"
                placeholder="Mario"
                onChange={(e) => setFirstName(e.target.value)}
              />
              {errors.first_name && (
                <p className="text-sm text-red-500 text-destructive-foreground">
                  {errors.first_name[0]}
                </p>
              )}
            </div>

            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="name">Cognome</Label>
              <Input
                id="last_name"
                placeholder="Rossi"
                onChange={(e) => setLastName(e.target.value)}
              />
              {errors.last_name && (
                <p className="text-sm text-red-500 text-destructive-foreground">
                  {errors.last_name[0]}
                </p>
              )}
            </div>

            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="mario@esempio.it"
                onChange={(e) => setEmail(e.target.value)}
              />
              {errors.email && (
                <p className="text-sm text-red-500 text-destructive-foreground">
                  {errors.email[0]}
                </p>
              )}
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="esempio123"
                onChange={(e) => setPassword(e.target.value)}
              />
              {errors.password && (
                <p className="text-sm text-red-500 text-destructive-foreground">
                  {errors.password[0]}
                </p>
              )}
            </div>
            <div className="flex flex-row space-x-1.5">
              <Switch
                id="isPublisher"
                checked={isPublisher}
                onCheckedChange={setisPublisher}
              />
              <Label htmlFor="isPublisher">Publisher</Label>
            </div>
            {isPublisher ? (
              <div className="grid w-full items-center gap-4">
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="piva">Partita IVA</Label>
                  <Input
                    id="piva"
                    onChange={(e) =>
                      setPiva(e.target.value === "" ? null : e.target.value)
                    }
                  />
                  {errors.piva && (
                    <p className="text-sm text-red-500 text-destructive-foreground">
                      {errors.piva[0]}
                    </p>
                  )}
                </div>
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="email">Sito web</Label>
                  <Input
                    id="website"
                    placeholder="www.website.it"
                    onChange={(e) =>
                      setWebsite(e.target.value === "" ? null : e.target.value)
                    }
                  />
                  {errors.website && (
                    <p className="text-sm text-red-500 text-destructive-foreground">
                      {errors.website[0]}
                    </p>
                  )}
                </div>
              </div>
            ) : null}
          </div>
          <Button className="w-full" type="submit">
            {loading ? "Registering ..." : "Registrati"}
            {loading && <Spinner className="ml-2" data-icon="inline-start" />}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col">
        <p className="text-xs text-center text-gray-500">
          Hai già un account?{" "}
          <Button variant="link" className="p-1 h-auto font-semibold" asChild>
            <Link href="/login">Effettua il Login</Link>
          </Button>
        </p>
      </CardFooter>
    </Card>
  );
}
