import ChatComponent, {
  MessageStatus,
} from "@/components/ChatComponent/ChatComponent";
import api from "@/lib/api";
import { ReactNode, useCallback, useEffect, useMemo } from "react";
import useSWR from "swr";
import useSWRInfinite from "swr/infinite";
import { useState } from "react";

type ChatProps = {
  children: ReactNode;
  profile_image?: string;
  username: string;
};

export default function Chat({ children, profile_image, username }: ChatProps) {
  const { data: me, error: errorMe } = useSWR("/api/profile");
  const [isOpen, setIsOpen] = useState(false);

  const getKey = (pageIndex: any, previousPageData: any) => {
    if (!isOpen) return;
    if (pageIndex === 0) return `/api/messages/?page=1&friend=${username}`;

    if (previousPageData && !previousPageData.next) {
      return null;
    }

    return `/api/messages/?page=${pageIndex + 1}&friend=${username}`;
  };

  const { data, setSize, isLoading, mutate } = useSWRInfinite(getKey, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
  });

  const allMessages = useMemo(() => {
    if (!data) return [];

    return data
      .map((page: any) => page.results || page)
      .flat()
      .reverse();
  }, [data]);

  const addMessageToCache = useCallback(
    (newMessage: any) => {
      mutate(
        (pages: any[] = []) => {
          if (pages.length === 0) {
            return [
              {
                results: [newMessage],
              },
            ];
          }

          return pages.map((page, index) => {
            if (index !== 0) return page;

            if (page.results) {
              return {
                ...page,
                results: [newMessage, ...page.results],
              };
            }

            return [newMessage, ...page];
          });
        },
        {
          revalidate: false,
        },
      );
    },
    [mutate],
  );

  const markMessageAsReadInCache = useCallback(
    (messageId: number) => {
      mutate(
        (pages: any[] = []) =>
          pages.map((page) => {
            if (page.results) {
              return {
                ...page,
                results: page.results.map((message: any) =>
                  message.id === messageId
                    ? { ...message, status: MessageStatus.READ }
                    : message,
                ),
              };
            }
            return page.map((message: any) =>
              message.id === messageId
                ? { ...message, status: MessageStatus.READ }
                : message,
            );
          }),
        { revalidate: false },
      );
    },
    [mutate],
  );

  useEffect(() => {
    const unreadMessages = allMessages.filter((message: any) => {
      return (
        message.id &&
        message.receiver !== username &&
        message.status === MessageStatus.SENT
      );
    });

    unreadMessages.forEach((message: any) => {
      api
        .patch(`/api/messages/${message.id}/`, {
          status: MessageStatus.READ,
        })
        .catch((error) => {
          console.error("Errore PATCH read");
        });
    });
  }, [isOpen, allMessages, username]);

  if (!me || errorMe) return null;

  if (isLoading) {
    return (
      <ChatComponent
        username={username}
        profile_image={profile_image}
        isLoading={isLoading}
        isOpen={false}
        setIsOpen={() => null}
      >
        {children}
      </ChatComponent>
    );
  }

  return (
    <ChatComponent
      username={username}
      profile_image={profile_image}
      messages={allMessages}
      setSize={setSize}
      isLoading={isLoading}
      mutate={mutate}
      addMessageToCache={addMessageToCache}
      markMessageAsReadInCache={markMessageAsReadInCache}
      isOpen={isOpen}
      setIsOpen={setIsOpen}
    >
      {children}
    </ChatComponent>
  );
}
