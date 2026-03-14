import Link from "next/link";

import { ChatPanel } from "@/components/dashboard/chat-panel";
import { EmptyState } from "@/components/shared/empty-state";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { requireRole } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { createSupabaseServerComponentClient } from "@/lib/supabase/server";
import { listMessages } from "@/repositories/messageRepository";
import { listProviders } from "@/repositories/userRepository";
import type { Message, Provider } from "@/types/domain";

export default async function PatientMessagesPage({
  searchParams
}: {
  searchParams?: { provider?: string };
}) {
  const { user } = await requireRole("patient");
  const supabase = createSupabaseServerComponentClient();
  const providersQuery = await listProviders(supabase);
  const providers = ((providersQuery.data ?? []) as Provider[]).filter((provider) => provider.user?.id);
  const selectedProvider = providers.find((provider) => provider.id === searchParams?.provider) ?? providers[0];

  if (!selectedProvider?.user?.id) {
    return <EmptyState description="Create a provider account to activate secure patient-provider messaging." title="No provider available" />;
  }

  const messagesQuery = await listMessages(supabase, user.id, selectedProvider.user.id);
  const messages = (messagesQuery.data ?? []) as Message[];

  return (
    <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
      <Card className="p-5">
        <h2 className="text-lg font-semibold text-ink">Care team chat</h2>
        <p className="mt-2 text-sm text-muted">Choose a provider conversation and send secure follow-up messages from the patient portal.</p>
        <div className="mt-5 space-y-3">
          {providers.map((provider) => {
            const active = provider.id === selectedProvider.id;
            const label = provider.user?.full_name ?? provider.user?.email ?? "Provider";

            return (
              <Link
                key={provider.id}
                className={cn(
                  buttonVariants({ variant: active ? "primary" : "secondary", size: "sm", className: "w-full justify-start px-4 py-4 h-auto" }),
                  "flex-col items-start"
                )}
                href={`/patient/messages?provider=${provider.id}`}
              >
                <span>{label}</span>
                <span className={cn("text-xs font-medium", active ? "text-white/80" : "text-muted")}>{provider.specialty ?? "General care"}</span>
              </Link>
            );
          })}
        </div>
      </Card>

      <div className="space-y-4">
        <Card className="p-5">
          <h2 className="text-lg font-semibold text-ink">Conversation with {selectedProvider.user.full_name ?? selectedProvider.user.email}</h2>
          <p className="mt-2 text-sm text-muted">Use this thread for pre-visit questions, prescription follow-ups, and non-emergency care coordination.</p>
        </Card>
        <ChatPanel currentUserId={user.id} messages={messages} receiverId={selectedProvider.user.id} />
      </div>
    </div>
  );
}
