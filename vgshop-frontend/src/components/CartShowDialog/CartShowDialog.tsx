"use client";

import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { Separator } from "../ui/separator";
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
import useSWR from "swr";
import { Spinner } from "../ui/spinner";
import CartInfiniteScroller from "../CartInfiniteScroller/CartInfiniteScroller";
import Link from "next/link";

export function CartShowDialog() {
  //serve per verificare l'auth e customer
  const {
    data: cartData,
    error: cartError,
    isLoading: isLoadingCart,
  } = useSWR("/shopping_cart/?page=1");

  if (cartError) return <></>;
  const isCartEmpty =
    !cartData || (cartData.results && cartData.results.length === 0);
  if (isLoadingCart)
    return (
      <Button variant="outline" className="hover:cursor-pointer">
        <ShoppingCart />
      </Button>
    );

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="hover:cursor-pointer">
          <ShoppingCart />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogDescription></DialogDescription>
        <DialogHeader>
          <DialogTitle className="text-3xl p-2 flex items-center gap-2">
            {" "}
            <ShoppingCart /> Il tuo carrello{" "}
          </DialogTitle>
          <CartInfiniteScroller />

          {!isCartEmpty && (
            <DialogClose asChild className="flex items-center justify-between">
              <Link href="/payments/shopping_cart/">
                <Button className="group transition-all hover:scale-105 shadow-lg shadow-primary/20 mt-3">
                  <ShoppingCart className="w-5 h-5 transition-transform group-hover:-translate-y-1" />
                  Checkout
                </Button>
              </Link>
            </DialogClose>
          )}
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
