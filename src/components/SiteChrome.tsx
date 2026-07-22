import type { ReactNode } from "react";
import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";
import { WhatsAppFloat } from "./WhatsAppFloat";
import { AccessibilityMenu } from "./AccessibilityMenu";
import { CallPill } from "./CallPill";

export function SiteChrome({ children }: { children: ReactNode }) {
  return (
    <div dir="rtl" lang="he" className="flex min-h-screen flex-col bg-background">
      <a href="#main-content" className="skip-link">דלג לתוכן הראשי</a>
      <SiteHeader />
      <main id="main-content" tabIndex={-1} className="flex-1 focus:outline-none">
        {children}
      </main>
      <SiteFooter />
      <WhatsAppFloat />
      <CallPill />
      <AccessibilityMenu />
    </div>
  );
}

export default SiteChrome;
