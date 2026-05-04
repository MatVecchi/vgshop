import useSWR from "swr";
import { Spinner } from "../ui/spinner";
import { Game } from "../GameAddModal/GameAddModal";
import { Status } from "../OrderList/OrderList";
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
import { Button } from "../ui/button";
import { BoxIcon } from "lucide-react";
import Link from "next/link";
import { Virtuoso } from "react-virtuoso";
import { Card } from "../ui/card";
import Image from "next/image";
import { Gamepad2, Tag } from "lucide-react";
import { Separator } from "../ui/separator";
import { OrderInfo, OrderRow } from "../OrderList/OrderList";

interface Props {
  id: number;
}

export default function OrderDetail({ id }: Props) {
  const {
    data: orderDetail,
    error: orderErros,
    isLoading: isLoadingOrder,
  } = useSWR(`/payments/${id}/`);

  console.log(orderDetail);

  if (orderErros?.status == 404) {
    return <div> Ordine non trovato </div>;
  }
  if (orderErros) return <div>Errore nel caricamento degli ordini </div>;
  if (isLoadingOrder) return <Spinner />;

  const order: OrderInfo = orderDetail;

  return (
    <>
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" className="hover:cursor-pointer">
            Dettagli
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <BoxIcon className="w-6 h-6" />
              Ordine #ORD-{order.id}
            </DialogTitle>

            <DialogDescription asChild className="space-y-4 pt-4">
              <div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                      Data
                    </span>
                    <span className="font-medium text-foreground">
                      {new Date(order.date).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                      Pagamento
                    </span>
                    <span className="font-medium text-foreground">
                      {order.payment_method === "C"
                        ? "Carta"
                        : "Deposito Wallet"}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col bg-muted/50 p-3 rounded-md">
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                    Totale pagato
                  </span>
                  <span className="text-2xl font-bold text-primary">
                    € {order.total.toFixed(2)}
                  </span>
                </div>
              </div>
            </DialogDescription>
          </DialogHeader>

          <Separator className="my-1" />

          <div className="h-75 w-full overflow-hidden">
            <span className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
              Dettagli ordine:
            </span>
            <Virtuoso
              data={order.order_items}
              itemContent={(index, item) => (
                <Card
                  key={item.id}
                  className="flex my-2 mx-1 flex-row items-center p-3 gap-3  shadow-none! border-zinc-800!"
                >
                  <div className="relative w-16 h-16 shrink-0 overflow-hidden rounded-md border">
                    <Image
                      src={item.game.cover}
                      alt={item.game.title}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  </div>

                  <div className="flex flex-col justify-center grow overflow-hidden">
                    <h3 className="font-bold truncate text-sm">
                      {item.game.title}
                    </h3>
                    <div className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                      <span>Publisher: {item.game.publisher}</span>
                    </div>
                  </div>

                  <div className="font-bold text-sm text-primary">
                    € {item.game.price}
                  </div>
                </Card>
              )}
            />
          </div>

          <DialogFooter>
            {order.order_items?.length === 0 && (
              <DialogClose asChild>
                <Link href="/payments/shopping_cart/">
                  <Button className="w-full">
                    <BoxIcon className="w-4 h-4 mr-2" />
                    Checkout
                  </Button>
                </Link>
              </DialogClose>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
