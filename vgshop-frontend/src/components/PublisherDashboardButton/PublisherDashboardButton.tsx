"use client";
import useSWR from "swr";
import { Spinner } from "../ui/spinner";
import Link from "next/link";

interface TitlesResponse {
  titles: string[];
}

export default function PublisherDashboardButton() {
  const {
    error: titlesError,
    isLoading: titlesIsLoading,
    mutate,
  } = useSWR<TitlesResponse>(`/games/publisher_dashboard/cake/`);

  if (titlesError) return null;
  if (titlesIsLoading) return null;

  return (
    <>
      <Link href={`/publisher_dashboard`}>Dashboard</Link>
    </>
  );
}
