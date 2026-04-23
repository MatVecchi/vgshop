"use client";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import useSWR from "swr";
import Link from "next/dist/client/link";
import { Separator } from "@/components/ui/separator";

export default function Account() {
  const { data, error, mutate } = useSWR("/api/profile/");
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const response = await api.get("/api/logout/");
      mutate(null, { revalidate: false });
      toast.success(response.data.message);
      toast.success("Logout Successful !");
      router.push("/");
      router.refresh();
    } catch (e) {
      toast.error("Something went wrong !");
      console.log(e);
    }
  };

  if (error) return <div>Failed to load account details</div>;
  if (!data) return <div>Loading...</div>;

  return (
    <div className="h-full flex flex-col">
      <h2 className="uppercase text-4xl font-bold">Dettagli dell'account</h2>
      <Tabs className="mt-6 flex-1" defaultValue="info" orientation="vertical">
        <TabsList className="h-auto! max-h-96">
          <TabsTrigger className="hover:cursor-pointer" value="info">
            Informazioni
          </TabsTrigger>
          <TabsTrigger className="hover:cursor-pointer" value="payments">
            Pagamenti
          </TabsTrigger>
          {data.piva ? (
            <></>
          ) : (
            <TabsTrigger className="hover:cursor-pointer" value="orders">
              Ordini
            </TabsTrigger>
          )}
          <Button
            className="mt-auto w-full hover:cursor-pointer"
            variant="destructive"
            onClick={handleLogout}
          >
            Logout
          </Button>
        </TabsList>
        <TabsContent value="info" className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Informazioni dell'account</CardTitle>
              <CardDescription>
                Dati personali e dettagli dell'account dell'utente
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <p>
                <strong>Username:</strong> {data.username}
              </p>
              <Separator />
              <p>
                <strong>Email:</strong> {data.email}
              </p>
              <Separator />
              <p>
                <strong>Nome:</strong> {data.first_name}
              </p>
              <Separator />
              <p>
                <strong>Cognome:</strong> {data.last_name}
              </p>
            </CardContent>
          </Card>
          {data.piva ? (
            <Card>
              <CardHeader>
                <CardTitle>Informazioni Publisher</CardTitle>
                <CardDescription>
                  Informazioni riservate agli account publisher
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <p>
                  <strong>Partita IVA:</strong> {data.piva}
                </p>
                <Separator />
                <p>
                  <strong>Sito web:</strong>{" "}
                  <Button className="p-0" variant="link" asChild>
                    <Link href={data.website} target="_blank">
                      {data.website}
                    </Link>
                  </Button>
                </p>
              </CardContent>
            </Card>
          ) : (
            <></>
          )}
        </TabsContent>
        <TabsContent value="payments" className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Saldo VGSHOP</CardTitle>
              <CardDescription>Gestisci il tuo saldo VGSHOP</CardDescription>
            </CardHeader>
            <CardContent className="flex">
              <p className="text-5xl font-medium">
                {data.balance?.toFixed(2) || "0.00"} €
              </p>
              <div className="ml-auto flex flex-col gap-2">
                <Button className="w-full hover:cursor-pointer">
                  Ricarica saldo
                </Button>
                <Button variant={"secondary"} className="hover:cursor-pointer">
                  Cronologia transazioni
                </Button>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Metodi di pagamento</CardTitle>
              <CardDescription>
                Gestisci i tuoi metodi di pagamento
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Mastercard</p>
            </CardContent>
          </Card>
        </TabsContent>
        {data.piva ? (
          <></>
        ) : (
          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>Ordini</CardTitle>
                <CardDescription>
                  Visualizza e gestisci i tuoi ordini
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>Non hai effettuato ordini recenti.</p>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
