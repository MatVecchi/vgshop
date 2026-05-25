import { cookies } from "next/headers";
import { Separator } from "@/components/ui/separator";
import Navbar from "@/components/Navbar/Navbar";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token");
  const isLoggedFlag = cookieStore.get("is_logged_in");
  const isLogged = token || isLoggedFlag?.value === "true" ? true : false;

  return (
    <>
      <Navbar isLogged={isLogged} />
      <Separator />
      <main className="flex flex-1">{children}</main>

      {/*<footer className="py-4 bg-zinc-200 dark:bg-zinc-800">
        <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
          &copy; {new Date().getFullYear()} VGShop. All rights reserved.
        </p>
      </footer> */}
    </>
  );
}
