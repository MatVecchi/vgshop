"use client";
import useSWR from "swr";
import { Spinner } from "../ui/spinner";
import Link from "next/link";

interface TitlesResponse {
  titles: string[];
}

export default function LibraryButton() {
  const {
    data: titles,
    error: titlesError,
    isLoading: titlesIsLoading,
    mutate,
  } = useSWR<TitlesResponse>(`/library/list_titles`);

  if (titlesError) return null;
  if (titlesIsLoading) return null;

  const title = titles?.titles ? titles.titles[0] : null;
  return (
    <>
      <Link href={`/library/${title}`}>Libreria</Link>
    </>
  );
}
