"use client";

import { Spinner } from "@/components/ui/spinner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import useSWR from "swr";
import Link from "next/link";

export default function LogoutButton() {
  const { data: user, isLoading, mutate } = useSWR("/api/username/");

  if (isLoading) return <Spinner />;

  return (
    <div className="flex items-center gap-4">
      <Link href="/account" className=" flex items-center gap-1">
        <strong className="uppercase">{user ? user.username : "Utente"}</strong>
        <Avatar>
          <AvatarImage src={user?.profile_image} />
          <AvatarFallback>
            {user?.username.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </Link>
    </div>
  );
}
