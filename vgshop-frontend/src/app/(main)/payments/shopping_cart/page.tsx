"use client";

import { SubmitEvent, useEffect, useState } from "react";
import useSWR from "swr";
import { Spinner } from "@/components/ui/spinner";
import CartInfiniteScroller from "@/components/CartInfiniteScroller/CartInfiniteScroller";
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

export default function ShoppingCartDisplay() {
  const [paymentMethod, setPaymentMethod] = useState<string>("C");
  const [isPaymentLoading, setIsPaymentLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const router = useRouter();

  const { error: cartError, isLoading: isLoadingCart } =
    useSWR("/shopping_cart/");

  const handleSubmit = async (e: SubmitEvent) => {
    e.preventDefault();
    setIsPaymentLoading(true);

    try {
      const formData = new FormData();
      formData.append("payment_method", paymentMethod);
      await api.post("payments/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Acquisto completato con successo !");
      router.push("/explore/");
    } catch (e: any) {
      const errorData = e.response?.data;

      if (errorData) {
        const firstKey = Object.keys(errorData)[0];
        const message = Array.isArray(errorData[firstKey])
          ? errorData[firstKey][0]
          : errorData[firstKey];

        setErrorMessage(message);
        toast.error(message);
      } else {
        setErrorMessage("Errore imprevisto dal server");
        toast.error("Errore imprevisto");
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
        <div className="flex-1">
          <h2 className="text-3xl font-bold mb-6">Il tuo carrello</h2>
          <CartInfiniteScroller
            isDialog={false}
            containerHeight="100%"
            cardClassName="h-40 w-full"
          />
        </div>

        <aside className="w-full md:w-[400px]">
          <form onSubmit={handleSubmit}>
            <Card className="sticky top-8 shadow-xl">
              <CardHeader>
                <CardTitle>Dettagli Pagamento</CardTitle>
                <CardDescription>
                  Inserisci i dati della tua carta per procedere.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="card-name">Nome sulla carta</Label>
                  <Input id="card-name" placeholder="Mario Rossi" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="card-number">Numero carta</Label>
                  <Input id="card-number" placeholder="0000 0000 0000 0000" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="expiry">Scadenza</Label>
                    <Input id="expiry" placeholder="MM/YY" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cvc">CVC</Label>
                    <Input id="cvc" placeholder="123" />
                  </div>
                </div>
                <Button className="w-full mt-4">Conferma Pagamento</Button>
              </CardContent>
            </Card>
          </form>
        </aside>
      </div>
    </>
  );
}
