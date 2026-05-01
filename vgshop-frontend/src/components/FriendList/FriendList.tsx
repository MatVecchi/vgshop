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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { UserPlus, Check, X, MessagesSquare, Search } from "lucide-react";
import api from "@/lib/api";
import Chat from "@/components/Chat/Chat";

enum Status {
  PENDING = "P",
  ACCEPTED = "A",
  DECLINED = "D",
}

const USER_PER_PAGE: number = 15;

export default function FriendList() {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [sendingRequest, setSendingRequest] = useState<string | null>(null);
  const [sentRequests, setSentRequests] = useState<Record<string, boolean>>({});
  const [debouncedValue, setDebouncedValue] = useState("");
  const { data, error, mutate, isLoading } = useSWR(
    `/api/friends?page=${page}`,
    {
      keepPreviousData: true,
    },
  );
  const { data: friends, error: errFriends } = useSWR(
    debouncedValue ? `/api/friends?search=${debouncedValue}` : null,
  );

  console.log(isLoading, error);

  const isSearching = debouncedValue.trim() !== "";
  const displayList = isSearching ? friends : data?.results;
  const isLoadingSearch = isSearching && !friends && !errFriends;
  const totalPages = Math.ceil(data?.count / USER_PER_PAGE);

  const calculatePages = () => {
    const pages: Array<number | string> = [];
    const siblingCount = 1;

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= page - siblingCount && i <= page + siblingCount)
      ) {
        pages.push(i);
      } else if (
        i === page - siblingCount - 1 ||
        i === page + siblingCount + 1
      ) {
        pages.push("...");
      }
    }
    return pages.filter(
      (item, index) => item !== "..." || pages[index - 1] !== "...",
    );
  };

  const pageNumbers = calculatePages();

  console.log(data);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(searchTerm);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  if (error) return <></>;
  if (isLoading)
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
              placeholder="Aggiungi un amico..."
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
            <div className="min-h-0 flex-1">
              <div className="max-h-full overflow-y-auto">
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
                    <p className="font-semibold uppercase">{user.username}</p>
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
                        <Chat
                          profile_image={user?.profile_image}
                          username={user!.username}
                        >
                          <MessagesSquare />
                        </Chat>
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
                          isButton
                          text=""
                          onClick={() =>
                            setPage((page) => (page === 1 ? 1 : page - 1))
                          }
                        />
                      </PaginationItem>
                      {pageNumbers.map((elPage, index) => {
                        return (
                          <PaginationItem key={index}>
                            {elPage === "" ? (
                              <PaginationEllipsis />
                            ) : (
                              <PaginationLink
                                isButton
                                disabled={elPage === "..."}
                                onClick={() =>
                                  typeof elPage === "number" && setPage(elPage)
                                }
                                isActive={page === elPage}
                              >
                                {elPage}
                              </PaginationLink>
                            )}
                          </PaginationItem>
                        );
                      })}
                      <PaginationItem>
                        <PaginationNext
                          isButton
                          text=""
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
              </div>
            </div>
          )}
        </DrawerContent>
      </Drawer>
    </section>
  );
}
