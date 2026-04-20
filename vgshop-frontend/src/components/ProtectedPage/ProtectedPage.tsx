import { cookies } from "next/headers";
import { redirect } from "next/navigation";

type Props = {
  children: React.ReactNode;
  redirectTo?: string;
};

export default async function ProtectedPage({ children, redirectTo }: Props) {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token");

  if (!token) {
    redirect(redirectTo || "/login");
  }

  return children;
}
