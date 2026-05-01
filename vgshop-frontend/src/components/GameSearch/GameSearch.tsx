import { SearchIcon } from "lucide-react";

import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";

export function GameSearch() {
  const [title, setTitle] = useState<string>("");

  const router = useRouter();

  const search = (title: string) => {
    const URLparams = new URLSearchParams();
    if (title && title !== "") {
      URLparams.append("search", title);
    }
    router.push(`/explore/filter_result?${URLparams.toString()}`);
  };

  useEffect(() => {
    if (title.trim() === "") return;

    const handler = setTimeout(() => {
      search(title);
    }, 500); // timer che setta il valore di timerTitle ogni 500ms dopo che l'utente ha cambiato il termine di ricerca

    return () => {
      clearTimeout(handler); // Cancella il timer se l'utente digita di nuovo prima dei 500ms
    };
  }, [title]);

  const handleSubmit = (e: React.SubmitEvent) => {
    e.preventDefault();
    search(title);
  };

  return (
    <form onSubmit={handleSubmit} className="flex gp-6">
      <Field className="max-w-max">
        <InputGroup>
          <InputGroupInput
            id="title"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
            }}
            placeholder="Search..."
          />
          <InputGroupAddon align="inline-start">
            <SearchIcon className="text-muted-foreground" />
          </InputGroupAddon>
        </InputGroup>
      </Field>
      <Button type="submit">Cerca</Button>
    </form>
  );
}
