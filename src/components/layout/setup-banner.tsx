import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function SetupBanner() {
  return (
    <Card className="border-primary/20 bg-primary-soft p-8">
      <h2 className="font-display text-3xl font-semibold text-ink">Connect Supabase to activate the live product</h2>
      <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">
        Add `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` to `.env.local`, apply the SQL migration in `supabase/migrations`, then restart the Next.js app.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link className={buttonVariants({ variant: "primary" })} href="/signup">
          Open signup
        </Link>
        <Link className={buttonVariants({ variant: "secondary" })} href="/contact">
          Get implementation help
        </Link>
      </div>
    </Card>
  );
}
