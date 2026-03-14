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

    for (const authUser of usersResponse.data.users) {
      const role = resolveRole(authUser.user_metadata?.role);
      const fullName = typeof authUser.user_metadata?.full_name === "string"
        ? authUser.user_metadata.full_name
        : null;

      await (admin.from("users") as any).upsert(
        {
          id: authUser.id,
          email: authUser.email ?? "",
          full_name: fullName,
          role
        },
        { onConflict: "id" }
      );

      if (role === "patient") {
        await (admin.from("patients") as any).upsert({ user_id: authUser.id }, { onConflict: "user_id" });
      }

      if (role === "provider") {
        await (admin.from("providers") as any).upsert({ user_id: authUser.id }, { onConflict: "user_id" });
      }
    }
  } catch {
    // Directory sync is best effort and should not block admin pages.
  }
}
