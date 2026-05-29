"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useSWRConfig } from "swr";
import { Button } from "../ui/button";
import { ArrowRightLeft, BanknoteArrowDown, Building2 } from "lucide-react";
import useSWR from "swr";
import { useState } from "react";
import api from "@/lib/api";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Spinner } from "../ui/spinner";

export default function CashBackDialog() {
  const [submitLoading, setSubmitLoading] = useState<boolean>(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<Record<string, string[]>>(
    {},
  );
  const router = useRouter();
  const { mutate: mutateCredit } = useSWRConfig();

  const { data: user, error, isLoading } = useSWR("/api/profile");

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setSubmitLoading(true);
    setErrorMessage({});
    try {
      const response = await api.get("/transactions/wallet/cash_back/");

      toast.success("Ritiro avvenuto con successo !");

      mutateCredit("/transactions/wallet/credit");
      mutateCredit("/transactions/?page=1");
      setIsDialogOpen(false);
      router.push("/account/");
    } catch (e: any) {
      if (e.response && e.response.data) {
        if (e.response.data.message) {
          toast.error(e.response.data.message);
        } else {
          setErrorMessage(e.response.data);
        }
      } else {
        toast.error("Errore nel ritiro! riprova");
      }
    } finally {
      setSubmitLoading(false);
      setIsDialogOpen(false);
    }
  };

  if (!user || !user.piva || error || isLoading) return null;

  return (
    <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant="secondary"
          className="gap-2 font-medium shadow-sm transition-all hover:bg-secondary/80"
        >
          <BanknoteArrowDown className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          Ritira saldo
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent className="max-w-[400px] p-6 rounded-2xl border-muted/60 dark:border-muted/30">
        <AlertDialogHeader className="flex flex-col items-center text-center">
          <div className="relative mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
            <BanknoteArrowDown className="h-7 w-7 animate-pulse" />
            <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-background border shadow-sm">
              <ArrowRightLeft className="h-3 w-3 text-muted-foreground" />
            </span>
          </div>

          <AlertDialogTitle className="text-xl font-semibold tracking-tight text-foreground">
            Conferma il trasferimento
          </AlertDialogTitle>

          <AlertDialogDescription className="text-sm text-muted-foreground pt-1">
            Verifica le coordinate di accredito prima di confermare l'operazione
            di ritiro.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="my-5 rounded-xl border border-muted/80 bg-muted/30 p-4 space-y-3 dark:bg-muted/10">
          <div className="flex items-start gap-3">
            <Building2 className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div className="flex flex-col text-left">
              <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Intestatario / P.IVA
              </span>
              <span className="text-sm font-medium text-foreground mt-0.5">
                {user?.piva || "N/D"}
              </span>
            </div>
          </div>

          <div className="h-[1px] w-full bg-muted/80" />

          <div className="flex items-start gap-3">
            <BanknoteArrowDown className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div className="flex flex-col text-left">
              <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                IBAN di Accredito
              </span>
              <span className="text-xs font-mono font-medium text-foreground tracking-wide mt-1 block select-all break-all">
                {user?.iban || "N/D"}
              </span>
            </div>
          </div>
        </div>

        <AlertDialogFooter className="grid grid-cols-2 gap-3 sm:flex sm:flex-row sm:justify-end mt-2">
          <AlertDialogCancel asChild disabled={submitLoading}>
            <Button variant="outline" className="w-full sm:w-auto rounded-xl">
              Annulla
            </Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            {submitLoading ? (
              <Button
                variant="default"
                className="w-full sm:w-auto rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white shadow-sm dark:bg-emerald-600 dark:hover:bg-emerald-500 font-medium"
              >
                <Spinner />
              </Button>
            ) : (
              <Button
                variant="default"
                className="w-full sm:w-auto rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white shadow-sm dark:bg-emerald-600 dark:hover:bg-emerald-500 font-medium"
                onClick={handleSubmit}
                disabled={submitLoading}
              >
                Invia bonifico
              </Button>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
