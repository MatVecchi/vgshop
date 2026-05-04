import { LibrarySidebar } from "@/components/LibrarySidebar/LibrarySidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";

export default function LibraryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <TooltipProvider>
      <SidebarProvider defaultOpen={false}>
        <LibrarySidebar />

        <header className="flex items-center h-14 px-4  shrink-0">
          <SidebarTrigger />
        </header>

        {children}
      </SidebarProvider>
    </TooltipProvider>
  );
}
