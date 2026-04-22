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
    <div>
      <h2 className="uppercase text-2xl">Dettagli dell'account</h2>
      <Tabs className="mt-6" defaultValue="info" orientation="vertical">
        <TabsList>
          <TabsTrigger value="info">Informazioni</TabsTrigger>
          <TabsTrigger value="payments">Pagamenti</TabsTrigger>
          <Button className="mt" type="reset" onClick={handleLogout}>
            Logout
          </Button>
        </TabsList>
        <TabsContent value="info">
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
                <strong>First Name:</strong> {data.first_name}
              </p>
              <Separator />
              <p>
                <strong>Last Name:</strong> {data.last_name}
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
                  <Link
                    className="underline"
                    href={data.website}
                    target="_blank"
                  >
                    {data.website}
                  </Link>
                </p>
              </CardContent>
            </Card>
          ) : null}
        </TabsContent>
        <TabsContent value="payments">
          <h2>Pagamenti</h2>
          <p>Metodi di pagamento registrati:</p>
        </TabsContent>
      </Tabs>
    </div>
  );
}
