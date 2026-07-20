import { FaWhatsapp } from "react-icons/fa";
import { siteConfig } from "@/lib/site-config";

export function WhatsAppFloat() {
  const num = siteConfig.whatsapp.replace(/\D/g, "");
  return (
    <a
      href={`https://wa.me/${num}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="צרו קשר בוואטסאפ"
      className="fixed bottom-5 left-5 z-40 flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#25D366]/40"
      style={{ backgroundColor: "#25D366" }}
    >
      <FaWhatsapp className="h-8 w-8 text-white" aria-hidden="true" />
      <span className="sr-only">WhatsApp</span>
    </a>
  );
}

export default WhatsAppFloat;
