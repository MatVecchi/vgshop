import { PublisherGameSidebar } from "@/components/PublisherGameSideBar/PublisherGameSideBar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";

export default function PublisherControlLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <TooltipProvider>
      <SidebarProvider defaultOpen={false}>
        <PublisherGameSidebar />

        <header className="flex items-center h-14 px-4  shrink-0 pt-28">
          <SidebarTrigger />
        </header>

        {children}
      </SidebarProvider>
    </TooltipProvider>
  );
}
