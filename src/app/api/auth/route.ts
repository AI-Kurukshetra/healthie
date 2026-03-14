import { apiSuccess } from "@/lib/api";

export async function GET() {
  return apiSuccess({
    endpoints: ["/api/auth/signup", "/api/auth/login", "/api/auth/logout"]
  });
}

