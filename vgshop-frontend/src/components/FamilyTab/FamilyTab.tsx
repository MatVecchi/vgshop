import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Link, Users, Copy, Plus, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import useSWR from "swr";
import api from "@/lib/api";
import copy from "copy-to-clipboard";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "../ui/input-group";
import { useRef } from "react";

export default function FamilyTab() {
  const { data, error, isLoading, mutate } = useSWR("/api/family/dashboard/", {
    keepPreviousData: true,
  });
  const { data: user } = useSWR("/api/username/");
  const { data: members, mutate: mutateMembers } = useSWR(
    "/api/family/members/",
  );
  const codeRef = useRef<HTMLInputElement>(null);

  if (isLoading) {
    return <div>Caricamento...</div>;
  }

  if (error) {
    return <div>Errore nel caricamento dei dati</div>;
  }

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Users />
          Famiglia
        </CardTitle>
        <CardDescription>La tua pagina per gestire la famiglia</CardDescription>
      </CardHeader>
      <CardContent>
        {!data || data?.length === 0 ? (
          <div className="flex flex-col gap-2">
            <InputGroup>
              <InputGroupInput
                ref={codeRef}
                placeholder="Inserisci il codice della famiglia a cui vuoi unirti"
              />
              <InputGroupAddon align="inline-end">
                <InputGroupButton
                  onClick={async () => {
                    if (codeRef.current?.value) {
                      try {
                        await api.put(
                          `/api/family/join/${codeRef.current!.value}/`,
                        );
                        mutate();
                        mutateMembers();
                      } catch (err) {
                        toast.error("Famiglia non trovata");
                      }
                    }
                  }}
                  size="icon-xs"
                  className="my-auto"
                >
                  <Link />
                </InputGroupButton>
              </InputGroupAddon>
            </InputGroup>
            <p>oppure</p>
            <Button
              onClick={async () => {
                await api.post("/api/family/dashboard/");
                mutate();
                mutateMembers();
              }}
            >
              <Plus />
              Creane una
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-1">
              <p className="text-2xl uppercase">
                Codice famiglia:{" "}
                <span className="font-bold">{data![0].code}</span>
              </p>
              <Button
                variant="secondary"
                className="hover:cursor-pointer"
                onClick={() => {
                  copy(data![0].code);
                  toast.message("Codice copiato!");
                }}
              >
                <Copy />
              </Button>
              {user.username === data![0].manager?.username ? (
                <Button
                  className="ml-auto hover:cursor-pointer"
                  variant="destructive"
                  onClick={async () => {
                    await api.delete(`/api/family/dashboard/${data![0].id}/`);
                    mutate();
                    mutateMembers();
                  }}
                >
                  Sciogli famiglia
                </Button>
              ) : (
                <Button
                  className="ml-auto hover:cursor-pointer"
                  variant="destructive"
                  onClick={async () => {
                    await api.delete(`/api/family/leave/`);
                    mutate();
                    mutateMembers();
                  }}
                >
                  Lascia famiglia
                </Button>
              )}
            </div>
            <Separator />
            <div className="min-h-20 flex flex-col gap-3 justify-center items-center">
              {members?.length > 0 ? (
                members.map((member) => {
                  return (
                    <div
                      key={member.id}
                      className="w-full flex items-center gap-2"
                    >
                      <Avatar>
                        <AvatarImage src={member.profile_image} />
                        <AvatarFallback>
                          {member.username.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      {member.username === user.username ? (
                        <span className="font-bold uppercase">Tu</span>
                      ) : (
                        <span>{member.username}</span>
                      )}
                      {data![0].manager?.username === member.username && (
                        <Badge className="ml-auto" variant="default">
                          <Crown data-icon="inline-start" />
                          Amministratore
                        </Badge>
                      )}
                    </div>
                  );
                })
              ) : (
                <Empty className="border border-dashed">
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <Users />
                    </EmptyMedia>
                    <EmptyTitle>Nessun membro</EmptyTitle>
                    <EmptyDescription>
                      Invia il codice famiglia ai tuoi amici, così potranno
                      unirsi (massimo 5 membri)
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
