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
} from "@/components/ui/input-group";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import { SendHorizontal, CheckCheck } from "lucide-react";
import { ReactNode, useState, useRef } from "react";
import { Virtuoso } from "react-virtuoso";
import TextareaAutosize from "react-textarea-autosize";
import api from "@/lib/api";

const capitalize = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

const formatDateSeparator = (dateString: string) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const msgDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffTime = today.getTime() - msgDate.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Oggi";
  if (diffDays === 1) return "Ieri";
  if (diffDays > 1 && diffDays < 7) {
    return capitalize(msgDate.toLocaleDateString("it-IT", { weekday: "long" }));
  }
  return msgDate.toLocaleDateString("it-IT");
};

const formatTime = (dateString: string) => {
  if (!dateString) return "";
  return new Date(dateString).toLocaleTimeString("it-IT", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

export enum MessageStatus {
  SENT = "S",
  READ = "R",
}

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
  const messageRef = useRef<HTMLTextAreaElement>(null);
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="hover:cursor-pointer">{children}</Button>
      </DialogTrigger>
      <DialogContent className="gap-2">
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
          <DialogDescription></DialogDescription>
        </DialogHeader>
        <Separator />
        <div className="h-128 flex flex-col">
          {messages && messages.length > 0 ? (
            <Virtuoso
              className="flex-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
              data={messages}
              firstItemIndex={Math.max(0, 100000 - messages.length)}
              initialTopMostItemIndex={messages.length - 1}
              followOutput="smooth"
              startReached={() => {
                if (!isLoading && setSize) setSize((prev: number) => prev + 1);
              }}
              itemContent={(index, elem) => {
                const isSent = elem.receiver === username;
                const firstIndex = Math.max(0, 100000 - messages.length);
                const arrayIndex = index - firstIndex;
                const prevElem = arrayIndex > 0 ? messages[arrayIndex - 1] : null;

                let showDateSeparator = false;
                if (!prevElem) {
                  showDateSeparator = true;
                } else {
                  const prevDate = new Date(prevElem.date);
                  const currDate = new Date(elem.date);
                  if (
                    prevDate.getFullYear() !== currDate.getFullYear() ||
                    prevDate.getMonth() !== currDate.getMonth() ||
                    prevDate.getDate() !== currDate.getDate()
                  ) {
                    showDateSeparator = true;
                  }
                }

                return (
                  <div key={index} className="flex flex-col w-full">
                    {showDateSeparator && (
                      <div className="flex justify-center my-3">
                        <Badge variant="secondary">
                          {formatDateSeparator(elem.date)}
                        </Badge>
                      </div>
                    )}
                    <div
                      className={`flex w-full mb-4 px-2 ${
                        isSent ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[75%] px-4 py-2 rounded-2xl flex flex-col gap-1 ${
                          isSent
                            ? "bg-primary text-primary-foreground rounded-br-sm"
                            : "bg-muted text-foreground rounded-bl-sm"
                        }`}
                      >
                        <p className="text-sm leading-relaxed break-words">
                          {elem.message}
                        </p>
                        <div
                          className={`text-[11px] flex items-center gap-1.5 ${
                            isSent
                              ? "text-primary-foreground/80 justify-end"
                              : "text-muted-foreground justify-start"
                          }`}
                        >
                          <span>{formatTime(elem.date)}</span>
                          {isSent && elem.status && (
                            <>
                              <span>&bull;</span>
                              {elem.status === MessageStatus.SENT ? (
                                <CheckCheck size={14} />
                              ) : (
                                <CheckCheck color="#006eff" size={14} />
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }}
              components={{
                Header: () =>
                  isLoading ? (
                    <div className="w-full flex justify-center p-2">
                      <Spinner />
                    </div>
                  ) : (
                    <></>
                  ),
              }}
            ></Virtuoso>
          ) : (
            <></>
          )}
          <InputGroup className="w-full">
            <TextareaAutosize
              ref={messageRef}
              data-slot="input-group-control"
              className="flex flex-1 min-w-0 w-full resize-none rounded-md bg-transparent px-3 py-2.5 text-base transition-[color,box-shadow] outline-none md:text-sm"
              placeholder="Invia un messaggio..."
              onChange={(e) => {
                setMessage(e.target.value);
                if (e.target.value === "" && e.target.rows !== 1) {
                  e.target.rows = 1;
                }
              }}
            />
            <InputGroupAddon align="inline-end" className="h-full">
              <InputGroupButton
                className="mt-auto"
                variant="secondary"
                onClick={async () => {
                  if (messageRef.current) {
                    messageRef.current.value = "";
                  }
                  setMessage("");
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
