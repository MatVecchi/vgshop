"use client";

import { SWRConfig } from "swr";
import api from "@/lib/api"; // La tua istanza Axios

const globalFetcher = (url: string) => api.get(url).then((res) => res.data);

export default function SWRProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SWRConfig
      value={{
        fetcher: globalFetcher,
        // Qui puoi aggiungere altre opzioni globali, come:
        revalidateOnFocus: true, // Aggiorna i dati quando l'utente torna sulla tab
        shouldRetryOnError: false, // Evita di bombardare il server se fallisce il 401
      }}
    >
      {children}
    </SWRConfig>
  );
}
