import type { SchemeRecord } from "./types";

export type SchemeDetailMeta = {
  primaryBenefit: string;
  delivery: string;
  reach: string;
  processingDays: string;
  challenge: string;
  insight: string;
  insightBy: string;
  impactStats: { value: string; label: string; note: string }[];
  impactBullets: string[];
  faqs: { q: string; a: string }[];
};

const META: Record<string, Partial<SchemeDetailMeta>> = {
  "pm-kisan": {
    primaryBenefit: "₹6,000 / year",
    reach: "11 Cr+",
    processingDays: "15–30 days",
    challenge:
      "Millions of small farmers miss PM-KISAN instalments because land records, Aadhaar seeding, and bank details are incomplete — especially in remote blocks.",
    insight:
      "You don't need a smartphone to benefit. A CSC visit with Aadhaar and passbook is often enough to register and receive the first instalment.",
    insightBy: "Sahay Field Pilot — Bihar & UP",
    impactStats: [
      { value: "11 Cr+", label: "Registered farmers", note: "National PM-KISAN database" },
      { value: "₹2,000", label: "Per instalment", note: "3 times every year" },
      { value: "90%", label: "DBT success", note: "When bank is Aadhaar-linked" },
    ],
    impactBullets: [
      "**₹6,000 annual support** paid directly to the farmer's bank account",
      "**No middlemen** — amount credited in three equal instalments",
      "**CSC & online portal** both accept applications with land ROR",
      "Track status using **Farmer ID** on the PM-KISAN portal",
    ],
    faqs: [
      { q: "Can tenant farmers apply?", a: "Generally, the scheme targets land-owning farmer families. Tenant farmers should check state-specific rules or related labour schemes like MGNREGA." },
      { q: "What if my land is not in my name?", a: "You'll need valid land records (ROR) matching your Aadhaar. Visit the nearest CSC for correction before applying." },
      { q: "How long until the first payment?", a: "After successful verification, the first instalment usually arrives within 15–30 days in the next payment cycle." },
    ],
  },
  "ayushman-bharat": {
    primaryBenefit: "₹5L / family / year",
    reach: "50 Cr+",
    processingDays: "Instant card",
    challenge:
      "Eligible families often don't know they're on SECC lists or confuse Ayushman with state health cards — leading to denied treatment at hospitals.",
    insight:
      "Carry Aadhaar and ration card to the nearest Ayushman Mitra. Eligibility can be verified at the hospital desk in minutes.",
    insightBy: "Sahay Health Desk Pilot",
    impactStats: [
      { value: "₹5L", label: "Cover per family", note: "Per year at empanelled hospitals" },
      { value: "50 Cr+", label: "Beneficiaries", note: "PM-JAY national reach" },
      { value: "24K+", label: "Hospitals", note: "Empanelled nationwide" },
    ],
    impactBullets: [
      "**Cashless treatment** for listed procedures at empanelled hospitals",
      "**No premium** for eligible SECC / ration card families",
      "Covers **pre-existing conditions** from day one",
      "Download **Ayushman card** via PM-JAY portal or CSC",
    ],
    faqs: [
      { q: "Is it free?", a: "Yes for eligible families identified under SECC or state criteria. There is no premium for covered beneficiaries." },
      { q: "Which hospitals?", a: "Only empanelled public and private hospitals under PM-JAY. Ask for Ayushman Bharat at admission." },
      { q: "Can I add family members?", a: "Coverage is per eligible family as defined in SECC. Verify your family ID on the PM-JAY portal." },
    ],
  },
  "ujjwala-yojana": {
    primaryBenefit: "Free LPG connection",
    reach: "10 Cr+",
    processingDays: "7–14 days",
    challenge:
      "Women in BPL households still cook on firewood — Ujjwala applications stall when BPL ration cards or address proofs are outdated.",
    insight:
      "The application must be in a woman's name. Updating ration card BPL status at the fair-price shop first saves a second CSC trip.",
    insightBy: "Sahay — Woman HoH cohort",
    impactStats: [
      { value: "10 Cr+", label: "Connections", note: "Since scheme launch" },
      { value: "₹0", label: "Connection fee", note: "For eligible BPL women" },
      { value: "1st", label: "Refill subsidy", note: "Often subsidised initially" },
    ],
    impactBullets: [
      "**Free gas connection** for eligible BPL women above 18",
      "Reduces **indoor air pollution** from traditional chulhas",
      "Apply via **LMV distributor** or online Ujjwala portal",
    ],
    faqs: [
      { q: "Who can apply?", a: "Adult women from BPL households without an existing LPG connection in the family." },
      { q: "What documents?", a: "BPL ration card, Aadhaar, address proof, and bank details for subsidy transfer." },
      { q: "Is cylinder free forever?", a: "Connection is subsidised; subsequent refills follow current government LPG subsidy rules." },
    ],
  },
};

function defaultMeta(scheme: SchemeRecord): SchemeDetailMeta {
  const benefit = scheme.benefits.en[0] ?? scheme.desc.en;
  return {
    primaryBenefit: benefit.slice(0, 24),
    delivery: "CSC & Online portal",
    reach: "Pan-India",
    processingDays: "14–30 days",
    challenge: `Many eligible citizens miss ${scheme.name} because they don't know the criteria, required documents, or where to apply.`,
    insight: `Start with Aadhaar and bank passbook — most ${scheme.name} rejections are fixable document issues, not eligibility.`,
    insightBy: "Sahay Scheme Desk",
    impactStats: [
      { value: "10+", label: "Core documents", note: "Typically Aadhaar-led" },
      { value: "CSC", label: "Nearest apply point", note: "Common Service Centre" },
      { value: "DBT", label: "Delivery mode", note: "Direct Benefit Transfer" },
    ],
    impactBullets: scheme.benefits.en.map((b) => `**${b}**`),
    faqs: [
      { q: `Who is eligible for ${scheme.name}?`, a: scheme.eligibility.en.join(" ") },
      { q: "What documents do I need?", a: scheme.documents.en.join(", ") },
      { q: "How do I apply?", a: scheme.apply.en.join(" Then, ") },
      { q: "Where is this data from?", a: "All details are grounded in MyScheme.gov.in. Always verify on the official portal before applying." },
    ],
  };
}

export function getSchemeDetailMeta(scheme: SchemeRecord): SchemeDetailMeta {
  const base = defaultMeta(scheme);
  const extra = META[scheme.id];
  if (!extra) return base;
  return { ...base, ...extra };
}
