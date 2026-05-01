import Image from "next/image";
import LoginButton from "@/components/LoginButton/LoginButton";
import { cookies } from "next/headers";
import AccountButton from "@/components/AccountButton/AccountButton";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import FriendList from "@/components/FriendList/FriendList";
import GameAddModal from "@/components/GameAddModal/GameAddModal";
import { CartShowDialog } from "@/components/CartShowDialog/CartShowDialog";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token");
  const isLogged = token ? true : false;

  return (
    <>
      <nav className="p-4 border-b dark:border-zinc-800">
        <ul className="flex items-center w-full gap-6 max-w-7xl mx-auto">
          <li>
            <Link href="/">
              <Image src="/favicon.ico" alt="Logo" width={32} height={32} />
            </Link>
          </li>
          <li>
            <Link href="/">Home</Link>
          </li>
          <li>
            <Link href="/explore">Esplora</Link>
          </li>
          <li>
            <Link href="/library">Libreria</Link>
          </li>

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
      </nav>
      <Separator />
      <main className="flex flex-1">{children}</main>

      <footer className="py-4 bg-zinc-200 dark:bg-zinc-800">
        <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
          &copy; {new Date().getFullYear()} VGShop. All rights reserved.
        </p>
      </footer>
    </>
  );
}
