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
import {
  BookOpen,
  Calendar1,
  ChevronDownIcon,
  DollarSign,
  Gamepad2,
  Images,
  Plus,
  PlusCircle,
  Tag,
  Type,
  VideoIcon,
} from "lucide-react";
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
import { Separator } from "../ui/separator";
import ErrorMessage from "../ErrorMessage/ErrorMessage";
import { Textarea } from "../ui/textarea";

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
  stars: number;
  is_owner: boolean;
  similar_games?: Game[];
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
    setErrorMessage({});
    setSubmitLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("price", price.toString());
      formData.append("description", description);
      formData.append("video", video);
      formData.append("release_date", date ? format(date, "yyyy-MM-dd") : "");
      formData.append("publisher", user.id);

      selectedTags.forEach((tag) => formData.append("tag_list", tag));

      if (images.length > 0) {
        formData.append("cover", images[0].file);
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
        setErrorMessage(e.message);
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

        <DialogContent className="sm:max-w-md max-w-[40%]! max-h-3/4 overflow-y-auto">
          <form onSubmit={handleSubmit}>
            <DialogHeader className="space-y-2 text-center pt-8">
              <DialogTitle className="text-2xl font-bold tracking-tight flex items-center justify-center gap-4 -ml-10">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Gamepad2 className="h-5 w-5" />
                </div>
                Pubblica gioco
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground px-4">
                Inserisci le informazioni del nuovo gioco che vuoi registrare.
                Clicca su registra per confermare.
              </DialogDescription>
            </DialogHeader>
            <Separator className="my-5" />
            <FieldGroup className="mt-5">
              <Field>
                <Label
                  htmlFor="title"
                  className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/90 flex items-center gap-1.5"
                >
                  <Type className="w-3.5 h-3.5 text-primary/80" />
                  Titolo
                </Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="Elden Ring"
                  onChange={(e) => setTitle(e.target.value)}
                  value={title}
                />
                <ErrorMessage message={errorMessage.title} />
              </Field>

              <FieldGroup className="flex flex-row">
                <Field>
                  <Label
                    htmlFor="price"
                    className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/90 flex items-center gap-1.5"
                  >
                    <DollarSign className="w-3.5 h-3.5 text-primary/80" />
                    Prezzo
                  </Label>
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
                  <ErrorMessage message={errorMessage.price} />
                </Field>

                <Field>
                  <Label
                    htmlFor="release_date"
                    className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/90 flex items-center gap-1.5"
                  >
                    <Calendar1 className="w-3.5 h-3.5 text-primary/80" />
                    Data di rilascio
                  </Label>
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
                <ErrorMessage message={errorMessage.release_date} />
              </FieldGroup>

              <Field>
                <Label
                  htmlFor="description"
                  className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/90 flex items-center gap-1.5"
                >
                  <BookOpen className="w-3.5 h-3.5 text-primary/80" />
                  Descrizione
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Inserisci qui la descrizione"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="resize-none"
                />
                <ErrorMessage message={errorMessage.description} />
              </Field>

              <Field>
                <Label
                  htmlFor="video"
                  className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/90 flex items-center gap-1.5"
                >
                  <VideoIcon className="w-3.5 h-3.5 text-primary/80" />
                  Link al trailer
                </Label>
                <Input
                  id="video"
                  name="video"
                  placeholder="https://www.youtube.com/"
                  type="url"
                  value={video}
                  onChange={(e) => setVideo(e.target.value)}
                />
                <ErrorMessage message={errorMessage.video} />
              </Field>
              <Field>
                <Label
                  htmlFor="tag_list"
                  className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/90 flex items-center gap-1.5"
                >
                  <Tag className="w-3.5 h-3.5 text-primary/80" />
                  Categorie (Tags)
                </Label>
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
                <ErrorMessage message={errorMessage.tag_list} />
              </Field>

              <Field>
                <Label
                  htmlFor="images"
                  className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/90 flex items-center gap-1.5"
                >
                  <Images className="w-3.5 h-3.5 text-primary/80" />
                  Immagini (* la prima immagine è la copertina)
                </Label>
                <ImagesDropZone files={images} onFilesChange={setImages} />
                <ErrorMessage message={errorMessage.uploaded_images} />
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
