import Image from "next/image";
import LoginButton from "@/components/LoginButton/LoginButton";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
            <LoginButton />
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
