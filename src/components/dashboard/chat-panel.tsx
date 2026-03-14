import { MessageThread } from "@/components/messages/message-thread";
import type { Message } from "@/types/domain";

export function ChatPanel({
  currentUserId,
  receiverId,
  messages
}: {
  currentUserId: string;
  receiverId: string;
  messages: Message[];
}) {
  return <MessageThread currentUserId={currentUserId} initialMessages={messages} receiverId={receiverId} />;
}
