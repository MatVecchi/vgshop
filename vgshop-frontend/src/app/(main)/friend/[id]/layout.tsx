import FriendLibrarySidebar from "@/components/FriendLibrarySidebar/FriendLibrarySidebar"; 
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { use } from "react";


interface Props {
  params: Promise<{ id: number }>;
  children: React.ReactNode;
}

export default function LibraryLayout({
  params,
  children,
}: Props) {
  const id = use(params).id;
  
  return (
    <TooltipProvider>
      <SidebarProvider defaultOpen={false}>
        <FriendLibrarySidebar id={id} />

        <header className="flex items-center h-14 px-4  shrink-0 pt-26">
          <SidebarTrigger />
        </header>

        {children}
      </SidebarProvider>
    </TooltipProvider>
  );
}
