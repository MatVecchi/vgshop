import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { SendHorizontal } from "lucide-react";

type ChatProps = {
  children: ReactNode;
  profile_image?: string;
  username: string;
};

export default function Chat({ children, profile_image, username }: ChatProps) {
  return (
    <Dialog>
      <DialogTrigger>
        <Button className="hover:cursor-pointer">{children}</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 uppercase">
            <Avatar>
              <AvatarImage src={profile_image} />
              <AvatarFallback>
                {username.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <p className="font-semibold">{username}</p>
          </DialogTitle>
          <Separator />
          <DialogDescription>
            <InputGroup>
              <InputGroupInput placeholder="Invia un messaggio" />
              <InputGroupAddon align="inline-end">
                <InputGroupButton variant="secondary">
                  <SendHorizontal />
                </InputGroupButton>
              </InputGroupAddon>
            </InputGroup>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
