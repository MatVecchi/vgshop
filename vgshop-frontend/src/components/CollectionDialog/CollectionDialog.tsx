import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useEffect, useRef, useState } from "react";
import { Plus } from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";
import { Separator } from "../ui/separator";
import { DialogClose, DialogFooter } from "../ui/dialog";

type CollectionDialogProps = {
  title: string;
  ownCollection: string;
  collections: string[];
  onCollectionChanged?: (newCollection: string) => void;
};

export default function CollectionDialog({
  title,
  ownCollection,
  collections,
  onCollectionChanged,
}: CollectionDialogProps) {
  const [newCollection, setNewCollection] = useState<boolean>(false);
  const [inputValue, setInputValue] = useState<string>("");
  const [formValue, setFormValue] = useState<string>(ownCollection);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (newCollection && inputRef.current) {
      inputRef.current.focus();
    }
  }, [newCollection]);
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        const finalValue = newCollection ? inputValue.trim() : formValue;

        if (newCollection && !finalValue) {
          toast.error("Il nome della collezione non può essere vuoto.");
          return;
        }

        const result = await api.patch(`/library/${title}/`, {
          collection: finalValue === "__none__" ? null : finalValue,
        });
        if (result.status === 200 && onCollectionChanged) {
          onCollectionChanged(finalValue);
        }
      }}
    >
      <FieldGroup>
        <RadioGroup
          value={formValue}
          onValueChange={(value) => setFormValue(value)}
        >
          <Field orientation="horizontal">
            <RadioGroupItem id="__none__" value="__none__" />
            <FieldLabel htmlFor="__none__">Senza Collezione</FieldLabel>
          </Field>

          {collections
            .filter(
              (value) => value !== "__none__" && value !== "Senza Collezione",
            )
            .map((value, index) => (
              <Field key={index} orientation="horizontal">
                <RadioGroupItem id={value} value={value} />
                <FieldLabel htmlFor={value}>{value}</FieldLabel>
              </Field>
            ))}
          {newCollection ? (
            <Field orientation="horizontal">
              <RadioGroupItem value={inputValue} />
              <FieldLabel>
                <Input
                  ref={inputRef}
                  placeholder="Nome collezione"
                  onChange={(e) => {
                    const cleanValue = e.target.value.replace(/_/g, "");
                    e.target.value = cleanValue;
                    setInputValue(cleanValue);
                    setFormValue(cleanValue);
                  }}
                  onFocus={() => setFormValue(inputRef.current!.value)}
                />
              </FieldLabel>
            </Field>
          ) : (
            <Button
              onClick={() => {
                setNewCollection(true);
                setFormValue(inputValue);
              }}
            >
              Crea nuova collezione
              <Plus />
            </Button>
          )}
        </RadioGroup>
      </FieldGroup>
      <Separator />
      <DialogFooter>
        <DialogClose asChild>
          <Button variant="outline">Cancel</Button>
        </DialogClose>
        <DialogClose asChild>
          <Button type="submit">Save changes</Button>
        </DialogClose>
      </DialogFooter>
    </form>
  );
}
