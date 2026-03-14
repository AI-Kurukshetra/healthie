import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const MEDICAL_DOCUMENT_BUCKET = "medical-documents";

function sanitizeFileName(fileName: string) {
  return fileName
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function uploadMedicalDocument({
  file,
  patientUserId,
  recordId
}: {
  file: File;
  patientUserId: string;
  recordId: string;
}) {
  try {
    const client = createSupabaseAdminClient();
    const safeName = sanitizeFileName(file.name || "document");
    const path = `${patientUserId}/${recordId}/${Date.now()}-${safeName || "document"}`;

    const { error } = await client.storage.from(MEDICAL_DOCUMENT_BUCKET).upload(path, file, {
      contentType: file.type || "application/octet-stream",
      upsert: false
    });

    if (error) {
      return {
        data: null,
        error: new Error(error.message)
      };
    }

    return {
      data: path,
      error: null
    };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error("Unable to upload medical document.")
    };
  }
}

export async function createMedicalDocumentSignedUrl(path: string, expiresIn = 60 * 60) {
  try {
    const client = createSupabaseAdminClient();
    const { data, error } = await client.storage.from(MEDICAL_DOCUMENT_BUCKET).createSignedUrl(path, expiresIn);

    if (error) {
      return null;
    }

    return data.signedUrl;
  } catch {
    return null;
  }
}
