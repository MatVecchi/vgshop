"use client";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import Link from "next/link";
import Image from "next/image";

export default function LogoutButton() {
  const { data: user, isLoading } = useSWR("/api/username/");
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const response = await api.get("/api/logout/");

      toast.success(response.data.message);
      toast.success("Logout Successful !");
      router.push("/");
      router.refresh();
    } catch (e) {
      toast.error("Something went wrong !");
      console.log(e);
    }
  };

  if (isLoading) return <Spinner />;

  return (
    <div className="flex items-center gap-4">
      <Link href="/account" className="hover:underline flex items-center gap-1">
        <strong className="capitalize">{user!.username}</strong>
        <Avatar>
          <AvatarImage src={user?.profile_image} />
          <AvatarFallback>
            {user?.username.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </Link>
      <Button variant="outline" onClick={handleLogout}>
        Logout
      </Button>
    </div>
  );
}
