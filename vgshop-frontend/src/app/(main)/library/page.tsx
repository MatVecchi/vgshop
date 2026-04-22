import { ArrowUpRightIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

export default function Library() {
  return (
    <div className="flex-1">
      <h2 className="uppercase text-4xl font-bold">I tuoi giochi</h2>
      <Empty>
        <EmptyHeader>
          <EmptyTitle>Non hai nessun gioco nella tua libreria</EmptyTitle>
          <EmptyDescription>
            Acquista un gioco per vederlo qui. Visita il nostro catalogo per
            scoprire i giochi disponibili.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent className="flex-row justify-center gap-2">
          <Button>Create Project</Button>
        </EmptyContent>
      </Empty>
    </div>
  );
}
