import type { PropsWithChildren, ReactNode } from "react";

import { Footer } from "@/components/layout/footer";
import { MarketingNavbar } from "@/components/layout/marketing-navbar";

export function MarketingLayout({ children, cta }: PropsWithChildren<{ cta?: ReactNode }>) {
  return (
    <div className="min-h-screen">
      <MarketingNavbar />
      <main>{children}</main>
      {cta ? <div className="page-shell pb-20">{cta}</div> : null}
      <Footer />
    </div>
  );
}
