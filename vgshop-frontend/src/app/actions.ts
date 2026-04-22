"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export default async function LogoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("access_token");
  cookieStore.delete("refresh_token");
}
