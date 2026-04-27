"use client";
import { Button } from "@/components/ui/button";
import useSWR from "swr";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

import { Search } from "lucide-react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";

import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

import { UsersRound } from "lucide-react";
import { useEffect, useState } from "react";

export default function FriendList() {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedValue, setDebouncedValue] = useState("");
  const { data, error } = useSWR(`/api/friends?page=${page}`);
  const { data: friends, error: errFriends } = useSWR(
    `/api/friends/?=${debouncedValue}`,
  );

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(searchTerm);
    }, 500); // Ritardo in millisecondi

    return () => {
      clearTimeout(handler); // Cancella il timer se l'utente digita di nuovo prima dei 500ms
    };
  }, [searchTerm]);

  useEffect(() => {
    if (debouncedValue) {
      console.log("Eseguo ricerca per:", debouncedValue);
      // Qui chiami la tua API o effettui il filtro
    }
  }, [debouncedValue]);

  if (error)
    return (
      <Button variant="outline" className="hover:cursor-pointer">
        <UsersRound />
      </Button>
    );
  if (!data)
    return (
      <Button variant="outline" className="hover:cursor-pointer">
        <UsersRound />
      </Button>
    );

  return (
    <section id="friends">
      <Drawer direction="right">
        <DrawerTrigger className="hover:cursor-pointer">
          <UsersRound />
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Amici</DrawerTitle>
            <DrawerDescription>Ecco qui i tuoi amici</DrawerDescription>
          </DrawerHeader>
          <InputGroup className="max-w-xs">
            <InputGroupInput
              placeholder="Cerca un amico..."
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <InputGroupAddon>
              <Search />
            </InputGroupAddon>
          </InputGroup>
          {data.results.length === 0 ? (
            <Empty>
              <EmptyHeader>
                <EmptyTitle>Non hai nessun amico</EmptyTitle>
                <EmptyDescription>
                  Usa la barra di ricerca per trovare un amico e aggiungerlo.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <>
              {data.results.map((friend: any) => (
                <div key={friend.id}>
                  <p>{friend.first_name}</p>
                  <p>{friend.last_name}</p>
                  <p>{friend.email}</p>
                </div>
              ))}
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      text=""
                      href="#"
                      onClick={() =>
                        setPage((page) => (page === 1 ? 1 : page - 1))
                      }
                    />
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink
                      isActive={page === 1}
                      onClick={() =>
                        setPage((page) => (page === 1 ? 1 : page - 1))
                      }
                    >
                      {page === 1 ? 1 : page - 1}
                    </PaginationLink>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink
                      isActive={page > 1}
                      onClick={() => setPage((page) => (page > 1 ? page : 2))}
                    >
                      {page > 1 ? page : 2}
                    </PaginationLink>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink
                      isActive={page === data.count}
                      onClick={() =>
                        setPage((page) =>
                          page === data.count
                            ? page
                            : page === 1
                              ? 3
                              : page + 1,
                        )
                      }
                    >
                      {page === data.count ? page : page === 1 ? 3 : page + 1}
                    </PaginationLink>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationNext
                      text=""
                      href="#"
                      onClick={() =>
                        setPage((page) => (page < data.count ? page + 1 : page))
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>{" "}
            </>
          )}
        </DrawerContent>
      </Drawer>
    </section>
  );
}
