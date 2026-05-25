import JsonLd from "./JsonLd";
import { CONTACT_EMAIL, SITE_DESCRIPTION, SITE_NAME, absoluteUrl } from "@/lib/seo/site";

export default function OrganizationJsonLd() {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "EducationalOrganization",
        name: SITE_NAME,
        description: SITE_DESCRIPTION,
        url: absoluteUrl("/"),
        logo: absoluteUrl("/logo/logo.png"),
        image: absoluteUrl("/logo/logo.png"),
        address: {
          "@type": "PostalAddress",
          addressCountry: "KH",
          addressLocality: "Phnom Penh",
        },
        contactPoint: {
          "@type": "ContactPoint",
          contactType: "customer service",
          email: CONTACT_EMAIL,
          availableLanguage: ["km", "en"],
        },
      }}
    />
  );
}
