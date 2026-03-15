export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";

import { createAuditLog, fireAndForget, getAdminClientOrFallback, refreshPortalPaths, requireApiUser } from "@/app/api/_utils/helpers";
import { apiError, apiSuccess } from "@/lib/api";
import { apiLimiter, getClientKey, rateLimitResponse, writeLimiter } from "@/lib/rate-limit";
import { createClinicalNote, createMedicalRecord, listMedicalRecords } from "@/repositories/recordRepository";
import { getPatientByUserId, getProviderByUserId } from "@/repositories/userRepository";
import { uploadMedicalDocument } from "@/services/storageService";
import { clinicalNoteSchema } from "@/validators/clinical-note";
import { medicalRecordSchema } from "@/validators/medical-record";

async function parseMedicalRecordRequest(request: NextRequest) {
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData();
    const document = formData.get("document");

    return {
      body: {
        patient_id: String(formData.get("patient_id") ?? ""),
        provider_id: formData.get("provider_id") ? String(formData.get("provider_id")) : null,
        diagnosis: String(formData.get("diagnosis") ?? ""),
        notes: String(formData.get("notes") ?? ""),
        treatment_plan: formData.get("treatment_plan") ? String(formData.get("treatment_plan")) : null,
        document_path: null
      },
      document: document instanceof File && document.size > 0 ? document : null
    };
  }

  const body = await request.json();
  return {
    body,
    document: null as File | null
  };
}

export async function GET(request: NextRequest) {
  const rl = apiLimiter.check(getClientKey(request));
  if (!rl.allowed) return rateLimitResponse(rl);

  const { supabase, user, profile } = await requireApiUser();
  if (!user || !profile) {
    return apiError("Unauthorized.", 401);
  }

  if (profile.role === "patient") {
    const patientQuery = await getPatientByUserId(supabase, user.id);
    if (!patientQuery.data) return apiSuccess([]);
    const { data, error } = await listMedicalRecords(supabase, patientQuery.data.id);
    if (error) return apiError(error.message, 400);
    return apiSuccess(data ?? []);
  }

  // Providers and admins can list all records
  const readClient = getAdminClientOrFallback(supabase);
  const { data, error } = await listMedicalRecords(readClient);
  if (error) return apiError(error.message, 400);
  return apiSuccess(data ?? []);
}

export async function POST(request: NextRequest) {
  const rl = writeLimiter.check(getClientKey(request));
  if (!rl.allowed) return rateLimitResponse(rl);

  const { supabase, user, profile } = await requireApiUser();
  if (!user || !profile) {
    return apiError("Unauthorized.", 401);
  }

  const client = getAdminClientOrFallback(supabase);
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    const body = await request.json();

    if (body.type === "clinical_note") {
      const parsed = clinicalNoteSchema.safeParse(body);
      if (!parsed.success) {
        return apiError(parsed.error.issues[0]?.message ?? "Invalid clinical note payload.");
      }

      if (profile.role === "provider") {
        const providerQuery = await getProviderByUserId(supabase, user.id);
        const provider = providerQuery.data;

        if (!provider) {
          return apiError("Provider profile missing.", 400);
        }

        if (parsed.data.provider_id !== provider.id) {
          return apiError("Provider mismatch.", 403);
        }

        const appointmentQuery = await supabase
          .from("appointments")
          .select("id, patient_id")
          .eq("id", parsed.data.appointment_id)
          .eq("provider_id", provider.id)
          .maybeSingle();

        const appointment = appointmentQuery.data as { id: string; patient_id: string } | null;

        if (!appointment) {
          return apiError("Appointment is not assigned to this provider.", 403);
        }

        if (appointment.patient_id !== parsed.data.patient_id) {
          return apiError("Patient mismatch for this appointment.", 400);
        }
      }

      const { data, error } = await createClinicalNote(client, parsed.data);
      if (error || !data) {
        return apiError(error?.message ?? "Unable to create clinical note.", 400);
      }

      fireAndForget(createAuditLog("clinical_note.created", "clinical_notes", data.id, { appointment_id: data.appointment_id }));
      refreshPortalPaths(["/provider/notes", "/patient/records", "/admin/notes"]);
      return apiSuccess(data, { status: 201 });
    }

    const parsed = medicalRecordSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(parsed.error.issues[0]?.message ?? "Invalid medical record payload.");
    }

    if (profile.role === "patient") {
      return apiError("Patients cannot create medical records.", 403);
    }

    let providerId = parsed.data.provider_id ?? null;

    if (profile.role === "provider") {
      const providerQuery = await getProviderByUserId(supabase, user.id);
      const provider = providerQuery.data;

      if (!provider) {
        return apiError("Provider profile missing.", 400);
      }

      providerId = provider.id;

      const relationshipQuery = await supabase
        .from("appointments")
        .select("id")
        .eq("provider_id", provider.id)
        .eq("patient_id", parsed.data.patient_id)
        .limit(1);

      if (!relationshipQuery.data || relationshipQuery.data.length === 0) {
        return apiError("Patient is not assigned to this provider.", 403);
      }
    }

    const { data, error } = await createMedicalRecord(client, {
      ...parsed.data,
      provider_id: providerId
    });

    if (error || !data) {
      return apiError(error?.message ?? "Unable to create medical record.", 400);
    }

    fireAndForget(createAuditLog("medical_record.created", "medical_records", data.id, { patient_id: data.patient_id }));
    refreshPortalPaths(["/patient/records", "/provider/records", "/admin/records"]);
    return apiSuccess(data, { status: 201 });
  }

  const { body, document } = await parseMedicalRecordRequest(request);
  const parsed = medicalRecordSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(parsed.error.issues[0]?.message ?? "Invalid medical record payload.");
  }

  if (profile.role === "patient") {
    return apiError("Patients cannot create medical records.", 403);
  }

  let providerId = parsed.data.provider_id ?? null;

  if (profile.role === "provider") {
    // Run provider lookup + relationship check in parallel
    const providerQuery = await getProviderByUserId(supabase, user.id);
    const provider = providerQuery.data;

    if (!provider) {
      return apiError("Provider profile missing.", 400);
    }

    providerId = provider.id;

    const relationshipQuery = await supabase
      .from("appointments")
      .select("id")
      .eq("provider_id", provider.id)
      .eq("patient_id", parsed.data.patient_id)
      .limit(1);

      if (!relationshipQuery.data || relationshipQuery.data.length === 0) {
        return apiError("Patient is not assigned to this provider.", 403);
      }
  }

  const patientQuery = await client
    .from("patients")
    .select("id, user_id")
    .eq("id", parsed.data.patient_id)
    .maybeSingle();

  const patient = patientQuery.data as { id: string; user_id: string } | null;
  if (!patient) {
    return apiError("Patient not found.", 400);
  }

  const recordId = crypto.randomUUID();
  let documentPath: string | null = null;

  if (document) {
    const upload = await uploadMedicalDocument({
      file: document,
      patientUserId: patient.user_id,
      recordId
    });

    if (upload.error) {
      return apiError(upload.error.message, 400);
    }

    documentPath = upload.data;
  }

  const { data, error } = await createMedicalRecord(client, {
    id: recordId,
    ...parsed.data,
    provider_id: providerId,
    document_path: documentPath
  });

  if (error || !data) {
    return apiError(error?.message ?? "Unable to create medical record.", 400);
  }

  fireAndForget(
    createAuditLog("medical_record.created", "medical_records", data.id, {
      patient_id: data.patient_id,
      has_document: Boolean(documentPath)
    })
  );
  refreshPortalPaths(["/patient/records", "/provider/records", "/admin/records"]);
  return apiSuccess(data, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const rl = writeLimiter.check(getClientKey(request));
  if (!rl.allowed) return rateLimitResponse(rl);

  const { supabase, user, profile } = await requireApiUser();
  if (!user || !profile) {
    return apiError("Unauthorized.", 401);
  }

  const client = getAdminClientOrFallback(supabase);
  const body = await request.json();
  if (!body.id || !body.type) {
    return apiError("Record id and type are required.");
  }

  if (body.type === "clinical_note") {
    const existingQuery = await client.from("clinical_notes").select("id, provider_id").eq("id", body.id).maybeSingle();
    const existing = existingQuery.data as { id: string; provider_id: string } | null;
    if (!existing) {
      return apiError("Clinical note not found.", 404);
    }

    if (profile.role === "provider") {
      const providerQuery = await getProviderByUserId(supabase, user.id);
      if (!providerQuery.data || providerQuery.data.id !== existing.provider_id) {
        return apiError("Forbidden.", 403);
      }
    } else if (profile.role !== "admin") {
      return apiError("Forbidden.", 403);
    }

    const payload = {
      appointment_id: body.appointment_id,
      provider_id: body.provider_id,
      patient_id: body.patient_id,
      subjective: body.subjective,
      objective: body.objective,
      assessment: body.assessment,
      plan: body.plan
    };
    const parsed = clinicalNoteSchema.safeParse(payload);
    if (!parsed.success) {
      return apiError(parsed.error.issues[0]?.message ?? "Invalid clinical note payload.");
    }

    const { data, error } = await (client.from("clinical_notes") as any)
      .update(parsed.data)
      .eq("id", body.id)
      .select("*")
      .single();

    if (error) {
      return apiError(error.message, 400);
    }

    fireAndForget(createAuditLog("clinical_note.updated", "clinical_notes", data.id, {}));
    refreshPortalPaths(["/provider/notes", "/patient/records", "/admin/notes"]);
    return apiSuccess(data);
  }

  if (body.type === "medical_record") {
    const existingQuery = await client.from("medical_records").select("id, provider_id").eq("id", body.id).maybeSingle();
    const existing = existingQuery.data as { id: string; provider_id: string | null } | null;
    if (!existing) {
      return apiError("Medical record not found.", 404);
    }

    if (profile.role === "provider") {
      const providerQuery = await getProviderByUserId(supabase, user.id);
      if (!providerQuery.data || providerQuery.data.id !== existing.provider_id) {
        return apiError("Forbidden.", 403);
      }
    } else if (profile.role !== "admin") {
      return apiError("Forbidden.", 403);
    }

    const payload = {
      patient_id: body.patient_id,
      provider_id: body.provider_id || null,
      diagnosis: body.diagnosis,
      notes: body.notes,
      treatment_plan: body.treatment_plan || null,
      document_path: body.document_path || null
    };
    const parsed = medicalRecordSchema.safeParse(payload);
    if (!parsed.success) {
      return apiError(parsed.error.issues[0]?.message ?? "Invalid medical record payload.");
    }

    const { data, error } = await (client.from("medical_records") as any)
      .update(parsed.data)
      .eq("id", body.id)
      .select("*")
      .single();

    if (error) {
      return apiError(error.message, 400);
    }

    fireAndForget(createAuditLog("medical_record.updated", "medical_records", data.id, {}));
    refreshPortalPaths(["/patient/records", "/provider/records", "/admin/records"]);
    return apiSuccess(data);
  }

  return apiError("Unsupported record type.", 400);
}

export async function DELETE(request: NextRequest) {
  const rl = writeLimiter.check(getClientKey(request));
  if (!rl.allowed) return rateLimitResponse(rl);

  const { supabase, user, profile } = await requireApiUser();
  if (!user || !profile) {
    return apiError("Unauthorized.", 401);
  }

  const client = getAdminClientOrFallback(supabase);
  const body = await request.json();
  if (!body.id || !body.type) {
    return apiError("Record id and type are required.");
  }

  if (body.type === "clinical_note") {
    const existingQuery = await client.from("clinical_notes").select("id, provider_id").eq("id", body.id).maybeSingle();
    const existing = existingQuery.data as { id: string; provider_id: string } | null;
    if (!existing) {
      return apiError("Clinical note not found.", 404);
    }

    if (profile.role === "provider") {
      const providerQuery = await getProviderByUserId(supabase, user.id);
      if (!providerQuery.data || providerQuery.data.id !== existing.provider_id) {
        return apiError("Forbidden.", 403);
      }
    } else if (profile.role !== "admin") {
      return apiError("Forbidden.", 403);
    }

    const { error } = await client.from("clinical_notes").delete().eq("id", body.id);
    if (error) {
      return apiError(error.message, 400);
    }

    fireAndForget(createAuditLog("clinical_note.deleted", "clinical_notes", String(body.id), {}));
    refreshPortalPaths(["/provider/notes", "/patient/records", "/admin/notes"]);
    return apiSuccess({ id: body.id });
  }

  if (body.type === "medical_record") {
    const existingQuery = await client.from("medical_records").select("id, provider_id").eq("id", body.id).maybeSingle();
    const existing = existingQuery.data as { id: string; provider_id: string | null } | null;
    if (!existing) {
      return apiError("Medical record not found.", 404);
    }

    if (profile.role === "provider") {
      const providerQuery = await getProviderByUserId(supabase, user.id);
      if (!providerQuery.data || providerQuery.data.id !== existing.provider_id) {
        return apiError("Forbidden.", 403);
      }
    } else if (profile.role !== "admin") {
      return apiError("Forbidden.", 403);
    }

    const { error } = await client.from("medical_records").delete().eq("id", body.id);
    if (error) {
      return apiError(error.message, 400);
    }

    fireAndForget(createAuditLog("medical_record.deleted", "medical_records", String(body.id), {}));
    refreshPortalPaths(["/patient/records", "/provider/records", "/admin/records"]);
    return apiSuccess({ id: body.id });
  }

  return apiError("Unsupported record type.", 400);
}
