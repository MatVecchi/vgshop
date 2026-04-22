import Image from "next/image";
import LoginButton from "@/components/LoginButton/LoginButton";
import { cookies } from "next/headers";
import LogoutButton from "@/components/LogoutButton/LogoutButton";

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
            <a href="/">
              <Image src="/favicon.ico" alt="Logo" width={32} height={32} />
            </a>
          </li>
          <li>
            <a href="/">Home</a>
          </li>
          <li>
            <a href="/explore">Esplora</a>
          </li>
          <li>
            <a href="/library">Libreria</a>
          </li>
          <li className="ml-auto">
            {isLogged ? (
              <LogoutButton></LogoutButton>
            ) : (
              <LoginButton></LoginButton>
            )}
          </li>
        </ul>
      </nav>

      <main className="flex-1">{children}</main>

      <footer className="py-6 bg-zinc-200 dark:bg-zinc-800">
        <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
          &copy; {new Date().getFullYear()} VGShop. All rights reserved.
        </p>
      </footer>
    </>
  );
}
