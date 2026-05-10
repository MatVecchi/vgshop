"use client";

import { useState } from "react";
import { format, startOfMonth } from "date-fns";
import { ChevronDownIcon, CreditCard as CardIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CreditCardIcon } from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import api from "@/lib/api";
import { toast } from "sonner";
import { mutate } from "swr";
import { useSWRConfig } from "swr";
import { useRouter } from "next/navigation";
import { Spinner } from "../ui/spinner";
import { CreditCard } from "@/components/CreditCardList/CreditCardList";
import useSWR from "swr";
import { useRef } from "react";

export function DepositDialog() {
  const [name, setName] = useState<string>("");
  const [number, setNumber] = useState<string>("");
  const [depositValue, setDepositValue] = useState<number>(0);
  const [cvv, setCvv] = useState<string>("");
  const [exprDate, setExprDate] = useState<Date | undefined>(new Date());
  const [submitLoading, setSubmitLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<Record<string, string[]>>(
    {},
  );
  const { mutate: mutateCredit } = useSWRConfig();
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCardId, setSelectedCardId] = useState<string | undefined>(
    undefined,
  );
  const isAutoCompleting = useRef(false);

  const {
    data: cardsList,
    error: cardsError,
    isLoading: isLoadingCards,
  } = useSWR("/credit_cards/");

  const handleCardSelect = (id: string) => {
    const selectedCard: CreditCard = cardsList.find(
      (card: CreditCard) => card.id.toString() === id,
    );

    if (selectedCard != undefined) {
      isAutoCompleting.current = true;
      setNumber(selectedCard.number);
      setName(selectedCard.name);
      setExprDate(selectedCard.expiration_date);
    }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setSubmitLoading(true);
    setErrorMessage({});
    try {
      const formData = new FormData();
      formData.append("deposit", depositValue.toString());
      formData.append("name", name);
      formData.append("number", number);
      formData.append(
        "expiration_date",
        exprDate ? format(exprDate, "yyyy-MM-dd") : "",
      );
      formData.append("cvv", cvv);

      const response = await api.post("/transactions/deposit", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Deposito avvenuto con successo !");
      mutateCredit("/transactions/wallet/credit");
      setIsDialogOpen(false);
      router.push("/account/");
    } catch (e: any) {
      if (e.response && e.response.data) {
        if (e.response.data.message) {
          toast.error(e.response.data.message[0]);
        } else {
          setErrorMessage(e.response.data);
        }
      } else {
        toast.error("Errore nel deposito! riprova");
      }
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant={"secondary"} className="w-full hover:cursor-pointer">
          Ricarica credito <CreditCardIcon className="ml-1" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-125! p-6">
        <DialogHeader>
          <DialogTitle>Ricarica del credito</DialogTitle>
          <DialogDescription>
            Inserisci la carta e l'importo di quanto vuoi ricaricare.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-1 mb-6">
            <Label
              htmlFor="number"
              className="text-[10px] uppercase tracking-tighter opacity-70"
            >
              Quanto vuoi depositare ?
            </Label>
            <Input
              id="deposit"
              type="number"
              value={depositValue === 0 ? "" : depositValue}
              onChange={(e) => {
                const val = e.target.valueAsNumber;

                // Se l'utente cancella tutto, val è NaN. Lo resettiamo a 0.
                if (isNaN(val)) {
                  setDepositValue(0);
                  return;
                }

                setDepositValue(Math.max(0, val));
              }}
              placeholder="0"
              className="bg-white/10 border-white/20 text-white font-mono text-lg"
            />
            {errorMessage.deposit && (
              <p className="text-sm text-red-500 text-destructive-foreground">
                {errorMessage.deposit[0]}
              </p>
            )}
          </div>
          <Card className="relative overflow-hidden border-none bg-gradient-to-br! from-indigo-600! via-purple-600! to-pink-500! text-white! shadow-none!">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-8">
                <div className="w-12 h-9 bg-yellow-400/30 rounded-md border border-yellow-200/20" />
                <div>
                  <Label
                    htmlFor="cvv"
                    className="text-[10px] uppercase tracking-tighter opacity-70"
                  >
                    CVV
                  </Label>
                  <Input
                    id="cvv"
                    placeholder="XXX"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/40 font-mono text-lg tracking-widest focus-visible:ring-white/30 h-11"
                    maxLength={3}
                  />
                  {errorMessage.cvv && (
                    <p className="text-sm text-red-500 text-destructive-foreground">
                      {errorMessage.cvv[0]}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-1 mb-6">
                <Label
                  htmlFor="number"
                  className="text-[10px] uppercase tracking-tighter opacity-70"
                >
                  NUMERO
                </Label>
                <Input
                  id="number"
                  placeholder="0000 0000 0000 0000"
                  value={number}
                  onChange={(e) => setNumber(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/40 font-mono text-lg tracking-widest focus-visible:ring-white/30 h-11"
                  maxLength={19}
                />
                {errorMessage.number && (
                  <p className="text-sm text-red-500 text-destructive-foreground">
                    {errorMessage.number[0]}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2 space-y-1">
                  <Label
                    htmlFor="name"
                    className="text-[10px] uppercase tracking-tighter opacity-70"
                  >
                    NOME
                  </Label>
                  <Input
                    id="name"
                    placeholder="MARIO ROSSI"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/40 uppercase text-xs focus-visible:ring-white/30"
                  />
                  {errorMessage.name && (
                    <p className="text-sm text-red-500 text-destructive-foreground">
                      {errorMessage.name[0]}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <Label className="text-[10px] uppercase tracking-tighter opacity-70">
                    SCADENZA
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white flex justify-between px-2 text-xs",
                          !exprDate && "text-white/40",
                        )}
                      >
                        {exprDate ? format(exprDate, "MM/yy") : "MM/YY"}
                        <ChevronDownIcon className="h-3 w-3 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="end">
                      <Calendar
                        mode="single"
                        selected={exprDate}
                        onSelect={(date) => {
                          if (date) {
                            setExprDate(startOfMonth(date));
                          }
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                {errorMessage.expiration_date && (
                  <p className="text-sm text-red-500 w-full text-destructive-foreground">
                    {errorMessage.expiration_date[0]}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {isLoadingCards ? (
            <Spinner />
          ) : cardsError ? (
            "Errore nel caricamento delle carte"
          ) : cardsList?.length === 0 ? (
            "Non hai care salvate"
          ) : (
            <Select
              value={selectedCardId || ""}
              onValueChange={handleCardSelect}
              key={selectedCardId || "reset-select"}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Seleziona una carta esistente" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {cardsList.map((card: CreditCard) => {
                    return (
                      <SelectItem key={card.id} value={card.id.toString()}>
                        **** **** *{card.number.slice(13)}
                      </SelectItem>
                    );
                  })}
                </SelectGroup>
              </SelectContent>
            </Select>
          )}

          <DialogFooter className="sm:justify-between flex-row gap-2">
            <DialogClose asChild>
              <Button type="button" variant="ghost" className="flex-1">
                Annulla
              </Button>
            </DialogClose>
            <Button
              type="submit"
              className="flex-1 bg-indigo-600 hover:bg-indigo-700"
            >
              {submitLoading ? <Spinner /> : "Ricarica"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
