"use client";

import { useEffect, useState } from "react";

import { createBrowserSupabaseClient } from "@/lib/supabaseClient";
import type { Message } from "@/types/domain";

export function useRealtimeMessages(initialMessages: Message[], currentUserId?: string) {
  const [messages, setMessages] = useState(initialMessages);

  useEffect(() => {
    if (!currentUserId) {
      return;
    }

    const supabase = createBrowserSupabaseClient();
    const channel = supabase
      .channel(`messages:${currentUserId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          const message = payload.new as Message;
          if (message.sender_id === currentUserId || message.receiver_id === currentUserId) {
            setMessages((current) => [...current, message]);
          }
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [currentUserId]);

  return { messages, setMessages };
}

