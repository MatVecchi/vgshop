"use client";

import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
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

export function CartShowDialog() {
  const {
    data: cartData,
    error: cartError,
    isLoading: isLoadingCart,
  } = useSWR("/shopping_cart/");

  if (cartError) return <></>;
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
        <DialogHeader>
          <DialogTitle>Il tuo carrello </DialogTitle>
          <CartInfiniteScroller />
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
