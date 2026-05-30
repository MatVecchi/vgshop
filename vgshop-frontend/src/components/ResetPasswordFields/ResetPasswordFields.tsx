"use client";
import { useState } from "react";
import { toast } from "sonner";
import { MinusCircle, PlusCircle, RotateCw, KeyRound } from "lucide-react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { FieldGroup, Field } from "@/components/ui/field";
import ErrorMessage from "../ErrorMessage/ErrorMessage";
import { PasswordInput } from "../PasswordInput/PasswordInput";
import { Spinner } from "../ui/spinner";
import { useRouter, useSearchParams } from "next/navigation";

type Props = {
  forgot: boolean;
  token?: string | null;
  uid?: string | null;
};

export default function ResetPasswordFields({ forgot, token, uid }: Props) {
  const [oldPassword, setOldPassword] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [submitLoading, setSubmitLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<Record<string, string[]>>(
    {},
  );
  const router = useRouter();

  const submitURL = `/api/${forgot ? "lost_password/confirm/" : "reset_password/"}`;

  const handleReset = () => {
    if (!forgot) {
      setOldPassword("");
    }
    setNewPassword("");
    setConfirmPassword("");
    setErrorMessage({});
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setSubmitLoading(true);
    setErrorMessage({});

    if (confirmPassword !== newPassword) {
      setErrorMessage({
        confirm_password: ["Le password non corrispondono !"],
      });
      setSubmitLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      if (forgot) {
        if (!uid || !token) {
          setErrorMessage({
            global: [
              "I parametri di ripristino (UID/Token) sono mancanti o non validi.",
            ],
          });
          setSubmitLoading(false);
          return;
        }
        formData.append("uid", uid);
        formData.append("token", token);
      } else {
        formData.append("old_password", oldPassword);
      }
      formData.append("new_password", newPassword);
      formData.append("confirm_password", confirmPassword);

      await api.post(submitURL, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Password modificata con successo !");
      handleReset();
      if (forgot) {
        router.push("/login");
      }
    } catch (e: any) {
      if (e.response && e.response.data) {
        if (e.response.data.message) {
          toast.error(e.response.data.message[0]);
        } else {
          setErrorMessage(e.response.data);
        }
      } else {
        toast.error("Errore nella modifica delle password! riprova");
      }
    } finally {
      setSubmitLoading(false);
    }
  };

  const isButtonDisabled =
    submitLoading ||
    !newPassword ||
    !confirmPassword ||
    (!forgot && !oldPassword);

  return (
    <form className="w-full max-w-full mx-auto" onSubmit={handleSubmit}>
      <FieldGroup className="space-y-6">
        {errorMessage.global && (
          <div className="text-sm text-destructive text-center font-medium bg-destructive/10 p-2 rounded">
            {errorMessage.global[0]}
          </div>
        )}

        {!forgot && (
          <Field className="flex flex-col gap-1">
            <label
              htmlFor="oldPassword"
              className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/80 flex items-center gap-1.5"
            >
              <MinusCircle className="w-3.5 h-3.5 text-destructive/70" />
              <KeyRound className="w-3.5 h-3.5" />
              Vecchia Password
            </label>
            <PasswordInput
              id="oldPassword"
              placeholder="••••••••"
              required
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
            />
            <ErrorMessage message={errorMessage.old_password} />
          </Field>
        )}

        <Field className="flex flex-col gap-1">
          <label
            htmlFor="newPassword"
            className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/80 flex items-center gap-1.5"
          >
            <PlusCircle className="w-3.5 h-3.5 text-emerald-500" />
            <KeyRound className="w-3.5 h-3.5" />
            Nuova Password
          </label>
          <PasswordInput
            id="newPassword"
            placeholder="••••••••"
            required
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />

          <ErrorMessage
            message={errorMessage.new_password || errorMessage.non_field_errors}
          />
        </Field>

        <Field className="flex flex-col gap-1">
          <label
            htmlFor="confirmPassword"
            className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/80 flex items-center gap-1.5"
          >
            <RotateCw className="w-3.5 h-3.5 text-blue-500" />
            <KeyRound className="w-3.5 h-3.5" />
            Conferma Password
          </label>
          <PasswordInput
            id="confirmPassword"
            placeholder="••••••••"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <ErrorMessage message={errorMessage.confirm_password} />
        </Field>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border mt-8">
          <Button
            type="button"
            variant="destructive"
            className="text-muted-foreground hover:text-foreground px-4 py-2 text-sm font-medium transition-colors"
            onClick={handleReset}
          >
            Annulla
          </Button>
          <Button
            type="submit"
            disabled={isButtonDisabled}
            className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm h-10 px-5 text-sm font-medium transition-all transform active:scale-[0.98] disabled:opacity-50"
          >
            {submitLoading ? <Spinner /> : "Conferma"}
          </Button>
        </div>
      </FieldGroup>
    </form>
  );
}
