"use client";

import { useEffect, useState } from "react";
import { Spinner } from "@/components/ui/spinner";

export default function LoginButton() {
  const [token, setToken] = useState<string | null>("");
  useEffect(() => {
    setToken(localStorage.getItem("access_token"));
  }, []);
  return token === "" ? (
    <Spinner />
  ) : token ? (
    <a href="/account">
      Ciao{" "}
      {JSON.parse(localStorage.getItem("user_data") || "null")?.username ||
        "Account"}
    </a>
  ) : (
    <a href="/login">Login</a>
  );
}
