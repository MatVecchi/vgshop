"use client";

import { error } from "console";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
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
import { Field, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { useState } from "react";
import { format } from "date-fns";
import { ChevronDownIcon } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ToggleGroup, ToggleGroupItem } from "../ui/toggle-group";
import { ImagesDropZone } from "../ImagesDropZone/ImagesDropZone";
import { Spinner } from "../ui/spinner";
import api from "@/lib/api";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export interface Tag {
  name: string;
}

export interface GameImage {
  id: number;
  image: string;
}

export interface Game {
  id: number;
  title: string;
  release_date: string;
  price: number;
  description: string;
  video: string;
  tag_list: Tag[];
  publisher: number;
  images: GameImage[];
  cover: string;
}

export default function GameAddModal() {
  const {
    data: tag_list,
    error,
    isLoading: isTagListLoading,
  } = useSWR("/games/catalogue/tag_list/");

  const router = useRouter();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [images, setImages] = useState<{ file: File; preview: string }[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [title, setTitle] = useState<string>("");
  const [price, setPrice] = useState<number>(70);
  const [description, setDescription] = useState<string>("");
  const [video, setVideo] = useState<string>("");
  const [submitLoading, setSubmitLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<Record<string, string[]>>(
    {},
  );

  const {
    data: user,
    error: userError,
    isLoading,
    mutate,
  } = useSWR("api/profile");

  if (userError || isLoading || !user) {
    return null;
  }

  if (!user.piva) {
    return null;
  }

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    setSubmitLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("price", price.toString());
      formData.append("description", description);
      formData.append("video", video);
      formData.append("release_date", date ? date.toISOString() : "");
      formData.append("publisher", user.id);

      selectedTags.forEach((tag) => formData.append("tag_list", tag));

      formData.append("cover", images[0].file);
      if (images.length > 0) {
        images
          .slice(1)
          .forEach((img) => formData.append("uploaded_images", img.file));
      }
      const response = await api.post("games/catalogue/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Gioco aggiunto con successo !");
      window.location.href = "/explore";
    } catch (e: any) {
      if (e.response && e.response.data) {
        setErrorMessage(e.response.data);
      } else {
        toast.error("Something went wrong, try again !");
      }
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <>
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline">Pubblica Gioco</Button>
        </DialogTrigger>

        <DialogContent className="sm:max-w-md max-h-3/4 overflow-y-auto">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Registra il nuovo gioco</DialogTitle>
              <DialogDescription>
                Inserisci le informazioni del nuovo gioco che vuoi registrare.
                Clicca su registra per confermare.
              </DialogDescription>
            </DialogHeader>

            <FieldGroup>
              <Field>
                <Label htmlFor="title">Titolo</Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="Elden Ring"
                  onChange={(e) => setTitle(e.target.value)}
                  value={title}
                />
                {errorMessage.username && (
                  <p className="text-sm text-red-500 text-destructive-foreground">
                    {errorMessage.username[0]}
                  </p>
                )}
              </Field>

              <FieldGroup className="flex flex-row">
                <Field>
                  <Label htmlFor="price">Prezzo</Label>
                  <Input
                    id="price"
                    name="price"
                    placeholder="70.0"
                    type="number"
                    value={price}
                    onChange={(e) => {
                      const float_value = parseFloat(e.target.value);
                      setPrice(
                        float_value >= 0 && !Number.isNaN(float_value)
                          ? float_value
                          : 0.0,
                      );
                    }}
                  />
                  {errorMessage.price && (
                    <p className="text-sm text-red-500 text-destructive-foreground">
                      {errorMessage.price[0]}
                    </p>
                  )}
                </Field>

                <Field>
                  <Label htmlFor="release_date">Data di rilascio</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        data-empty={!date}
                        className="w-53 justify-between text-left font-normal data-[empty=true]:text-muted-foreground"
                      >
                        {date ? (
                          format(date, "PPP")
                        ) : (
                          <span>Seleziona una data</span>
                        )}
                        <ChevronDownIcon />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        defaultMonth={date}
                      />
                    </PopoverContent>
                  </Popover>
                </Field>
                {errorMessage.release_date && (
                  <p className="text-sm text-red-500 text-destructive-foreground">
                    {errorMessage.release_date[0]}
                  </p>
                )}
              </FieldGroup>

              <Field>
                <Label htmlFor="description">Descrizione </Label>
                <Input
                  id="description"
                  name="description"
                  placeholder="Inserisci qui la descrizione"
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
                {errorMessage.description && (
                  <p className="text-sm text-red-500 text-destructive-foreground">
                    {errorMessage.description[0]}
                  </p>
                )}
              </Field>

              <Field>
                <Label htmlFor="video">Link al video </Label>
                <Input
                  id="video"
                  name="video"
                  placeholder="https://www.youtube.com/"
                  type="url"
                  value={video}
                  onChange={(e) => setVideo(e.target.value)}
                />
                {errorMessage.video && (
                  <p className="text-sm text-red-500 text-destructive-foreground">
                    {errorMessage.video[0]}
                  </p>
                )}
              </Field>
              <Field>
                <Label htmlFor="tag_list">Tags </Label>
                <ToggleGroup
                  type="multiple"
                  size="default"
                  variant="outline"
                  spacing={1}
                  className="gap-1"
                  style={{ flexWrap: "wrap" }}
                  id="tag_list"
                  value={selectedTags}
                  onValueChange={(e) => setSelectedTags(e)}
                >
                  {isTagListLoading ? (
                    <Spinner />
                  ) : (
                    tag_list.map((tag: any, i: string) => {
                      return (
                        <ToggleGroupItem
                          key={tag.name}
                          id={tag.name}
                          name={tag.name}
                          value={tag.name}
                        >
                          {tag.name}
                        </ToggleGroupItem>
                      );
                    })
                  )}
                </ToggleGroup>
                {errorMessage.tag_list && (
                  <p className="text-sm text-red-500 text-destructive-foreground">
                    {errorMessage.tag_list[0]}
                  </p>
                )}
              </Field>

              <Field>
                <Label htmlFor="images">
                  {" "}
                  Immagini (La prima è la copertina){" "}
                </Label>
                <ImagesDropZone files={images} onFilesChange={setImages} />
                {errorMessage.images && (
                  <p className="text-sm text-red-500 text-destructive-foreground">
                    {errorMessage.images[0]}
                  </p>
                )}
              </Field>
            </FieldGroup>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Annulla</Button>
              </DialogClose>
              <Button type="submit" disabled={submitLoading}>
                {submitLoading ? <Spinner /> : "Registra"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
