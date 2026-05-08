"use client";

import { SubmitEvent, useEffect, useState } from "react";
import useSWR, { mutate } from "swr";
import { Spinner } from "@/components/ui/spinner";
import CartInfiniteScroller from "@/components/CartInfiniteScroller/CartInfiniteScroller";
import { format, startOfMonth } from "date-fns";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronDownIcon, CreditCard as CardIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

export default function ShoppingCartDisplay() {
  const [paymentMethod, setPaymentMethod] = useState<string>("C");
  const [isPaymentLoading, setIsPaymentLoading] = useState<boolean>(false);
  const [name, setName] = useState<string>("");
  const [number, setNumber] = useState<string>("");
  const [exprDate, setExprDate] = useState<Date | undefined>(new Date());
  const [cardId, setCardId] = useState<string>("");
  const [cvv, setCvv] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<Record<string, string[]>>(
    {},
  );
  const router = useRouter();

  const { error: cartError, isLoading: isLoadingCart } =
    useSWR("/shopping_cart/");

  const {
    data: creditValue,
    error: creditError,
    isLoading: isLoadingCredit,
  } = useSWR("/transactions/wallet/credit");

  const handleSubmit = async (e: SubmitEvent) => {
    e.preventDefault();
    setIsPaymentLoading(true);

    try {
      const formData = new FormData();

      if (paymentMethod != "C" && paymentMethod != "W") {
        toast.error("Metodo di pagamento non valido !");
        return;
      }

      formData.append("payment_method", paymentMethod);

      if (paymentMethod === "C") {
        formData.append("name", name);
        formData.append("number", number);
        formData.append(
          "expiration_date",
          exprDate ? format(exprDate, "yyyy-MM-dd") : "",
        );
        formData.append("cvv", cvv);
      }

      await api.post("payments/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      await mutate("/library/list_titles");
      await mutate("/shopping_cart/");
      toast.success("Acquisto completato con successo !");
      router.push("/explore/");
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
      setIsPaymentLoading(false);
    }
  };

  useEffect(() => {
    if (cartError) {
      router.push("/forbidden");
    }
  }, [cartError, router]);

  if (isLoadingCart) {
    return (
      <div className="flex justify-center items-center p-10">
        <Spinner />
      </div>
    );
  }

  if (cartError) return null;

  return (
    <>
      <h2 className="uppercase text-4xl font-bold">Riepilogo di pagamento</h2>
      <div className="container mx-auto p-4 md:p-8 flex flex-col md:flex-row gap-8">
        <div className="flex-1 max-h-110">
          <h2 className="text-3xl font-bold mb-6">Il tuo carrello</h2>
          <CartInfiniteScroller
            isDialog={false}
            containerHeight="100%"
            cardClassName="h-40 w-[90%]"
          />
        </div>

        <aside className="w-full md:w-110">
          <form onSubmit={handleSubmit}>
            <Card className="sticky top-8 shadow-xl">
              <CardHeader>
                <CardTitle>Dettagli Pagamento</CardTitle>
                <CardDescription>
                  {paymentMethod === "C"
                    ? "Inserisci i dati della tua carta per procedere."
                    : "Paga dal tuo deposito Wallet VGSHOP"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs
                  defaultValue="C"
                  value={paymentMethod}
                  onValueChange={setPaymentMethod}
                >
                  <TabsList className="grid w-full py-0! grid-cols-2">
                    <TabsTrigger value="C">Carta di Credito</TabsTrigger>
                    <TabsTrigger value="W">Wallet VGSHOP</TabsTrigger>
                  </TabsList>

                  {/* Form Carta */}
                  <TabsContent value="C" className="space-y-4 pt-4">
                    <Card className="relative overflow-hidden border-none bg-gradient-to-br! from-indigo-600! via-purple-600! to-pink-500! text-white! shadow-none!">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-center mb-8">
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
                                  {exprDate
                                    ? format(exprDate, "MM/yy")
                                    : "MM/YY"}
                                  <ChevronDownIcon className="h-3 w-3 opacity-50" />
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent
                                className="w-auto p-0"
                                align="end"
                              >
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
                  </TabsContent>

                  <TabsContent value="W" className="space-y-4 pt-4">
                    <div className="p-4 border rounded-md bg-muted/50 flex flex-col gap-2">
                      <span className="text-sm text-muted-foreground">
                        Saldo disponibile:
                      </span>
                      <span className="text-4xl font-bold">
                        {isLoadingCredit ? (
                          <Spinner />
                        ) : (
                          creditValue?.credit.toFixed(2) || 0.0
                        )}{" "}
                        €
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Il pagamento verrà scalato direttamente dal tuo saldo
                      Wallet.
                    </p>
                  </TabsContent>
                </Tabs>

                {/* Bottone di conferma fuori dai Tabs */}
                <Button
                  type="submit"
                  className="w-full mt-6"
                  disabled={isPaymentLoading}
                >
                  {isPaymentLoading ? "Elaborazione..." : "Conferma Pagamento"}
                </Button>
              </CardContent>
            </Card>
          </form>
        </aside>
      </div>
    </>
  );
}
