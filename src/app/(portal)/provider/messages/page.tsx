import Link from "next/link";

import { ChatPanel } from "@/components/dashboard/chat-panel";
import { EmptyState } from "@/components/shared/empty-state";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { requireRole } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { createSupabaseServerComponentClient } from "@/lib/supabase/server";
import { listMessages } from "@/repositories/messageRepository";
import { listPatients } from "@/repositories/userRepository";
import type { Message, Patient } from "@/types/domain";

export default async function ProviderMessagesPage({
  searchParams
}: {
  searchParams?: { patient?: string };
}) {
  const { user } = await requireRole("provider");
  const supabase = createSupabaseServerComponentClient();
  const patientsQuery = await listPatients(supabase);
  const patients = ((patientsQuery.data ?? []) as Patient[]).filter((patient) => patient.user?.id);
  const selectedPatient = patients.find((patient) => patient.id === searchParams?.patient) ?? patients[0];

  if (!selectedPatient?.user?.id) {
    return <EmptyState description="Create a patient account to activate provider messaging." title="No patient available" />;
  }

  const messagesQuery = await listMessages(supabase, user.id, selectedPatient.user.id);
  const messages = (messagesQuery.data ?? []) as Message[];

  return (
    <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
      <Card className="p-5">
        <h2 className="text-lg font-semibold text-ink">Patient conversations</h2>
        <p className="mt-2 text-sm text-muted">Choose a patient thread to coordinate scheduling, follow-ups, and non-emergency care communication.</p>
        <div className="mt-5 space-y-3">
          {patients.map((patient) => {
            const active = patient.id === selectedPatient.id;
            const label = patient.user?.full_name ?? patient.user?.email ?? "Patient";

            return (
              <Link
                key={patient.id}
                className={cn(
                  buttonVariants({ variant: active ? "primary" : "secondary", size: "sm", className: "w-full justify-start px-4 py-4 h-auto" }),
                  "flex-col items-start"
                )}
                href={`/provider/messages?patient=${patient.id}`}
              >
                <span>{label}</span>
                <span className={cn("text-xs font-medium", active ? "text-white/80" : "text-muted")}>
                  {patient.phone ?? patient.insurance_provider ?? "Patient thread"}
                </span>
              </Link>
            );
          })}
        </div>
      </Card>

      <div className="space-y-4">
        <Card className="p-5">
          <h2 className="text-lg font-semibold text-ink">Conversation with {selectedPatient.user.full_name ?? selectedPatient.user.email}</h2>
          <p className="mt-2 text-sm text-muted">Use this thread for care coordination, post-visit updates, and general patient support outside emergency workflows.</p>
        </Card>
        <ChatPanel currentUserId={user.id} messages={messages} receiverId={selectedPatient.user.id} />
      </div>
    </div>
  );
}
