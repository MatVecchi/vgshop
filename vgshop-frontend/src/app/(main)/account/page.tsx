"use client";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import useSWR from "swr";
import Link from "next/dist/client/link";
import { Separator } from "@/components/ui/separator";
import {
  CreditCard,
  User,
  Mail,
  NotebookPen,
  Info,
  Package,
  LogOut,
  Megaphone,
  Landmark,
  Globe,
  Building,
  Users,
  MessageCircle,
  PenIcon,
  Key,
  LockKeyhole,
} from "lucide-react";
import OrderList from "@/components/OrderList/OrderList";
import CreditCardList from "@/components/CreditCardList/CreditCardList";
import { CreditCardRegister } from "@/components/CreditCardRegister/CreditCardRegister";
import FamilyTab from "@/components/FamilyTab/FamilyTab";
import { DepositDialog } from "@/components/DepositDialog/DepositDialog";
import TransactionList from "@/components/TransactionList/TransactionList";
import ReviewList from "@/components/ReviewList/ReviewList";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import Image from "next/image";
import { useSWRConfig } from "swr";
import GrainientBg from "@/components/GrainientBg/GrainientBg";

export default function Account() {
  const { data, error, mutate } = useSWR("/api/profile/");

  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [username, setUsername] = useState<string>("");
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [piva, setPiva] = useState<string>("");
  const [website, setWebsite] = useState<string>("");
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [updateLoading, setUpdateLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<Record<string, string[]>>(
    {},
  );
  const { mutate: mutateGlobal } = useSWRConfig();

  const setStateToData = (profilo: any) => {
    if (!profilo) return;
    setUsername(profilo.username || "");
    setFirstName(profilo.first_name || "");
    setLastName(profilo.last_name || "");
    setEmail(profilo.email || "");
    setPiva(profilo.piva || "");
    setWebsite(profilo.website || "");
    setImage(null);
  };

  useEffect(() => {
    if (data) {
      setStateToData(data);
    }
  }, [data]);

  // Gestione dell'anteprima dell'immagine
  useEffect(() => {
    if (!image) {
      setPreviewUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(image);
    setPreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [image]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleReset = () => {
    setIsEditing(false);
    if (data) setStateToData(data);
    setErrorMessage({});
  };

  const handleConfirm = async () => {
    setUpdateLoading(true);
    try {
      const formData = new FormData();
      formData.append("username", username);
      formData.append("first_name", firstName);
      formData.append("last_name", lastName);
      formData.append("email", email);

      if (image) {
        formData.append("profile_image", image);
      }

      if (data.piva) {
        formData.append("piva", piva);
        formData.append("website", website);
      }

      const response = await api.patch(`/api/update/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Profilo modificato con successo !");
      setIsEditing(false);
      mutate();
      mutateGlobal("/api/username/");
    } catch (e: any) {
      if (e.response && e.response.data) {
        if (e.response.data.message) {
          toast.error(e.response.data.message[0]);
        } else {
          setErrorMessage(e.response.data);
        }
      } else {
        toast.error("Errore nella modifica del profilo! riprova");
      }
    } finally {
      setUpdateLoading(false);
    }
  };

  const { data: creditValue } = useSWR("/transactions/wallet/credit");
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
    <GrainientBg>
      <div className="max-w-7xl flex-1 mx-auto p-4 pt-24">
        <div className="h-full flex flex-col">
          <h2 className="uppercase text-4xl font-bold">
            Dettagli dell'account
          </h2>
          <Tabs
            className="mt-6 flex-1"
            defaultValue="info"
            orientation="vertical"
          >
            <TabsList className="h-auto! max-h-96">
              <TabsTrigger className="hover:cursor-pointer" value="info">
                <Info className="inline-block mr-2" />
                Informazioni
              </TabsTrigger>
              <TabsTrigger className="hover:cursor-pointer" value="security">
                <LockKeyhole className="inline-block mr-2" />
                Sicurezza
              </TabsTrigger>
              <TabsTrigger className="hover:cursor-pointer" value="payments">
                <CreditCard className="inline-block mr-2" />
                Pagamenti
              </TabsTrigger>
              {!data.piva && (
                <>
                  <TabsTrigger className="hover:cursor-pointer" value="orders">
                    <Package className="inline-block mr-2" />
                    Ordini
                  </TabsTrigger>
                  <TabsTrigger
                    className="hover:cursor-pointer"
                    value="my_reviews"
                  >
                    <MessageCircle className="inline-block mr-2" />
                    Miei commenti
                  </TabsTrigger>
                  <TabsTrigger className="hover:cursor-pointer" value="family">
                    <Users className="inline-block mr-2" />
                    Famiglia
                  </TabsTrigger>
                </>
              )}
              <Button
                className="mt-auto w-full hover:cursor-pointer"
                variant="destructive"
                onClick={handleLogout}
              >
                <LogOut className="inline-block mr-2" />
                Logout
              </Button>
            </TabsList>
            <TabsContent value="info" className="flex flex-col gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex justify-between">
                    <div>
                      <Info className="inline-block mr-2" />
                      Informazioni dell'account
                    </div>
                    <div>
                      {isEditing ? (
                        <>
                          <Button onClick={handleReset}> Annulla </Button>
                          <Button onClick={handleConfirm}>
                            {" "}
                            {updateLoading ? <Spinner /> : "Conferma"}{" "}
                          </Button>
                        </>
                      ) : (
                        <Button onClick={handleEdit}>
                          <PenIcon />
                        </Button>
                      )}
                    </div>
                  </CardTitle>
                  <CardDescription>
                    Dati personali e dettagli dell'account dell'utente
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
                    <div className="flex flex-col items-center text-center bg-muted/30 p-4 rounded-xl border">
                      <Field className="flex flex-col items-center w-full">
                        <Label
                          htmlFor="profile_image"
                          className="group relative"
                        >
                          <div className="w-28! h-28! mx-auto aspect-square! rounded-full overflow-hidden border-2 border-primary/20 bg-background flex items-center justify-center shadow-sm shrink-0 relative">
                            {previewUrl ? (
                              <Image
                                fill
                                src={previewUrl}
                                alt="Nuovo Avatar"
                                className="object-cover"
                              />
                            ) : data?.profile_image ? (
                              <Image
                                fill
                                src={data.profile_image}
                                alt="Avatar Corrente"
                                className="object-cover"
                              />
                            ) : (
                              <User className="w-12 h-12 text-muted-foreground" />
                            )}

                            {isEditing && (
                              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                <span className="text-[10px] text-white font-medium uppercase tracking-wider text-center px-1">
                                  Cambia
                                  <br />
                                  Foto
                                </span>
                              </div>
                            )}
                          </div>
                        </Label>

                        {isEditing && (
                          <input
                            id="profile_image"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0] || null;
                              setImage(file);
                            }}
                          />
                        )}
                      </Field>

                      <div className="mt-4 w-full">
                        <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">
                          Username
                        </div>
                        {isEditing ? (
                          <Input
                            type="text"
                            className="text-center"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                          />
                        ) : (
                          <span className="font-mono font-bold text-lg text-card-foreground">
                            @{username}
                          </span>
                        )}
                        {errorMessage.username && (
                          <p className="text-xs text-red-500 mt-1">
                            {errorMessage.username[0]}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-4 bg-card p-2">
                      <div className="flex flex-col gap-1.5">
                        <span className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                          <NotebookPen className="w-4 h-4" /> Nome
                        </span>
                        {isEditing ? (
                          <Input
                            type="text"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                          />
                        ) : (
                          <p className="text-base font-semibold border-b pb-1 pl-1">
                            {firstName || "—"}
                          </p>
                        )}
                        {errorMessage.first_name && (
                          <p className="text-xs text-red-500">
                            {errorMessage.first_name[0]}
                          </p>
                        )}
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <span className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                          <NotebookPen className="w-4 h-4" /> Cognome
                        </span>
                        {isEditing ? (
                          <Input
                            type="text"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                          />
                        ) : (
                          <p className="text-base font-semibold border-b pb-1 pl-1">
                            {lastName || "—"}
                          </p>
                        )}
                        {errorMessage.last_name && (
                          <p className="text-xs text-red-500">
                            {errorMessage.last_name[0]}
                          </p>
                        )}
                      </div>

                      <div className="flex flex-col gap-1.5 sm:col-span-2 mt-2">
                        <span className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                          <Mail className="w-4 h-4" /> Email
                        </span>
                        {isEditing ? (
                          <Input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                          />
                        ) : (
                          <p className="text-base font-semibold border-b pb-1 pl-1 text-primary">
                            {email}
                          </p>
                        )}
                        {errorMessage.email && (
                          <p className="text-xs text-red-500">
                            {errorMessage.email[0]}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              {data.piva ? (
                <Card>
                  <CardHeader>
                    <CardTitle>
                      <Megaphone className="inline-block mr-2" />
                      Informazioni Publisher
                    </CardTitle>
                    <CardDescription>
                      Informazioni riservate agli account publisher
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5 sm:col-span-2 mt-2">
                      <span className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                        <Building className="w-4 h-4" /> Partita IVA
                      </span>
                      {isEditing ? (
                        <Input
                          type="text"
                          value={piva}
                          onChange={(e) => setPiva(e.target.value)}
                        />
                      ) : (
                        <p className="text-base font-semibold border-b pb-1 pl-1 text-primary">
                          {piva}
                        </p>
                      )}
                      {errorMessage.piva && (
                        <p className="text-xs text-red-500">
                          {errorMessage.piva[0]}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col gap-1.5 sm:col-span-2 mt-2">
                      <span className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                        <Globe className="w-4 h-4" /> Sito Web
                      </span>
                      {isEditing ? (
                        <Input
                          type="url"
                          value={website}
                          onChange={(e) => setWebsite(e.target.value)}
                        />
                      ) : (
                        <Button
                          className="text-base font-semibold border-b pb-1 pl-1 text-primary justify-start w-full h-auto"
                          variant="link"
                          asChild
                        >
                          <Link href={data?.website || ""} target="_blank">
                            {data?.website || "Non impostato"}
                          </Link>
                        </Button>
                      )}
                      {errorMessage.website && (
                        <p className="text-sm text-red-500 text-destructive-foreground">
                          {errorMessage.website[0]}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <></>
              )}
            </TabsContent>
            <TabsContent value="security" className="flex flex-col gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex justify-between">
                    <div>
                      <LockKeyhole className="inline-block mr-2" />
                      Sicurezza
                    </div>
                  </CardTitle>
                  <CardDescription>
                    Modifica la password e le impostazioni di sicurezza
                    dell'account
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-6"></CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="payments" className="flex flex-col gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>
                    <Landmark className="inline-block mr-2" />
                    Saldo VGSHOP
                  </CardTitle>
                  <CardDescription>
                    Gestisci il tuo saldo VGSHOP
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex">
                  <p className="text-5xl font-medium">
                    {creditValue?.credit.toFixed(2) || "0.00"} €
                  </p>
                  <div className="ml-auto flex flex-col gap-2">
                    <DepositDialog />
                    <TransactionList />
                  </div>
                </CardContent>
              </Card>
              {!data.piva && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex flex-row justify-between">
                      <div>
                        <CreditCard className="inline-block mr-2 " />
                        Metodi di pagamento
                      </div>
                      <CreditCardRegister />
                    </CardTitle>
                    <CardDescription>
                      Gestisci i tuoi metodi di pagamento
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <CreditCardList />
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            {!data.piva && (
              <>
                <TabsContent value="orders">
                  <Card>
                    <CardHeader>
                      <CardTitle>
                        <Package className="inline-block mr-2" />
                        Ordini
                      </CardTitle>
                      <CardDescription>
                        Visualizza e gestisci i tuoi ordini
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <OrderList />
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="my_reviews">
                  <Card>
                    <CardHeader>
                      <CardTitle>
                        <MessageCircle className="inline-block mr-2" />
                        Miei commenti
                      </CardTitle>
                      <CardDescription>
                        Visualizza e gestisci i tuoi ordini
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6 h-150">
                        <ReviewList url={`/my_reviews/`} mine={true} />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="family" className="flex flex-col gap-4">
                  <FamilyTab />
                </TabsContent>
              </>
            )}
          </Tabs>
        </div>
      </div>
    </GrainientBg>
  );
}
