import { ListFilter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GameSearch } from "@/components/GameSearch/GameSearch";
import { GameFilters } from "@/components/GameFilters/GameFilters";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

import { GameCarousel } from "@/components/GameCarousel/GameCarousel";
import { TagCarousel } from "@/components/TagCarousel/TagCarousel";
import { GameGridCarousel } from "@/components/GameGridCarousel/GameGridCarousel";
import { GameCard } from "@/components/GameCard/GameCard";
import CollapsibleGameFilter from "@/components/CollapsibleGameFilter/CollapsibleGameFilter";
import LightRaysBg from "@/components/LightRaysBg/LightRaysBg";

export default function ExploreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <LightRaysBg>
      <div className="max-w-7xl flex-1 mx-auto pt-24">
        <div className="flex-1">
          <CollapsibleGameFilter />
          <div className="mt-6">{children}</div>
        </div>
      </div>
    </LightRaysBg>
  );
}
