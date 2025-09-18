"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

export function DynamicMetadata() {
  const searchParams = useSearchParams();
  const role = searchParams.get("role");

  useEffect(() => {
    // Remove existing meta tags that we want to override
    const existingMetaTags = [
      'meta[property="og:title"]',
      'meta[property="og:description"]',
      'meta[property="og:url"]',
      'meta[name="twitter:title"]',
      'meta[name="twitter:description"]',
      'meta[name="description"]',
    ];

    existingMetaTags.forEach((selector) => {
      const element = document.querySelector(selector);
      if (element && element.getAttribute("data-dynamic") === "true") {
        element.remove();
      }
    });

    // Add role-specific meta tags
    const head = document.head;

    if (role === "beveiligers") {
      // Update title
      document.title =
        "ZZP Beveiliger Worden | €28+/uur | WPBR Platform | SecuryFlex";

      // Add description
      const description = document.createElement("meta");
      description.name = "description";
      description.content =
        "🔥 Word ZZP beveiliger! WPBR geverifieerd platform, GPS check-in, 24u betaling. 2.847+ beveiligers verdienen €28+/uur. Start vandaag!";
      description.setAttribute("data-dynamic", "true");
      head.appendChild(description);

      // Add OG tags
      const ogTitle = document.createElement("meta");
      ogTitle.property = "og:title";
      ogTitle.content = "ZZP Beveiliger Worden | €28+/uur | WPBR Platform";
      ogTitle.setAttribute("data-dynamic", "true");
      head.appendChild(ogTitle);

      const ogDescription = document.createElement("meta");
      ogDescription.property = "og:description";
      ogDescription.content =
        "🔥 Word ZZP beveiliger! WPBR platform, GPS check-in, 24u betaling. 2.847+ beveiligers verdienen €28+/uur. Start vandaag!";
      ogDescription.setAttribute("data-dynamic", "true");
      head.appendChild(ogDescription);

      const ogUrl = document.createElement("meta");
      ogUrl.property = "og:url";
      ogUrl.content = "https://securyflex.nl/?role=beveiligers";
      ogUrl.setAttribute("data-dynamic", "true");
      head.appendChild(ogUrl);
    } else if (role === "beveiligingsbedrijven") {
      // Update title
      document.title =
        "Beveiligingsbedrijf Platform | Toegang tot 2847+ Beveiligers | SecuryFlex";

      // Add description
      const description = document.createElement("meta");
      description.name = "description";
      description.content =
        "🚀 Groei uw beveiligingsbedrijf! Toegang tot 2847+ WPBR beveiligers, automatische planning, live tracking. Vraag demo aan!";
      description.setAttribute("data-dynamic", "true");
      head.appendChild(description);

      // Add OG tags
      const ogTitle = document.createElement("meta");
      ogTitle.property = "og:title";
      ogTitle.content =
        "Beveiligingsbedrijf Platform | Toegang tot 2847+ Beveiligers";
      ogTitle.setAttribute("data-dynamic", "true");
      head.appendChild(ogTitle);

      const ogDescription = document.createElement("meta");
      ogDescription.property = "og:description";
      ogDescription.content =
        "🚀 Groei uw beveiligingsbedrijf! Toegang tot 2847+ WPBR beveiligers, automatische planning, live tracking. Demo aanvragen!";
      ogDescription.setAttribute("data-dynamic", "true");
      head.appendChild(ogDescription);

      const ogUrl = document.createElement("meta");
      ogUrl.property = "og:url";
      ogUrl.content = "https://securyflex.nl/?role=beveiligingsbedrijven";
      ogUrl.setAttribute("data-dynamic", "true");
      head.appendChild(ogUrl);
    } else if (role === "opdrachtgevers") {
      // Update title
      document.title =
        "Beveiliging Inhuren | Binnen 5 Min | Live Tracking | SecuryFlex";

      // Add description
      const description = document.createElement("meta");
      description.name = "description";
      description.content =
        "⚡ Professionele beveiliging binnen 5 minuten! WPBR gecertificeerd, transparante prijzen, live GPS tracking. 500+ tevreden klanten.";
      description.setAttribute("data-dynamic", "true");
      head.appendChild(description);

      // Add OG tags
      const ogTitle = document.createElement("meta");
      ogTitle.property = "og:title";
      ogTitle.content = "Beveiliging Inhuren | Binnen 5 Min | Live Tracking";
      ogTitle.setAttribute("data-dynamic", "true");
      head.appendChild(ogTitle);

      const ogDescription = document.createElement("meta");
      ogDescription.property = "og:description";
      ogDescription.content =
        "⚡ Professionele beveiliging binnen 5 minuten! WPBR gecertificeerd, transparante prijzen, live GPS tracking.";
      ogDescription.setAttribute("data-dynamic", "true");
      head.appendChild(ogDescription);

      const ogUrl = document.createElement("meta");
      ogUrl.property = "og:url";
      ogUrl.content = "https://securyflex.nl/?role=opdrachtgevers";
      ogUrl.setAttribute("data-dynamic", "true");
      head.appendChild(ogUrl);
    }

    // Update canonical URL to include role parameter
    if (role) {
      const canonical = document.querySelector('link[rel="canonical"]');
      if (canonical) {
        canonical.setAttribute("href", `https://securyflex.nl/?role=${role}`);
      }
    }
  }, [role]);

  return null; // This component doesn't render anything visible
}
