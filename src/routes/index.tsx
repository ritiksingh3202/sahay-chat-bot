import { motion } from "motion/react";
import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  MessageSquare,
  Search,
  ListChecks,
  Mic,
  WifiOff,
  Shield,
  Languages,
  Smartphone,
  Building2,
  HeartHandshake,
  Plus,
  X,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CountUpStat } from "@/components/CountUpStat";
import { Reveal } from "@/components/Reveal";
import { cn } from "@/lib/utils";
import { SAHAY_SMS_NUMBER, SAHAY_TOLL_FREE_DISPLAY } from "@/lib/contact";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SahayBot | AI Welfare Scheme Assistant for Bharat" },
      {
        name: "description",
        content:
          "SahayBot is a multilingual AI assistant that helps rural Indians discover government welfare schemes, check eligibility, and get document checklists in their own language.",
      },
      { property: "og:title", content: "SahayBot | AI Welfare Scheme Assistant for Bharat" },
      {
        property: "og:description",
        content:
          "Discover schemes you qualify for. Check eligibility. Get document checklists. In your language. Online or via SMS.",
      },
    ],
  }),
  component: Landing,
});

const schemes = ["PM-KISAN", "Ayushman Bharat", "Ujjwala Yojana", "Sukanya Samriddhi", "PM Awas Yojana", "MGNREGA"];
const languages = ["हिंदी", "தமிழ்", "मराठी", "বাংলা", "English", "తెలుగు", "ਪੰਜਾਬੀ", "ગુજરાતી"];

function Landing() {
  return (
    <main className="bg-background text-foreground">
      <Navbar />
      <Hero />
      <Marquee />
      <Stats />
      <HowItWorks />
      <Features />
      <SchemesShowcase />
      <SmsSection />
      <ForPartners />
      <FaqSection />
      <FaqCta />
      <Footer />
    </main>
  );
}

function Hero() {
  return (
    <section className="border-b border-foreground/10">
      <div className="mx-auto flex min-h-[calc(100dvh-4.5rem)] max-w-3xl flex-col items-center justify-center px-5 py-16 text-center sm:min-h-[min(82vh,720px)] sm:px-6 sm:py-20 md:py-24">
        <Reveal>
          <span className="inline-flex rounded-full border border-foreground/25 px-3.5 py-1 text-[11px] font-medium sm:text-xs">
            Built for Bharat · v1.0
          </span>
        </Reveal>
        <Reveal delay={0.1}>
          <h1 className="mt-6 font-display text-[2rem] font-bold leading-[1.12] tracking-tight text-foreground sm:mt-7 sm:text-5xl md:text-[3.25rem] md:leading-[1.08]">
            Welfare schemes, for every household.
          </h1>
        </Reveal>
        <Reveal delay={0.2}>
          <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-muted-foreground sm:mt-6 sm:text-base md:max-w-2xl md:text-lg">
            Sahay is a multilingual AI that finds schemes you qualify for, walks you through eligibility,
            and hands you a ready document checklist in your language, online or by SMS.
          </p>
        </Reveal>
        <Reveal delay={0.3}>
          <div className="mt-8 flex w-full max-w-md flex-col gap-3 sm:mt-9 sm:max-w-none sm:flex-row sm:justify-center">
            <Link
              to="/start"
              className="group inline-flex h-12 min-w-0 flex-1 items-center justify-center gap-2 rounded-full bg-foreground px-6 text-sm font-semibold text-background transition-colors hover:bg-foreground/90 sm:min-w-[168px] sm:flex-none sm:px-8"
            >
              Start free
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              to="/chat"
              className="inline-flex h-12 min-w-0 flex-1 items-center justify-center rounded-full border-2 border-foreground bg-background px-6 text-sm font-semibold transition-colors hover:bg-muted sm:min-w-[168px] sm:flex-none sm:px-8"
            >
              Try the chat
            </Link>
          </div>
        </Reveal>
        <Reveal delay={0.4}>
          <div className="mt-8 flex flex-col items-center gap-3 sm:mt-10 sm:flex-row sm:gap-4">
            <div className="flex -space-x-2" aria-hidden>
              {["हि", "த", "ব"].map((label) => (
                <div
                  key={label}
                  className="grid size-8 place-items-center rounded-full border-2 border-background bg-muted text-[10px] font-semibold sm:size-9"
                >
                  {label}
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground sm:text-sm">
              <span className="font-semibold text-foreground">950+</span> schemes across India ·{" "}
              <span className="font-semibold text-foreground">11</span> languages
            </p>
          </div>
        </Reveal>
        <Reveal delay={0.5}>
          <div className="mt-8 grid max-w-lg grid-cols-2 gap-x-4 gap-y-2 text-[11px] text-muted-foreground sm:mt-9 sm:flex sm:max-w-none sm:flex-wrap sm:justify-center sm:gap-x-5 sm:gap-y-2 sm:text-xs">
            <span className="inline-flex items-center justify-center gap-1.5 sm:justify-start">
              <Languages className="size-3.5 shrink-0 text-foreground" /> Multilingual
            </span>
            <span className="inline-flex items-center justify-center gap-1.5 sm:justify-start">
              <WifiOff className="size-3.5 shrink-0 text-foreground" /> Works offline
            </span>
            <span className="inline-flex items-center justify-center gap-1.5 sm:justify-start">
              <Smartphone className="size-3.5 shrink-0 text-foreground" /> SMS ready
            </span>
            <span className="inline-flex items-center justify-center gap-1.5 sm:justify-start">
              <Shield className="size-3.5 shrink-0 text-foreground" /> Privacy first
            </span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Marquee() {
  const items = [...schemes, ...schemes];
  return (
    <section className="border-b border-foreground/10 py-6">
      <div className="overflow-hidden">
        <div className="marquee flex w-max gap-12 whitespace-nowrap">
          {items.map((s, i) => (
            <span key={i} className="font-display text-xl font-semibold tracking-tight text-muted-foreground">
              {s} <span className="mx-6 text-foreground">●</span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function Stats() {
  const stats = [
    { type: "count" as const, value: 950, suffix: "+", label: "Central & state schemes" },
    { type: "count" as const, value: 11, suffix: "", label: "Indian languages" },
    { type: "count" as const, value: 60, prefix: "<", suffix: "s", label: "To check eligibility" },
    { type: "text" as const, text: "SMS", label: "Works on any phone" },
  ];
  return (
    <section className="border-b border-foreground/10">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-px overflow-hidden bg-foreground/10 md:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-background px-6 py-10">
            <div className="font-display text-4xl font-bold tracking-tight md:text-5xl">
              {s.type === "count" ? (
                <CountUpStat value={s.value} prefix={s.prefix} suffix={s.suffix} duration={2.2} />
              ) : (
                <span>{s.text}</span>
              )}
            </div>
            <div className="mt-2 text-sm text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

const processSteps = [
  {
    n: "1",
    title: "Pick your language",
    desc: "We start in the language you're most comfortable with: Hindi, Tamil, Bangla, Marathi, and 7 more. Auto detected when possible.",
  },
  {
    n: "2",
    title: "Tell us about you",
    desc: "A short, friendly chat. Speak or tap your answers. No long forms, no government jargon, and no typing required if you prefer voice.",
  },
  {
    n: "3",
    title: "Get matched schemes",
    desc: "Your profile is checked against 950+ central and state welfare schemes. You see only what you qualify for, ranked by relevance.",
  },
  {
    n: "4",
    title: "Receive your checklist",
    desc: "Get the exact documents you need for each scheme, ready to download, print, or receive by SMS on any phone.",
  },
];

function HowItWorks() {
  const [active, setActive] = useState(0);

  return (
    <section className="border-b border-foreground/10 py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-6">
        <Reveal>
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex rounded-full border border-foreground/15 bg-muted px-4 py-1.5 text-xs font-medium">
              Our Process
            </span>
            <h2 className="mt-6 font-display text-3xl font-bold leading-tight tracking-tight md:text-5xl md:leading-[1.1]">
              From confusion to qualification. Simple, fast, and in your language.
            </h2>
          </div>
        </Reveal>

        <div className="mt-12 hidden h-[26rem] gap-3 lg:flex">
          {processSteps.map((step, i) => {
            const isActive = active === i;
            return (
              <motion.button
                key={step.n}
                type="button"
                layout
                aria-expanded={isActive}
                onClick={() => setActive(i)}
                transition={{ type: "spring", stiffness: 320, damping: 32 }}
                className={cn(
                  "relative flex h-full overflow-hidden rounded-3xl text-left transition-colors",
                  isActive
                    ? "flex-[5] bg-foreground text-background"
                    : "flex-[0.85] min-w-[4.5rem] bg-muted hover:bg-muted/70",
                )}
              >
                {isActive ? (
                  <div className="flex h-full w-full flex-col justify-between p-8 md:p-10">
                    <div className="flex items-start gap-4 md:gap-6">
                      <span className="font-display text-7xl font-bold leading-none md:text-8xl">{step.n}</span>
                      <h3 className="max-w-md pt-2 font-display text-2xl font-bold leading-tight md:pt-4 md:text-3xl">
                        {step.title}
                      </h3>
                    </div>
                    <p className="max-w-xl text-sm leading-relaxed text-background/70 md:text-base">{step.desc}</p>
                  </div>
                ) : (
                  <span className="absolute left-1/2 top-8 -translate-x-1/2 font-display text-6xl font-bold text-foreground md:top-10 md:text-7xl">
                    {step.n}
                  </span>
                )}
              </motion.button>
            );
          })}
        </div>

        <div className="mt-12 space-y-3 lg:hidden">
          {processSteps.map((step, i) => {
            const isActive = active === i;
            return (
              <button
                key={step.n}
                type="button"
                aria-expanded={isActive}
                onClick={() => setActive(i)}
                className={cn(
                  "w-full overflow-hidden rounded-2xl text-left transition-colors",
                  isActive ? "bg-foreground text-background" : "bg-muted",
                )}
              >
                <div className="flex items-center gap-4 p-5">
                  <span
                    className={cn(
                      "font-display text-4xl font-bold leading-none",
                      isActive ? "text-background" : "text-foreground",
                    )}
                  >
                    {step.n}
                  </span>
                  <h3 className="font-display text-lg font-bold">{step.title}</h3>
                </div>
                {isActive && (
                  <p className="px-5 pb-5 text-sm leading-relaxed text-background/70">{step.desc}</p>
                )}
              </button>
            );
          })}
        </div>

        <Reveal delay={0.15}>
          <div className="mt-10 text-center">
            <Link
              to="/start"
              className="group inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background hover:bg-foreground/90"
            >
              Start your eligibility check
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Features() {
  const features = [
    { icon: MessageSquare, title: "Conversational AI", desc: "No forms. Just chat in your language, like talking to a friend who knows every scheme." },
    { icon: Mic, title: "Voice first", desc: "Speak instead of typing. Designed for first time digital users." },
    { icon: WifiOff, title: "Offline mode", desc: "Saved schemes and checklists stay accessible even when the network drops." },
    { icon: Smartphone, title: "SMS companion", desc: "Feature-phone users can SMS short codes and get scheme info instantly." },
    { icon: ListChecks, title: "Document checklists", desc: "Know exactly which papers to carry. Download, print, or send by SMS." },
    { icon: Shield, title: "Privacy by design", desc: "Your data never leaves your device unless you choose to share it." },
  ];
  return (
    <section className="border-b border-foreground/10 py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-6">
        <Reveal>
          <div className="max-w-3xl">
            <span className="inline-flex rounded-full border border-foreground/15 bg-muted px-4 py-1.5 text-xs font-medium">
              Features
            </span>
            <h2 className="mt-6 font-display text-4xl font-bold tracking-tight md:text-5xl">
              Designed for the next billion users.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground md:text-lg">
              Every feature is built for low bandwidth, low literacy, and every type of phone, from smartphones to SMS.
            </p>
          </div>
        </Reveal>

        <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-foreground/10 bg-foreground/10 sm:mt-14 md:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <Reveal key={f.title} delay={i * 0.05} className="h-full">
              <div className="group flex h-full min-h-[220px] flex-col bg-background p-8 transition-colors duration-300 hover:bg-foreground hover:text-background md:min-h-[240px] md:p-10">
                <div className="flex items-start justify-between gap-4">
                  <div className="grid size-12 place-items-center rounded-full border border-current transition-colors">
                    <f.icon className="size-5" strokeWidth={1.75} />
                  </div>
                  <span className="font-mono text-xs text-muted-foreground transition-colors group-hover:text-background/50">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <h3 className="mt-8 font-display text-xl font-semibold tracking-tight">{f.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground transition-colors group-hover:text-background/75 md:text-[15px]">
                  {f.desc}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function SchemesShowcase() {
  const items = [
    { name: "PM-KISAN", desc: "₹6,000/year direct income support for eligible farmer families.", tag: "Farmers" },
    { name: "Ayushman Bharat", desc: "₹5L health cover per family per year, cashless at empanelled hospitals.", tag: "Health" },
    { name: "Ujjwala Yojana", desc: "Free LPG connections for women from BPL households.", tag: "Women" },
    { name: "Sukanya Samriddhi", desc: "Long-term savings scheme for the girl child with tax benefits.", tag: "Girls" },
    { name: "PM Awas Yojana", desc: "Subsidy and assistance for building or buying a home.", tag: "Housing" },
    { name: "MGNREGA", desc: "100 days of guaranteed wage employment per rural household.", tag: "Employment" },
  ];
  return (
    <section className="border-b border-foreground/10 py-24">
      <div className="mx-auto max-w-7xl px-6">
        <Reveal>
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
            <div>
              <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Coverage</p>
              <h2 className="mt-3 font-display text-4xl font-bold tracking-tight md:text-5xl">Schemes you can discover today.</h2>
            </div>
            <Link to="/schemes" className="inline-flex items-center gap-2 text-sm underline underline-offset-4">
              Browse all <ArrowRight className="size-4" />
            </Link>
          </div>
        </Reveal>
        <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {items.map((s, i) => (
            <Reveal key={s.name} delay={i * 0.05}>
              <Link to="/schemes/$id" params={{ id: s.name.toLowerCase().replace(/\s+/g, "-") }} className="group block h-full">
                <div className="flex h-full flex-col rounded-2xl border border-foreground bg-background p-6 transition-colors group-hover:bg-foreground group-hover:text-background">
                  <div className="flex items-center justify-between">
                    <span className="rounded-full border border-current px-3 py-1 text-xs">{s.tag}</span>
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                  </div>
                  <h3 className="mt-8 font-display text-2xl font-semibold tracking-tight">{s.name}</h3>
                  <p className="mt-3 text-sm leading-relaxed opacity-80">{s.desc}</p>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function SmsSection() {
  const steps = [
    { n: "01", title: "Text your role", desc: `Send FARMER BIHAR to ${SAHAY_SMS_NUMBER} from any phone.` },
    { n: "02", title: "Get matched schemes", desc: "Sahay replies with schemes you may qualify for." },
    { n: "03", title: "Reply for details", desc: "Tap a number to get documents and next steps by SMS." },
  ];

  return (
    <section className="border-b border-foreground/10 bg-muted/25 py-24 md:py-28">
      <div className="mx-auto max-w-3xl px-6 text-center">
        <Reveal>
          <span className="inline-flex rounded-full border border-foreground/15 bg-background px-4 py-1.5 text-xs font-medium">
            SMS access
          </span>
          <h2 className="mt-6 font-display text-4xl font-bold tracking-tight md:text-5xl">No smartphone? No problem.</h2>
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-muted-foreground">
            Send one SMS to <span className="font-mono font-semibold text-foreground">{SAHAY_SMS_NUMBER}</span> with your role and state,
            or call toll free <span className="font-mono font-semibold text-foreground">{SAHAY_TOLL_FREE_DISPLAY}</span>.
            Sahay replies instantly in your language, no app needed.
          </p>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="mt-12 overflow-hidden rounded-2xl border border-foreground/10 bg-background text-left shadow-sm">
            <div className="border-b border-foreground/10 bg-muted/50 px-5 py-3">
              <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">Sample conversation</p>
            </div>
            <div className="space-y-4 px-5 py-6 font-mono text-sm">
              <div className="flex justify-end">
                <span className="rounded-2xl rounded-tr-sm bg-foreground px-4 py-2.5 text-xs text-background sm:text-sm">
                  FARMER BIHAR
                </span>
              </div>
              <div className="max-w-[92%] rounded-2xl rounded-tl-sm border border-foreground/15 bg-muted/40 px-4 py-3 text-xs leading-relaxed sm:text-sm">
                <span className="font-semibold text-foreground">Sahay</span>
                <p className="mt-1 text-muted-foreground">
                  3 schemes match. Reply 1 for PM KISAN, 2 for KCC, 3 for PMFBY.
                </p>
              </div>
              <div className="flex justify-end">
                <span className="grid size-9 place-items-center rounded-full bg-foreground text-xs font-semibold text-background">
                  1
                </span>
              </div>
              <div className="max-w-[92%] rounded-2xl rounded-tl-sm border border-foreground/15 bg-muted/40 px-4 py-3 text-xs leading-relaxed sm:text-sm">
                <span className="font-semibold text-foreground">Sahay</span>
                <p className="mt-1 text-muted-foreground">
                  PM KISAN: ₹6,000/yr. Documents: Aadhaar, bank passbook, land record. Reply HELP for nearest CSC.
                </p>
              </div>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.15}>
          <div className="mt-10 grid gap-4 text-left sm:grid-cols-3">
            {steps.map((s) => (
              <div key={s.n} className="rounded-xl border border-foreground/10 bg-background p-5">
                <span className="font-mono text-xs text-muted-foreground">{s.n}</span>
                <h3 className="mt-2 font-display text-base font-semibold">{s.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal delay={0.2}>
          <Link
            to="/start"
            className="mt-10 inline-flex rounded-full bg-foreground px-8 py-3.5 text-sm font-medium text-background hover:bg-foreground/90"
          >
            Register your number
          </Link>
        </Reveal>
      </div>
    </section>
  );
}

function ForPartners() {
  const partners = [
    { icon: HeartHandshake, title: "NGOs & Field Workers", desc: "Equip your team with a single tool that covers every scheme in every language." },
    { icon: Building2, title: "State Governments", desc: "Increase scheme reach and reduce duplication with verified eligibility data." },
    { icon: Search, title: "Researchers", desc: "Anonymized insights into welfare access gaps across demographics." },
  ];
  return (
    <section className="border-b border-foreground/10 bg-foreground py-24 text-background">
      <div className="mx-auto max-w-7xl px-6">
        <Reveal>
          <p className="font-mono text-xs uppercase tracking-widest opacity-60">For partners</p>
          <h2 className="mt-3 max-w-3xl font-display text-4xl font-bold tracking-tight md:text-5xl">
            A platform that scales with the public sector.
          </h2>
        </Reveal>
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {partners.map((p, i) => (
            <Reveal key={p.title} delay={i * 0.06}>
              <div className="h-full rounded-2xl border border-background/30 p-8">
                <p.icon className="size-6" />
                <h3 className="mt-6 font-display text-xl font-semibold">{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed opacity-80">{p.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

const faqItems = [
  {
    q: "What is Sahay and who is it for?",
    a: "Sahay is a multilingual AI assistant that helps Indians discover government welfare schemes, check eligibility, and get document checklists whether you're a farmer, student, parent, or senior citizen.",
  },
  {
    q: "Do I need a smartphone to use Sahay?",
    a: `No. Sahay works on smartphones via chat, and on any basic phone through SMS. Send your details to ${SAHAY_SMS_NUMBER} or call ${SAHAY_TOLL_FREE_DISPLAY} for scheme matches in your language.`,
  },
  {
    q: "Which languages does Sahay support?",
    a: "Sahay currently supports 11 Indian languages including Hindi, Tamil, Bangla, Marathi, Telugu, Punjabi, Gujarati, and English, with more being added.",
  },
  {
    q: "Is my personal data safe?",
    a: "Yes. Sahay is privacy first by design. Your information stays on your device unless you choose to share it, and we never sell your data to third parties.",
  },
  {
    q: "How accurate are the scheme matches?",
    a: "Matches are scored against 950+ central and state schemes using your profile answers. Results are ranked by relevance, but final eligibility is always confirmed by the issuing authority.",
  },
  {
    q: "How do I get started?",
    a: "Tap Get started, pick your language, and answer a few simple questions. In under a minute you'll see schemes you may qualify for with a ready document checklist.",
  },
];

function FaqSection() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section className="border-b border-foreground/10 py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-12 lg:grid-cols-[2fr_3fr] lg:gap-16">
          <Reveal>
            <div className="lg:sticky lg:top-28 lg:self-start">
              <span className="inline-flex rounded-full border border-foreground/15 bg-muted px-4 py-1.5 text-xs font-medium">
                Frequently Asked Questions
              </span>
              <h2 className="mt-6 font-display text-3xl font-bold leading-tight tracking-tight md:text-4xl lg:text-[2.75rem] lg:leading-[1.15]">
                Your questions answered. Clear, simple, and in plain language.
              </h2>
              <p className="mt-5 max-w-md text-sm leading-relaxed text-muted-foreground md:text-base">
                We've gathered the most common questions about Sahay right here. Explore the FAQs and find what you need to get started.
              </p>
            </div>
          </Reveal>

          <div className="space-y-3">
            {faqItems.map((item, i) => {
              const isOpen = openIndex === i;
              return (
                <Reveal key={item.q} delay={i * 0.04}>
                  <div
                    className={cn(
                      "overflow-hidden rounded-2xl bg-muted transition-colors",
                      isOpen && "bg-muted",
                    )}
                  >
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      onClick={() => setOpenIndex(isOpen ? -1 : i)}
                      className="flex w-full items-start justify-between gap-4 p-5 text-left md:p-6"
                    >
                      <span className="font-display text-base font-bold leading-snug md:text-lg">{item.q}</span>
                      <span
                        className={cn(
                          "grid size-9 shrink-0 place-items-center rounded-full transition-colors",
                          isOpen ? "bg-foreground text-background" : "bg-background text-muted-foreground",
                        )}
                      >
                        {isOpen ? <X className="size-4" /> : <Plus className="size-4" />}
                      </span>
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-5 md:px-6 md:pb-6">
                        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">{item.a}</p>
                      </div>
                    )}
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

function FaqCta() {
  return (
    <section className="py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-6">
        <Reveal>
          <div className="cta-panel mx-auto w-full overflow-hidden rounded-[1.75rem] bg-foreground px-6 py-14 text-center text-background sm:px-10 md:rounded-[2.5rem] md:px-20 md:py-20 lg:px-24 xl:px-28">
            <div className="mb-8 flex flex-wrap justify-center gap-2 md:mb-10">
              {languages.map((l) => (
                <span
                  key={l}
                  className="rounded-full border border-background/25 px-3.5 py-1.5 text-xs text-background/85 md:text-sm"
                >
                  {l}
                </span>
              ))}
            </div>

            <h2 className="font-display text-3xl font-bold leading-tight tracking-tight md:text-5xl lg:text-[3.25rem]">
              Find what you deserve.
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-sm leading-relaxed text-background/75 md:mt-6 md:max-w-3xl md:text-lg lg:max-w-4xl">
              Discover welfare schemes you qualify for in your language, online or by SMS. Our AI is ready to
              guide you from eligibility to your document checklist.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row md:mt-12">
              <Link
                to="/start"
                className="group inline-flex items-center justify-center gap-2 rounded-full bg-background px-8 py-3.5 text-sm font-semibold text-foreground transition-opacity hover:opacity-90"
              >
                Get started free
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                to="/chat"
                className="inline-flex items-center justify-center rounded-full border border-background/35 px-8 py-3.5 text-sm font-medium text-background transition-colors hover:bg-background/10"
              >
                Try the chat now
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
