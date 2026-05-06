import ChatComponent, {
  MessageStatus,
} from "@/components/ChatComponent/ChatComponent";
import api from "@/lib/api";
import { ReactNode, useEffect } from "react";
import useSWRInfinite from "swr/infinite";

type ChatProps = {
  children: ReactNode;
  profile_image?: string;
  username: string;
};

export default function Chat({ children, profile_image, username }: ChatProps) {
  const getKey = (pageIndex: any, previousPageData: any) => {
    if (pageIndex === 0) return `/api/messages/?page=1&friend=${username}`;

    if (previousPageData && !previousPageData.next) {
      return null;
    }

    return `/api/messages/?page=${pageIndex + 1}&friend=${username}`;
  };

  const { data, size, setSize, isLoading, mutate } = useSWRInfinite(getKey, {
    refreshInterval: 3000,
  });
  if (isLoading) {
    return (
      <ChatComponent
        username={username}
        profile_image={profile_image}
        isLoading={isLoading}
      >
        {children}
      </ChatComponent>
    );
  }

  let allMessages: any[] = [];
  if (data) {
    // Flatten the array of pages and reverse to get chronological order (oldest to newest)
    allMessages = data
      .map((page: any) => page.results || page)
      .flat()
      .reverse();

    const filteredMessages = allMessages.filter((message: any) => {
      return (
        message.receiver !== username && message.status === MessageStatus.SENT
      );
    });

    filteredMessages.forEach((message: any) => {
      api.patch(`/api/messages/${message.id}/`, { status: MessageStatus.READ });
    });
  }

  return (
    <ChatComponent
      username={username}
      profile_image={profile_image}
      messages={allMessages}
      setSize={setSize}
      isLoading={isLoading}
      mutate={mutate}
    >
      {children}
    </ChatComponent>
  );
}
