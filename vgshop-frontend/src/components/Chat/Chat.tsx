import ChatComponent from "@/components/ChatComponent/ChatComponent";
import { profile } from "console";
import { ReactNode } from "react";
import useSWRInfinite from "swr/infinite";

type ChatProps = {
  children: ReactNode;
  profile_image?: string;
  username: string;
};

export default function Chat({ children, profile_image, username }: ChatProps) {
  const getKey = (pageIndex: any, previousPageData: any) => {
    if (pageIndex === 0) return `/api/messages?page=1&friend=${username}`;

    if (previousPageData && !previousPageData.next) {
      return null;
    }

    return `/api/messages/?page=${pageIndex + 1}&friend=${username}`;
  };

  const { data, size, setSize, isLoading, mutate } = useSWRInfinite(getKey);
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

  return (
    <ChatComponent
      username={username}
      profile_image={profile_image}
      messages={data?.[0]}
      setSize={setSize}
      isLoading={isLoading}
      mutate={mutate}
    >
      {children}
    </ChatComponent>
  );
}
