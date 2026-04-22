"use client";
import api from "@/lib/api";
import { useEffect } from "react";

export default function Account() {
  useEffect(() => {
    const res = api.get("/api/account/");
  });

  return (
    <div>
      <h1>Dettagli dell'account</h1>
    </div>
  );
}
