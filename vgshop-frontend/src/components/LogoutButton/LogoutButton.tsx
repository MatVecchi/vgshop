"use client";

import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Spinner } from "@/components/ui/spinner";
import LogoutAction from "@/app/actions";
import { toast } from "sonner";
import api from "@/lib/api";
import { useRouter } from "next/navigation";

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
      //const response = await api.get("/api/logout/");

      await LogoutAction();
      localStorage.removeItem("user_data");
      //toast.success(response.data.message);
      toast.success("Logout Successful !");
      router.push("/login");
    } catch (e) {
      toast.error("Something went wrong !");
      console.log(e);
    }
  };

  if (!mounted) return <Spinner />;

  return (
    <div className="flex items-center gap-4">
      <a href="/account" className="hover:underline">
        Ciao <strong>{username}</strong>
      </a>
      <Button variant="outline" onClick={handleLogout}>
        Logout
      </Button>
    </div>
  );
}
