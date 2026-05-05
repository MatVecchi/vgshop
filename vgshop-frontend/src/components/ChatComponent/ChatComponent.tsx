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
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { SendHorizontal } from "lucide-react";
import { ReactNode, useState } from "react";
import { Virtuoso } from "react-virtuoso";
import api from "@/lib/api";

type ChatComponentProps = {
  profile_image?: string;
  username: string;
  messages?: any;
  children: ReactNode;
  setSize?: any;
  isLoading: boolean;
  mutate?: any;
};

export default function ChatComponent({
  profile_image,
  username,
  messages,
  children,
  setSize,
  isLoading,
  mutate,
}: ChatComponentProps) {
  const [message, setMessage] = useState("");
  console.log(messages);
  return (
    <Dialog>
      <DialogTrigger asChild>
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
        </DialogHeader>
        <Separator />
        <div className="flex-1 min-h-128 max-h-128">
          {messages && messages.length > 0 ? (
            <Virtuoso
              className="overflow-y-auto"
              data={messages}
              endReached={() => {
                if (!isLoading && setSize) setSize((prev: number) => prev + 1);
              }}
              itemContent={(index, elem) => (
                <div key={index}>
                  <p>{elem.message}</p>
                  <p>{elem.status}</p>
                  <p>{elem.date}</p>
                  <p>{elem.sender}</p>
                  <p>{elem.receiver}</p>
                </div>
              )}
              components={{
                Footer: () => (isLoading ? <p>Caricamento...</p> : null),
              }}
            ></Virtuoso>
          ) : (
            <></>
          )}
          <InputGroup>
            <InputGroupInput
              placeholder="Invia un messaggio"
              onChange={(e) => {
                setMessage(e.target.value);
              }}
            />
            <InputGroupAddon align="inline-end">
              <InputGroupButton
                variant="secondary"
                onClick={async () => {
                  await api.post("/api/messages/", {
                    receiver: username,
                    message: message,
                  });
                  if (mutate) {
                    mutate();
                  }
                }}
              >
                <SendHorizontal />
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
        </div>
      </DialogContent>
    </Dialog>
  );
}
