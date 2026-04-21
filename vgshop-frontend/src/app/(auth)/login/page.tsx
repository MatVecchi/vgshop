"use client";
import { LoginCard } from "@/components/LoginCard/LoginCard";
import { useEffect, useState } from "react";
import { Spinner } from "@/components/ui/spinner";

export default function Login() {
  const [loading, setLoading] = useState<boolean>(true);
  useEffect(() => {
    const token = localStorage.getItem("access_token");

    if (token) {
      window.location.href = "/";
    } else {
      setLoading(false);
    }
  }, []);

  return loading ? <Spinner /> : <LoginCard></LoginCard>;
}
