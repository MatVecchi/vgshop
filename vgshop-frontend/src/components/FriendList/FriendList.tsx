"use client";
import { Button } from "@/components/ui/button";
import useSWR from "swr";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

import { Input } from "@/components/ui/input";

import { UsersRound } from "lucide-react";

export default function DrawerScrollableContent() {
  const { data, error } = useSWR("/api/friends");

  if (error)
    return (
      <Button variant="outline" className="hover:cursor-pointer">
        <UsersRound />
      </Button>
    );
  if (!data)
    return (
      <Button variant="outline" className="hover:cursor-pointer">
        <UsersRound />
      </Button>
    );

  return (
    <section id="friends">
      <Drawer direction="right">
        <DrawerTrigger className="hover:cursor-pointer">
          <UsersRound />
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Amici</DrawerTitle>
            <DrawerDescription>Ecco qui i tuoi amici</DrawerDescription>
          </DrawerHeader>

          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious text="" href="#" />
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#">1</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#" isActive>
                  2
                </PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#">3</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
              <PaginationItem>
                <PaginationNext text="" href="#" />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </DrawerContent>
      </Drawer>
    </section>
  );
}
