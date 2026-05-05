import { Card, CardContent } from "@/components/ui/card";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Button } from "../ui/button";
import { useState } from "react";
import useSWR from "swr";
import { Spinner } from "../ui/spinner";
import Link from "next/link";
import OrderDetail from "../OrderDetail/OrderDetail";
import { Game } from "../GameAddModal/GameAddModal";

export enum Status {
  CARD = "C",
  WALLET = "W",
}

export interface OrderRow {
  id: number;
  game: Game;
}

export interface OrderInfo {
  id: number;
  date: Date;
  payment_method: Status;
  total: number;
  order_items: OrderRow[];
}

const ORDER_PER_PAGE = 5;

export default function OrderList() {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const {
    data: orders,
    error: orderErros,
    isLoading: isLoadingOrder,
  } = useSWR(`/payments/?page=${currentPage}`, { keepPreviousData: true });

  if (orderErros?.status == 404) {
    return (
      <>
        <Empty>
          <EmptyHeader>
            <EmptyTitle>Nessun Ordine trovato</EmptyTitle>
            <EmptyDescription>
              Acquista almeno un gioco per vedere i tuoi ordini qui. Visita il
              nostro catalogo per scoprire i giochi disponibili.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent className="flex-row justify-center gap-2">
            <Link href={"/explore/"}>
              <Button>Esplora</Button>
            </Link>
          </EmptyContent>
        </Empty>
      </>
    );
  }
  if (orderErros) return <div>Errore nel caricamento degli ordini </div>;
  if (isLoadingOrder) return <Spinner />;

  const totalPages = orders ? Math.ceil(orders.count / ORDER_PER_PAGE) : 0;

  const calculatePages = () => {
    const pages: Array<number | string> = [];
    const siblingCount = 1;

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - siblingCount && i <= currentPage + siblingCount)
      ) {
        pages.push(i);
      } else if (
        i === currentPage - siblingCount - 1 ||
        i === currentPage + siblingCount + 1
      ) {
        pages.push("...");
      }
    }
    return pages.filter(
      (item, index) => item !== "..." || pages[index - 1] !== "...",
    );
  };

  const pageNumbers = calculatePages();

  return (
    <>
      {/* Lista delle Card */}
      <div className="space-y-2">
        {orders.results.map((order: OrderInfo, index: number) => (
          <Card
            key={index}
            className="border-zinc-500! shadow-none! w-[90%] mx-auto"
          >
            <CardContent className="flex flex-row justify-between items-center py-1 px-4">
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground uppercase tracking-wider">
                  Ordine
                </span>
                <span className="font-bold">#ORD-{order.id}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground uppercase tracking-wider">
                  Data
                </span>
                <span className="font-medium">
                  {new Date(order.date).toLocaleDateString()}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground uppercase tracking-wider">
                  Tipo di pagamento
                </span>
                <span className="font-medium">
                  {order.payment_method == "C" ? "Carta" : "Deposito Wallet"}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground uppercase tracking-wider">
                  Numero articoli
                </span>
                <span className="font-medium">{order.order_items?.length}</span>
              </div>
              <div className="flex flex-col text-right">
                <span className="text-xs text-muted-foreground uppercase tracking-wider">
                  Totale
                </span>
                <span className="font-bold text-lg">€ {order.total}</span>
              </div>
              <div className="flex flex-col text-right">
                <OrderDetail id={order.id} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Pagination className="mt-4">
        <PaginationContent>
          {currentPage > 1 && (
            <PaginationItem>
              <PaginationPrevious
                isButton
                text=""
                onClick={() => setCurrentPage((page) => page - 1)}
              />
            </PaginationItem>
          )}

          {pageNumbers.map((elPage, index) => (
            <PaginationItem key={index}>
              {elPage === "..." ? (
                <PaginationEllipsis />
              ) : (
                <PaginationLink
                  isButton
                  disabled={elPage === "..."}
                  onClick={() =>
                    typeof elPage === "number" && setCurrentPage(elPage)
                  }
                  isActive={currentPage === elPage}
                >
                  {elPage}
                </PaginationLink>
              )}
            </PaginationItem>
          ))}

          {currentPage < totalPages && (
            <PaginationItem>
              <PaginationNext
                isButton
                text=""
                onClick={() => setCurrentPage((page) => page + 1)}
              />
            </PaginationItem>
          )}
        </PaginationContent>
      </Pagination>
    </>
  );
}
