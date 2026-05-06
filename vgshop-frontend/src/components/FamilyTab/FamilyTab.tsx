import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Users } from "lucide-react";
import useSWR from "swr";

export default function FamilyTab() {
  const { data, error, isLoading } = useSWR("/api/family/");

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
      <CardContent></CardContent>
    </Card>
  );
}
