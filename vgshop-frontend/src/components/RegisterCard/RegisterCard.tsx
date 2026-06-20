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
import { use, useState } from "react";
import { toast } from "sonner";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import Link from "next/dist/client/link";
import Stepper, { Step } from "../ui/Stepper";
import {
  Briefcase,
  Code,
  FileUser,
  IdCard,
  KeyRound,
  Landmark,
  LockKeyhole,
  Mail,
  RefreshCw,
  User,
} from "lucide-react";
import ErrorMessage from "../ErrorMessage/ErrorMessage";
import { PasswordInput } from "../PasswordInput/PasswordInput";

export function RegisterCard() {
  const [isPublisher, setisPublisher] = useState<boolean>(false);
  const [username, setUsername] = useState<string>("");
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [piva, setPiva] = useState<string | null>("");
  const [iban, setIban] = useState<string | null>("");
  const [website, setWebsite] = useState<string | null>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [stepCount, setStepCount] = useState<number>(1);
  const router = useRouter();

  const handleSubmit = async () => {
    setLoading(true);
    setErrors({});
    try {
      if (confirmPassword !== password) {
        setErrors({ confirm_password: ["Le password non corrispondono !"] });
        setLoading(false);
        setStepCount(4);
        return;
      }

      const response = await api.post("/api/register/", {
        username: username,
        password: password,
        confirm_password: confirmPassword,
        first_name: firstName,
        last_name: lastName,
        email: email,
        isPublisher: isPublisher,
        piva: piva,
        iban: iban,
        website: website,
      });

      toast.success("Ti sei registrato correttamente ! ");
      router.push("/login");
    } catch (e: any) {
      if (e.response && e.response.data) {
        if (e.response.data.message) {
          toast.error(e.response.data.message[0]);
        } else {
          setErrors(e.response.data);
          if (e.response.data.username) {
            setStepCount(2);
          } else if (e.response.data.first_name || e.response.data.last_name) {
            setStepCount(3);
          } else if (
            e.response.data.password ||
            e.response.data.confirm_password ||
            e.response.data.non_fields_error
          ) {
            setStepCount(4);
          } else {
            setStepCount(5);
          }
        }
      } else {
        toast.error("Errore nell'aggiunta della recensione! riprova");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Stepper
        initialStep={1}
        onStepChange={(step) => {
          setStepCount(step);
        }}
        forceStep={stepCount}
        onFinalStepCompleted={handleSubmit}
        backButtonText="Indietro"
        nextButtonText="Continua"
      >
        <Step>
          <div className="flex flex-col items-center justify-center space-y-6 w-full max-w-md mx-auto py-4">
            <div className="space-y-3 text-center w-full">
              <div className="text-2xl font-bold tracking-tight flex items-center justify-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <User className="h-5 w-5" />
                </div>
                <span>Registrati</span>
              </div>

              <p className="text-sm text-muted-foreground px-6 max-w-sm mx-auto leading-relaxed">
                Procedi con la registrazione per creare il tuo nuovo account!
              </p>
            </div>
          </div>
        </Step>
        <Step>
          <div className="flex flex-col space-y-3 mb-5">
            <div className="space-y-1 mb-10 ">
              <div className="text-2xl font-bold tracking-tight flex items-center gap-3">
                <User className="h-5 w-5" />
                Credenziali
              </div>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
                Inserisci username ed email
              </p>
            </div>

            <Label
              htmlFor="username"
              className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/90 flex items-center gap-1.5"
            >
              <User className="w-3.5 h-3.5 text-primary/80" />
              Username
            </Label>
            <Input
              id="name"
              placeholder="MarioRossi"
              value={username}
              required
              onChange={(e) => setUsername(e.target.value)}
            />
            <ErrorMessage message={errors.username} />
          </div>
          <div className="flex flex-col space-y-3 mb-5">
            <Label
              htmlFor="email"
              className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/90 flex items-center gap-1.5"
            >
              <Mail className="w-3.5 h-3.5 text-primary/80" />
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              placeholder="mario@esempio.it"
              required
              onChange={(e) => setEmail(e.target.value)}
            />
            <ErrorMessage message={errors.email} />
          </div>
        </Step>
        <Step>
          <div className="flex flex-col space-y-3 mb-5">
            <div className="space-y-1 mb-10 ">
              <div className="text-2xl font-bold tracking-tight flex items-center gap-3">
                <IdCard className="h-5 w-5" />
                Generalità
              </div>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
                Inserisci nome e cognome (facoltativi)
              </p>
            </div>

            <Label
              htmlFor="first_name"
              className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/90 flex items-center gap-1.5"
            >
              <User className="w-3.5 h-3.5 text-primary/80" />
              Nome
            </Label>
            <Input
              id="first_name"
              placeholder="Mario"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
            <ErrorMessage message={errors.first_name} />
          </div>

          <div className="flex flex-col space-y-3 mb-5">
            <Label
              htmlFor="last_name"
              className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/90 flex items-center gap-1.5"
            >
              <User className="w-3.5 h-3.5 text-primary/80" />
              Cognome
            </Label>
            <Input
              id="last_name"
              placeholder="Rossi"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
            <ErrorMessage message={errors.last_name} />
          </div>
        </Step>
        <Step>
          <div className="space-y-1 mb-10 ">
            <div className="text-2xl font-bold tracking-tight flex items-center gap-3">
              <KeyRound className="h-5 w-5" />
              Password
            </div>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
              Inserisci la password per accedere all'account
            </p>
          </div>

          <div className="flex flex-col space-y-3 mb-5">
            <Label
              htmlFor="password"
              className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/90 flex items-center gap-1.5"
            >
              <LockKeyhole className="w-3.5 h-3.5 text-primary/80" />
              Password
            </Label>
            <PasswordInput
              id="password"
              placeholder="••••••••"
              className="w-full h-10 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-primary "
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <ErrorMessage
              message={errors.password || errors.non_field_errors}
            />
          </div>

          <div className="flex flex-col space-y-3 mb-5">
            <Label
              htmlFor="password"
              className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/90 flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5 text-primary/80" />
              <LockKeyhole className="w-3.5 h-3.5 text-primary/80" />
              Conferma Password
            </Label>
            <PasswordInput
              id="confirm_password"
              placeholder="••••••••"
              className="w-full h-10 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-primary "
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <ErrorMessage
              message={errors.confirm_password || errors.non_field_errors}
            />
          </div>
        </Step>
        <Step>
          <div className="space-y-1 mb-10 ">
            <div className="text-2xl font-bold tracking-tight flex items-center gap-3">
              <FileUser className="h-5 w-5" />
              Informazioni Publisher
            </div>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
              {isPublisher
                ? "Inserisci i dati sulla tua azienda"
                : "Specifica se sei un publisher o un utente customer"}
            </p>
          </div>

          <div className="flex flex-row space-x-3 space-y-3">
            <Label
              htmlFor="isPublisher"
              className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/90 flex items-center gap-1.5"
            >
              <Briefcase className="w-3.5 h-3.5 text-primary/80" />
              Sei un publisher ?
            </Label>
            <Switch
              id="isPublisher"
              checked={isPublisher}
              onCheckedChange={setisPublisher}
            />
          </div>
          {isPublisher ? (
            <div className="grid w-full items-center mt-5">
              <div className="flex flex-col space-y-3 mb-5">
                <Label
                  htmlFor="piva"
                  className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/90 flex items-center gap-1.5"
                >
                  <IdCard className="w-3.5 h-3.5 text-primary/80" />
                  Partita IVA
                </Label>
                <Input
                  id="piva"
                  onChange={(e) => {
                    if (isPublisher) {
                      const cleanValue = e.target.value.replace(/\s+/g, "");

                      setPiva(cleanValue);

                      if (/^\d{11}$/.test(cleanValue)) {
                        setErrors({});
                      } else {
                        setErrors({
                          piva: [
                            "Il codice deve essere composto da esattamente 11 cifre.",
                          ],
                        });
                      }
                    }
                  }}
                />
                <ErrorMessage message={errors.piva} />
              </div>
              <div className="flex flex-col space-y-3 mb-5">
                <Label
                  htmlFor="iban"
                  className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/90 flex items-center gap-1.5"
                >
                  <Landmark className="w-3.5 h-3.5 text-primary/80" />
                  IBAN
                </Label>
                <Input
                  id="iban"
                  onChange={(e) => {
                    if (isPublisher) {
                      const cleanValue = e.target.value.replace(/\s+/g, "");

                      setIban(cleanValue);

                      if (
                        /^[A-Z]{2}[0-9]{2}[A-Z0-9]{11,30}$/.test(cleanValue)
                      ) {
                        setErrors({});
                      } else {
                        setErrors({
                          iban: [
                            "Il codice deve seguire gli standard europei.",
                          ],
                        });
                      }
                    }
                  }}
                />
                <ErrorMessage message={errors.iban} />
              </div>
              <div className="flex flex-col space-y-3 mb-5">
                <Label
                  htmlFor="website"
                  className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/90 flex items-center gap-1.5"
                >
                  <Code className="w-3.5 h-3.5 text-primary/80" />
                  Sito Web
                </Label>
                <Input
                  id="website"
                  placeholder="www.website.it"
                  onChange={(e) =>
                    setWebsite(e.target.value === "" ? null : e.target.value)
                  }
                />
                <ErrorMessage message={errors.website} />
              </div>
            </div>
          ) : null}
        </Step>
      </Stepper>
    </>
  );
}
