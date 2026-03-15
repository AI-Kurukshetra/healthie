export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";

import { createAuditLog, refreshPortalPaths, requireApiUser } from "@/app/api/_utils/helpers";
import { apiError, apiSuccess } from "@/lib/api";
import { createProviderAvailability, deleteProviderAvailability, listProviderAvailability } from "@/repositories/providerAvailabilityRepository";
import { getProviderByUserId } from "@/repositories/userRepository";
import { providerAvailabilitySchema } from "@/validators/provider-availability";

export async function GET() {
  const { supabase, user } = await requireApiUser();
  if (!user) {
    return apiError("Unauthorized.", 401);
  }

  const { data, error } = await listProviderAvailability(supabase);
  if (error) {
    return apiError(error.message, 400);
  }

  return apiSuccess(data ?? []);
}

export async function POST(request: NextRequest) {
  const { supabase, user, profile } = await requireApiUser();
  if (!user || !profile) {
    return apiError("Unauthorized.", 401);
  }

  if (profile.role !== "provider" && profile.role !== "admin") {
    return apiError("Forbidden.", 403);
  }

  const body = await request.json();
  const parsed = providerAvailabilitySchema.safeParse(body);
  if (!parsed.success) {
    return apiError(parsed.error.issues[0]?.message ?? "Invalid availability payload.");
  }

  if (profile.role === "provider") {
    const providerQuery = await getProviderByUserId(supabase, user.id);
    if (!providerQuery.data || providerQuery.data.id !== parsed.data.provider_id) {
      return apiError("Provider mismatch.", 403);
    }
  }

  const { data, error } = await createProviderAvailability(supabase, parsed.data);
  if (error || !data) {
    return apiError(error?.message ?? "Unable to save availability.", 400);
  }

  await createAuditLog("provider_availability.created", "provider_availability", data.id, { provider_id: data.provider_id });
  refreshPortalPaths(["/provider/appointments", "/patient/appointments"]);
  return apiSuccess(data, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const { supabase, user, profile } = await requireApiUser();
  if (!user || !profile) {
    return apiError("Unauthorized.", 401);
  }

  if (profile.role !== "provider" && profile.role !== "admin") {
    return apiError("Forbidden.", 403);
  }

  const id = request.nextUrl.searchParams.get("id");
  if (!id) {
    return apiError("Availability id is required.");
  }

  // Verify the availability slot belongs to this provider
  if (profile.role === "provider") {
    const providerQuery = await getProviderByUserId(supabase, user.id);
    if (!providerQuery.data) {
      return apiError("Provider profile missing.", 400);
    }
    const slotCheck = await supabase
      .from("provider_availability")
      .select("id, provider_id")
      .eq("id", id)
      .maybeSingle();
    const slot = slotCheck.data as { id: string; provider_id: string } | null;
    if (!slot || slot.provider_id !== providerQuery.data.id) {
      return apiError("Forbidden.", 403);
    }
  }

  const { data, error } = await deleteProviderAvailability(supabase, id);
  if (error || !data) {
    return apiError(error?.message ?? "Unable to delete availability.", 400);
  }

  await createAuditLog("provider_availability.deleted", "provider_availability", data.id, { provider_id: data.provider_id });
  refreshPortalPaths(["/provider/appointments", "/patient/appointments"]);
  return apiSuccess(data);
}
