import type { ReactNode } from "react";
import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";
import { WhatsAppFloat } from "./WhatsAppFloat";
import { AccessibilityWidget } from "./AccessibilityWidget";
import { CallPill } from "./CallPill";

export function SiteChrome({ children }: { children: ReactNode }) {
  return (
    <div dir="rtl" lang="he" className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
      <WhatsAppFloat />
      <CallPill />
      <AccessibilityWidget />
    </div>
  );
}

export default SiteChrome;
