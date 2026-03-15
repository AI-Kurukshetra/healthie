import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Role } from "@/types/domain";

function resolveRole(metadataRole: unknown): Role {
  if (metadataRole === "patient" || metadataRole === "provider" || metadataRole === "admin") {
    return metadataRole;
  }

  return "patient";
}

export async function syncDirectoryFromAuth() {
  try {
    const admin = createSupabaseAdminClient();
    const usersResponse = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });

    if (usersResponse.error || !usersResponse.data?.users?.length) {
      return;
    }

    // Batch all upserts instead of sequential per-user inserts
    const userRows: Record<string, unknown>[] = [];
    const patientRows: Record<string, unknown>[] = [];
    const providerRows: Record<string, unknown>[] = [];

    for (const authUser of usersResponse.data.users) {
      const role = resolveRole(authUser.user_metadata?.role);
      const fullName = typeof authUser.user_metadata?.full_name === "string"
        ? authUser.user_metadata.full_name
        : null;

      userRows.push({
        id: authUser.id,
        email: authUser.email ?? "",
        full_name: fullName,
        role
      });

      if (role === "patient") {
        patientRows.push({ user_id: authUser.id });
      } else if (role === "provider") {
        providerRows.push({ user_id: authUser.id });
      }
    }

    // Run all batch upserts in parallel
    const tasks: Promise<any>[] = [
      (admin.from("users") as any).upsert(userRows, { onConflict: "id" })
    ];

    if (patientRows.length > 0) {
      tasks.push((admin.from("patients") as any).upsert(patientRows, { onConflict: "user_id" }));
    }

    if (providerRows.length > 0) {
      tasks.push((admin.from("providers") as any).upsert(providerRows, { onConflict: "user_id" }));
    }

    await Promise.all(tasks);
  } catch {
    // Directory sync is best effort and should not block admin pages.
  }
}
