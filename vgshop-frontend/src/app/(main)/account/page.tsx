"use client";
import useSWR from "swr";

export default function Account() {
  const { data, error } = useSWR("/api/profile/");

  if (error) return <div>Failed to load account details</div>;
  if (!data) return <div>Loading...</div>;

  return (
    <div>
      <h1>Dettagli dell'account</h1>
      <p>{data.username}</p>
      <p>{data.email}</p>
    </div>
  );
}
