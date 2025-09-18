"use client";

import Script from "next/script";

interface SchemaMarkupProps {
  type: "organization" | "service" | "faq" | "jobPosting" | "localBusiness";
  data?: any;
}

export function SchemaMarkup({ type, data }: SchemaMarkupProps) {
  const getSchemaData = () => {
    const baseUrl = "https://securyflex.nl";

    switch (type) {
      case "organization":
        return {
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "SecuryFlex",
          alternateName: "SecuryFlex B.V.",
          url: baseUrl,
          logo: `${baseUrl}/logo-website-securyflex.svg`,
          description:
            "WPBR geverifieerd platform voor beveiligers. GPS check-in, 24u betaling gegarandeerd. Verdien gemiddeld €2.400 extra per maand.",
          foundingDate: "2024",
          legalName: "SecuryFlex B.V.",
          taxID: "87654321",
          address: {
            "@type": "PostalAddress",
            addressCountry: "NL",
            addressLocality: "Amsterdam",
          },
          contactPoint: {
            "@type": "ContactPoint",
            telephone: "+31-20-123-4567",
            contactType: "customer service",
            availableLanguage: "Dutch",
            email: "support@securyflex.nl",
          },
          sameAs: [
            "https://www.linkedin.com/company/securyflex",
            "https://twitter.com/securyflex",
          ],
          industry: "Security Services",
          numberOfEmployees: "50-100",
          keywords: [
            "beveiliging",
            "beveiliger",
            "zzp",
            "wpbr",
            "security",
            "beveiligingsbedrijf",
          ],
        };

      case "service":
        return {
          "@context": "https://schema.org",
          "@type": "Service",
          name: "Beveiligingsdiensten Platform",
          description:
            "Platform dat beveiligers, beveiligingsbedrijven en opdrachtgevers verbindt voor flexibele beveiligingsopdrachten",
          provider: {
            "@type": "Organization",
            name: "SecuryFlex",
          },
          serviceType: "Security Services",
          availableChannel: {
            "@type": "ServiceChannel",
            serviceUrl: baseUrl,
            serviceSmsNumber: "+31-20-123-4567",
            servicePhone: "+31-20-123-4567",
          },
          areaServed: {
            "@type": "Country",
            name: "Netherlands",
          },
          audience: {
            "@type": "Audience",
            audienceType: "Security Guards, Security Companies, Businesses",
          },
          category: ["Security Services", "Platform", "Marketplace"],
          offers: [
            {
              "@type": "Offer",
              name: "Voor Beveiligers",
              description:
                "Vind flexibele beveiligingsopdrachten, verdien €28+ per uur, betaling binnen 24 uur",
              category: "ZZP Beveiliging",
            },
            {
              "@type": "Offer",
              name: "Voor Beveiligingsbedrijven",
              description:
                "Toegang tot 2847+ beveiligers, automatische planning, real-time monitoring",
              category: "B2B Platform",
            },
            {
              "@type": "Offer",
              name: "Voor Opdrachtgevers",
              description:
                "Beveiliging binnen 5 minuten, transparante prijzen, live GPS tracking",
              category: "Beveiligingsdiensten",
            },
          ],
        };

      case "localBusiness":
        return {
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          name: "SecuryFlex",
          image: `${baseUrl}/logo-website-securyflex.svg`,
          address: {
            "@type": "PostalAddress",
            streetAddress: "Hoofdstraat 123",
            addressLocality: "Amsterdam",
            postalCode: "1000 AB",
            addressCountry: "NL",
          },
          geo: {
            "@type": "GeoCoordinates",
            latitude: 52.3676,
            longitude: 4.9041,
          },
          url: baseUrl,
          telephone: "+31-20-123-4567",
          email: "info@securyflex.nl",
          priceRange: "€€",
          openingHours: "Mo-Fr 09:00-18:00",
          paymentAccepted: "Cash, Credit Card, Bank Transfer",
          currenciesAccepted: "EUR",
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: "4.8",
            reviewCount: "287",
            bestRating: "5",
            worstRating: "1",
          },
          review: [
            {
              "@type": "Review",
              author: {
                "@type": "Person",
                name: "Mark van den Berg",
              },
              reviewRating: {
                "@type": "Rating",
                ratingValue: "5",
              },
              reviewBody:
                "Van €1.800 naar €3.200 per maand. GPS check-in werkt perfect, betaling altijd op tijd.",
            },
          ],
        };

      case "faq":
        return {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: [
            {
              "@type": "Question",
              name: "Hoeveel kan ik verdienen als beveiliger?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Gemiddeld verdien je €28 per uur, met specialisaties tot €35 per uur. Fulltime beveiligers verdienen €3.200+ per maand. Je wordt binnen 24 uur uitbetaald.",
              },
            },
            {
              "@type": "Question",
              name: "Hoe snel kan ik beveiliging regelen?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Binnen 5 minuten voor standaard opdrachten. Voor complexe opdrachten binnen 30 minuten. Direct beschikbaar 24/7.",
              },
            },
            {
              "@type": "Question",
              name: "Welke documenten heb ik nodig?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Je hebt een geldig WPBR-nummer nodig en een Nederlandse ID. Wij verifiëren je documenten binnen 2 uur tijdens kantooruren.",
              },
            },
            {
              "@type": "Question",
              name: "Hoe werkt GPS check-in?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Open de app op locatie, druk op 'Check In' en je GPS-locatie wordt automatisch geverifieerd. Dit dient als bewijs voor gewerkte uren.",
              },
            },
          ],
        };

      case "jobPosting":
        return data
          ? {
              "@context": "https://schema.org",
              "@type": "JobPosting",
              title: data.title || "Beveiligingsopdracht",
              description: data.description,
              datePosted: data.datePosted || new Date().toISOString(),
              employmentType: "CONTRACTOR",
              hiringOrganization: {
                "@type": "Organization",
                name: "SecuryFlex",
              },
              jobLocation: {
                "@type": "Place",
                address: {
                  "@type": "PostalAddress",
                  addressLocality: data.location || "Nederland",
                  addressCountry: "NL",
                },
              },
              baseSalary: {
                "@type": "MonetaryAmount",
                currency: "EUR",
                value: {
                  "@type": "QuantitativeValue",
                  value: data.hourlyRate || 28,
                  unitText: "HOUR",
                },
              },
              qualifications: "WPBR gecertificeerd",
              industry: "Security Services",
            }
          : {};

      default:
        return {};
    }
  };

  const schemaData = getSchemaData();

  if (!schemaData || Object.keys(schemaData).length === 0) {
    return null;
  }

  return (
    <Script
      id={`schema-${type}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schemaData),
      }}
    />
  );
}

// Wrapper component voor multiple schema types
export function HomePageSchema() {
  return (
    <>
      <SchemaMarkup type="organization" />
      <SchemaMarkup type="service" />
      <SchemaMarkup type="localBusiness" />
      <SchemaMarkup type="faq" />
    </>
  );
}

// Role-specific schema wrapper
export function RoleSpecificSchema({ role }: { role: string | null }) {
  if (role === "beveiligers") {
    return (
      <>
        <SchemaMarkup type="organization" />
        <SchemaMarkup
          type="jobPosting"
          data={{
            title: "ZZP Beveiliger Vacatures",
            description:
              "Flexibele beveiligingsopdrachten voor ZZP beveiligers. WPBR vereist, €28+ per uur, betaling binnen 24 uur.",
            location: "Nederland",
            hourlyRate: 28,
            datePosted: new Date().toISOString(),
          }}
        />
        <SchemaMarkup type="service" />
        <SchemaMarkup type="faq" />
      </>
    );
  }

  if (role === "beveiligingsbedrijven") {
    return (
      <>
        <SchemaMarkup type="organization" />
        <SchemaMarkup type="service" />
        <SchemaMarkup type="localBusiness" />
      </>
    );
  }

  if (role === "opdrachtgevers") {
    return (
      <>
        <SchemaMarkup type="organization" />
        <SchemaMarkup type="service" />
        <SchemaMarkup type="localBusiness" />
        <SchemaMarkup type="faq" />
      </>
    );
  }

  // Default schema (no role)
  return <HomePageSchema />;
}
