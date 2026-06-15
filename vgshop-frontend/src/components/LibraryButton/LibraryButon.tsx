"use client";
import useSWR from "swr";
import { Spinner } from "../ui/spinner";
import Link from "next/link";

interface GameTitleItem {
  title: string;
  collection: string | null;
}

interface TitlesResponse {
  titles: GameTitleItem[];
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

  const title = titles?.titles ? titles.titles[0]?.title : null;
  return (
    <>
      <Link
        href={`/library/${title}`}
        className="hover:text-white transition-colors"
      >
        Libreria
      </Link>
    </>
  );
}
