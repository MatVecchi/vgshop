"use client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"; // Assicurati di avere questo componente
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
  EmptyTitle,
} from "@/components/ui/empty";
import { Button } from "../ui/button";
import { useState } from "react";
import useSWR from "swr";
import { Spinner } from "../ui/spinner";
import Link from "next/link";
import { Clock } from "lucide-react";

export interface Transaction {
  id: number;
  date: Date;
  movement: number;
}

const TRANSACTION_PER_PAGE = 4;

export default function TransactionList() {
  const [currentPage, setCurrentPage] = useState<number>(1);

  const {
    data: transactions,
    error: transactionError,
    isLoading: isLoadingTransaction,
  } = useSWR(`/transactions/?page=${currentPage}`, { keepPreviousData: true });

  const totalPages = transactions
    ? Math.ceil(transactions.count / TRANSACTION_PER_PAGE)
    : 0;

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
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">
          Cronologia Transazioni <Clock />{" "}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl! max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Cronologia Transazioni</DialogTitle>
          <DialogDescription>
            Elenco di tutte le transazioni di deposito e pagamento
          </DialogDescription>
        </DialogHeader>

        {isLoadingTransaction && (
          <div className="flex justify-center py-10">
            <Spinner />
          </div>
        )}

        {transactionError && transactionError.status !== 404 && (
          <div className="text-center text-red-500 py-10">
            Errore nel caricamento delle transazioni
          </div>
        )}

        {transactionError?.status === 404 ? (
          <Empty>
            <EmptyHeader>
              <EmptyTitle>Nessuna transazione trovata</EmptyTitle>
              <EmptyDescription>
                Acquista almeno un gioco o deposita nel wallet per vedere le
                transazioni qui.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent className="flex-row justify-center gap-2">
              <Link href={"/explore/"}>
                <Button size="sm">Esplora</Button>
              </Link>
            </EmptyContent>
          </Empty>
        ) : totalPages === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyTitle>Non ci sono Transazioni</EmptyTitle>{" "}
              <EmptyDescription>
                Esegui delle operazioni sul saldo VGshop per visualizzare le
                transazioni
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          transactions && (
            <>
              <div className="space-y-3 py-4">
                {transactions.results?.map((trs: Transaction) => (
                  <Card
                    key={trs.id}
                    className="border-zinc-500/30! shadow-none! w-full"
                  >
                    <CardContent className="flex flex-row justify-between items-center py-3 px-4">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                          Transazione
                        </span>
                        <span className="font-bold text-sm">#TRS-{trs.id}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                          Tipo
                        </span>
                        <span className="font-semibold text-sm">
                          {trs.movement <= 0 ? "Pagamento" : "Deposito"}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                          Data
                        </span>
                        <span className="text-sm">
                          {new Date(trs.date).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex flex-col text-right">
                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                          Totale
                        </span>
                        <span
                          className={`font-bold text-base ${
                            trs.movement <= 0
                              ? "text-red-500"
                              : "text-green-500"
                          }`}
                        >
                          € {trs.movement}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {totalPages > 1 && (
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
                              typeof elPage === "number" &&
                              setCurrentPage(elPage)
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
              )}
            </>
          )
        )}
      </DialogContent>
    </Dialog>
  );
}
