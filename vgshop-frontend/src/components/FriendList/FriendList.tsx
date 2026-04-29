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
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { toast } from "sonner";
import { UserPlus, Check, X, MessagesSquare } from "lucide-react";
import api from "@/lib/api";

enum Status {
  PENDING = "P",
  ACCEPTED = "A",
  DECLINED = "D",
}

export default function FriendList() {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [sendingRequest, setSendingRequest] = useState<string | null>(null);
  const [sentRequests, setSentRequests] = useState<Record<string, boolean>>({});
  const [debouncedValue, setDebouncedValue] = useState("");
  const { data, error, mutate } = useSWR(`/api/friends?page=${page}`);
  const { data: friends, error: errFriends } = useSWR(
    debouncedValue ? `/api/friends?search=${debouncedValue}` : null,
  );

  const isSearching = debouncedValue.trim() !== "";
  const displayList = isSearching ? friends : data?.results;
  const isLoadingSearch = isSearching && !friends && !errFriends;

  console.log(data);

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
        <DrawerTrigger asChild>
          <Button variant="outline" className="hover:cursor-pointer">
            <UsersRound />
          </Button>
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
          {isLoadingSearch ? (
            <div className="p-4 text-center">Ricerca in corso...</div>
          ) : displayList && displayList.length === 0 ? (
            <Empty>
              <EmptyHeader>
                <EmptyTitle>
                  {isSearching
                    ? "Nessun utente trovato"
                    : "Non hai nessun amico"}
                </EmptyTitle>
                <EmptyDescription>
                  {isSearching
                    ? "Prova a cercare un altro nome."
                    : "Usa la barra di ricerca per trovare un amico e aggiungerlo."}
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <>
              {displayList?.map((user: any) => (
                <div
                  key={user.id || user.username}
                  className="flex items-center gap-3 p-3 border-b"
                >
                  <Avatar>
                    <AvatarImage src={user?.profile_image} />
                    <AvatarFallback>
                      {user?.username.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <p className="font-semibold">{user.username}</p>
                  {user.status &&
                  user.status === Status.PENDING &&
                  user.is_sender ? (
                    <Button className="ml-auto" disabled variant="outline">
                      Richiesta inviata
                    </Button>
                  ) : user.status &&
                    user.status === Status.PENDING &&
                    !user.is_sender ? (
                    <div className="ml-auto flex items-center gap-2">
                      Richiesta in attesa
                      <Button
                        className="hover:cursor-pointer"
                        onClick={async () => {
                          await api.patch(`/api/friends/${user.username}/`, {
                            status: Status.ACCEPTED,
                          });
                          mutate();
                        }}
                      >
                        <Check />
                      </Button>
                      <Button
                        className="hover:cursor-pointer"
                        variant="destructive"
                        onClick={async () => {
                          await api.delete(`/api/friends/${user.username}/`);
                          mutate();
                        }}
                      >
                        <X />
                      </Button>
                    </div>
                  ) : user.status && user.status === Status.ACCEPTED ? (
                    <>
                      <Button
                        className="ml-auto hover:cursor-pointer"
                        variant="destructive"
                        onClick={async () => {
                          await api.delete(`/api/friends/${user.username}/`);
                          mutate();
                        }}
                      >
                        Rimuovi
                      </Button>
                      <Button className="hover:cursor-pointer">
                        <MessagesSquare />
                      </Button>
                    </>
                  ) : sentRequests[user.username] ? (
                    <Button className="ml-auto" disabled variant="outline">
                      Richiesta inviata
                    </Button>
                  ) : (
                    <Button
                      className="ml-auto hover:cursor-pointer"
                      disabled={sendingRequest === user.username}
                      onClick={async () => {
                        setSendingRequest(user.username);
                        try {
                          const res = await api.post("/api/friends/", {
                            second_friend: user.username,
                          });
                          if (res.status === 201) {
                            toast.success("Richiesta inviata");
                            setSentRequests((prev) => ({
                              ...prev,
                              [user.username]: true,
                            }));
                            mutate();
                          }
                        } finally {
                          setSendingRequest(null);
                        }
                      }}
                    >
                      {sendingRequest === user.username ? (
                        "Invio..."
                      ) : (
                        <UserPlus />
                      )}
                    </Button>
                  )}
                </div>
              ))}
              {!isSearching && data?.count > 0 && (
                <Pagination className="mt-4">
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
                          setPage((page) =>
                            page < data.count ? page + 1 : page,
                          )
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </>
          )}
        </DrawerContent>
      </Drawer>
    </section>
  );
}
