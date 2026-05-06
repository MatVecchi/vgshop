import useSWR from "swr";
import { Spinner } from "../ui/spinner";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Field, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "../ui/button";
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
import { useState } from "react";
import api from "@/lib/api";
import { toast } from "sonner";

interface CreditCard {
  id: number;
  encrypted_number: string;
  name: string;
  expiration_date: Date;
}

export default function CreditCardList() {
  const { data: cardList, error, isLoading, mutate } = useSWR("/credit_cards/");
  const [submitLoading, setSubmitLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<Record<string, string[]>>(
    {},
  );

  const handleDelete = async (id: number) => {
    setSubmitLoading(true);
    setErrorMessage({});
    try {
      const response = await api.delete(`/credit_cards/${id}/`);

      toast.success("Carta eliminata con successo !");
      mutate();
    } catch (e: any) {
      if (e.response && e.response.data) {
        if (e.response.data.message) {
          toast.error(e.response.data.message[0]);
        } else {
          setErrorMessage(e.response.data);
        }
      } else {
        toast.error("Errore nella cancellazione! riprova");
      }
    } finally {
      setSubmitLoading(false);
    }
  };

  if (isLoading) return <Spinner />;
  if (error || !cardList) {
    return <> Errore nel caricamento </>;
  }
  if (cardList?.length == 0) {
    return <> Nessuna carta registrata </>;
  }

  return (
    <>
      <div className="flex flex-row gap-5">
        {cardList?.map((card: CreditCard) => (
          <Card
            key={card.id}
            className="border-none bg-gradient-to-br! from-indigo-600! via-purple-600! to-pink-500! text-white! shadow-none! transition-transform hover:scale-105 flex flex-col justify-between"
          >
            <CardHeader className="flex flex-row justify-between items-center pb-2">
              <div className="w-10 h-6 bg-yellow-500/30 rounded"></div>
              <Dialog>
                <form>
                  <DialogTrigger asChild>
                    <Button variant="secondary">Rimuovi</Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-sm!">
                    <DialogHeader>
                      <DialogTitle>Conferma di cancellazione</DialogTitle>
                      <DialogDescription>
                        Sei sicuro di voler cancellare questa carta?
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button variant="outline">Annulla</Button>
                      </DialogClose>
                      {submitLoading ? (
                        <Spinner />
                      ) : (
                        <Button
                          type="submit"
                          onClick={() => handleDelete(card.id)}
                        >
                          Cancella
                        </Button>
                      )}
                    </DialogFooter>
                  </DialogContent>
                </form>
              </Dialog>
            </CardHeader>

            <CardContent className="text-lg font-mono tracking-widest pt-2">
              {card.encrypted_number || "**** **** **** XXXX"}
            </CardContent>

            <CardFooter className="flex justify-between items-end pt-0 text-slate-400">
              <div>
                <p className="text-[10px] uppercase">NOME</p>
                <p className="text-sm text-white truncate">
                  {card.name || "NOME UTENTE"}
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase">SCADENZA</p>
                <p className="text-sm text-white font-mono">
                  {card.expiration_date.toString() || "00/00"}
                </p>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </>
  );
}
