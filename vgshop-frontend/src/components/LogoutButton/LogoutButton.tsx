"use client";

import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginButton() {
  const [username, setUsername] = useState<string>("Account");
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    const userData = localStorage.getItem("user_data");
    if (userData) {
      try {
        const user = JSON.parse(userData);
        if (user?.username) setUsername(user.username);
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const handleLogout = async () => {
    try {
      const response = await api.get("/api/logout/");
      localStorage.removeItem("user_data");
      toast.success(response.data.message);
      toast.success("Logout Successful !");
      router.push("/");
      router.refresh();
    } catch (e) {
      toast.error("Something went wrong !");
      console.log(e);
    }
  };

  if (!mounted) return <Spinner />;

  return (
    <div className="flex items-center gap-4">
      <Link href="/account" className="hover:underline">
        Ciao <strong>{username}</strong>
      </Link>
      <Button variant="outline" onClick={handleLogout}>
        Logout
      </Button>
    </div>
  );
}
