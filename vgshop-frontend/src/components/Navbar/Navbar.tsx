"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import LoginButton from "@/components/LoginButton/LoginButton";
import AccountButton from "@/components/AccountButton/AccountButton";
import Link from "next/link";
import FriendList from "@/components/FriendList/FriendList";
import GameAddModal from "@/components/GameAddModal/GameAddModal";
import { CartShowDialog } from "@/components/CartShowDialog/CartShowDialog";
import LibraryButton from "@/components/LibraryButton/LibraryButon";
import PublisherDashboardButton from "@/components/PublisherDashboardButton/PublisherDashboardButton";
import PublisherControlButton from "@/components/PublisherControlButton/PublisherControlButton";

type Prop = {
  isLogged: boolean;
};

export default function Navbar({ isLogged }: Prop) {
  const [prevScrollPos, setPrevScrollPos] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      const isVisible = prevScrollPos > currentScrollY || currentScrollY < 10;

      setPrevScrollPos(currentScrollY);
      setVisible(isVisible);
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, [prevScrollPos]);

  return (
    <nav
      className={`fixed top-4 left-0 right-0 z-50 mx-auto w-[60%] max-w-5xl transition-transform duration-300 ease-in-out ${
        visible ? "translate-y-0" : "-translate-y-24"
      }`}
    >
      <div className="flex items-center justify-between px-6 py-3 bg-transparent border border-zinc-600/30 backdrop-blur-md rounded-full shadow-lg shadow-black/40">
        <div className="text-white font-bold text-lg tracking-wider cursor-pointer">
          <Link href="/">
            <Image
              src="/favicon.ico"
              alt="Logo"
              width={32}
              height={32}
              loading="eager"
            />
          </Link>
        </div>

        <ul className="hidden md:flex items-center gap-6 text-zinc-400 text-sm font-medium">
          <li className="hover:text-white transition-colors">
            <Link href="/">Home</Link>
          </li>
          <li className="hover:text-white transition-colors">
            <Link href="/explore">Esplora</Link>
          </li>
          {isLogged && (
            <li className="flex gap-5">
              <LibraryButton />
              <PublisherControlButton />
              <PublisherDashboardButton />
            </li>
          )}

          <li className="ml-auto flex gap-2 items-center">
            {isLogged ? (
              <>
                <GameAddModal />
                <FriendList />
                <CartShowDialog />
                <AccountButton />
              </>
            ) : (
              <LoginButton />
            )}
          </li>
        </ul>
      </div>
    </nav>
  );
}
