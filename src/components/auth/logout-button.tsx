"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { createBrowserSupabaseClient } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";

export function LogoutButton({ className }: { className?: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    if (loading) {
      return;
    }

    setLoading(true);

    try {
      const supabase = createBrowserSupabaseClient();
      await supabase.auth.signOut();
    } finally {
      document.cookie = "sb-role=; Path=/; Max-Age=0; SameSite=Lax";
      router.replace("/login");
      router.refresh();
      setLoading(false);
    }
  };

  return (
    <Button className={className} disabled={loading} onClick={handleLogout} type="button" variant="secondary">
      {loading ? "Signing out..." : "Sign out"}
    </Button>
  );
}
