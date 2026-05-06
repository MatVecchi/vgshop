import { useState } from "react";
import { format, startOfMonth } from "date-fns";
import { ChevronDownIcon, CreditCard as CardIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
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

export function CreditCardRegister() {
  const [name, setName] = useState<string>("");
  const [number, setNumber] = useState<string>("");
  const [exprDate, setExprDate] = useState<Date | undefined>(new Date());
  const [submitLoading, setSubmitLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<Record<string, string[]>>(
    {},
  );
  const { mutate: mutateCardList } = useSWRConfig();

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setSubmitLoading(true);
    setErrorMessage({});
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("number", number);
      formData.append(
        "expiration_date",
        exprDate ? format(exprDate, "yyyy-MM-dd") : "",
      );

      const response = await api.post("/credit_cards/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Carta registrata con successo !");
      mutateCardList("/credit_cards/");
      window.location.href = "/account/";
    } catch (e: any) {
      if (e.response && e.response.data) {
        if (e.response.data.message) {
          toast.error(e.response.data.message[0]);
        } else {
          setErrorMessage(e.response.data);
        }
      } else {
        toast.error("Errore nella registrazione! riprova");
      }
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant={"secondary"} className="hover:cursor-pointer">
          Registra Carta
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-125! p-6">
        <DialogHeader>
          <DialogTitle>Registrazione carta di credito</DialogTitle>
          <DialogDescription>
            Inserisci i dettagli per registrare la tua carta in modo sicuro.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="relative overflow-hidden border-none bg-gradient-to-br! from-indigo-600! via-purple-600! to-pink-500! text-white! shadow-none!">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-8">
                <div className="w-12 h-9 bg-yellow-400/30 rounded-md border border-yellow-200/20" />
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
              Registra Carta
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
