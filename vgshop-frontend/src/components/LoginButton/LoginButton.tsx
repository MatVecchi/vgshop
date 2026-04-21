"use client";

import { useEffect, useState } from "react";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "../ui/button";

export default function LoginButton() {
  const [token, setToken] = useState<string | null>("");

  useEffect(() => {
    setToken(localStorage.getItem("access_token"));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user_data");
    localStorage.removeItem("refresh_token");
    window.location.href = "/login";
  };

  return token === "" ? (
    <Spinner />
  ) : token ? (
    <div className="flex items-center gap-4">
      <a href="/account">
        Ciao{" "}
        {JSON.parse(localStorage.getItem("user_data") || "null")?.username ||
          "Account"}
      </a>
      <Button onClick={handleLogout}> Logout </Button>
    </div>
  ) : (
    <a href="/login">Login</a>
  );
}
