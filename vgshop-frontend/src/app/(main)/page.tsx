import Image from "next/image";
import MonthlyPublishes from "@/components/MonthlyPublishes/MonthlyPublishes";
import SalesEvents from "@/components/SalesEvents/SalesEvents";

export default function Home() {
  return (
    <div>
      <MonthlyPublishes />
      <SalesEvents />
    </div>
  );
}