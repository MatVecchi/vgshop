import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { FiltersSidebar } from "@/components/FiltersSidebar/FiltersSidebar";

export default function Explore() {
  return (
    <div className="flex-1">
      <h2 className="uppercase text-4xl font-bold">Negozio</h2>

      <div className="flex flex-row gap-6 mt-6">
        <aside className="w-64 shrink-0">
          <div className="sticky top-20">
            <FiltersSidebar></FiltersSidebar>
          </div>
        </aside>

        <div className="flex-1 grid grid-cols-3 gap-4"></div>
      </div>
    </div>
  );
}
