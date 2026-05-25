"use client";
import useSWR from "swr";
import { Spinner } from "../ui/spinner";
import Link from "next/link";

export default function PublisherControlButton() {
  const {
    data: titles,
    error: titlesError,
    isLoading: titlesIsLoading,
    mutate,
  } = useSWR<string[]>(`/games/publisher_dashboard/`);

  if (titlesError) return null;
  if (titlesIsLoading) return null;

  const title = titles ? titles[0] : null;

  return (
    <>
      <Link
        href={`/publisher_control/${title}/`}
        className="hover:text-white transition-colors"
      >
        Pannello di controllo
      </Link>
    </>
  );
}
