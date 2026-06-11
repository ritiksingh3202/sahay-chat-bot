import { Link } from "@tanstack/react-router";
import { SAHAY_SMS_NUMBER, SAHAY_TOLL_FREE_DISPLAY, smsUri, tollFreeUri } from "@/lib/contact";

const fastLinks = [
  { to: "/", label: "Home" },
  { to: "/chat", label: "Chat" },
  { to: "/schemes", label: "Schemes" },
  { to: "/eligibility", label: "Eligibility" },
  { to: "/app", label: "Dashboard" },
];

const contact = [
  { label: "hello@sahay.in", href: "mailto:hello@sahay.in" },
  { label: `SMS: ${SAHAY_SMS_NUMBER}`, href: smsUri() },
  { label: SAHAY_TOLL_FREE_DISPLAY, href: tollFreeUri },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-foreground/10 bg-background">
      <div className="mx-auto max-w-7xl px-6 pt-16 pb-10 md:pt-20 md:pb-12">
        <div className="flex flex-col gap-14 md:flex-row md:items-start md:justify-between md:gap-8">
          <div className="min-w-0">
            <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
              Fast Links
            </p>
            <nav className="mt-6 flex flex-col gap-2 sm:gap-3">
              {fastLinks.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="font-display text-3xl font-bold tracking-tight text-foreground transition-opacity hover:opacity-60 sm:text-4xl md:text-[2.75rem] md:leading-tight"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <p className="mt-14 text-[11px] uppercase tracking-[0.15em] text-muted-foreground md:mt-20">
              © {year}{" "}
              <span className="font-bold text-foreground">SAHAY</span>. ALL RIGHTS RESERVED.
            </p>
          </div>

          <div className="md:text-right">
            <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
              Connect With Us
            </p>
            <ul className="mt-6 flex flex-col gap-2 sm:gap-3">
              {contact.map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    className="font-display text-2xl font-bold tracking-tight text-foreground transition-opacity hover:opacity-60 sm:text-3xl md:text-[2rem] md:leading-tight"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
            <Link
              to="/start"
              className="mt-8 inline-flex rounded-full bg-foreground px-6 py-3 text-sm font-semibold text-background transition-colors hover:bg-foreground/90 md:mt-10"
            >
              Get started free
            </Link>
          </div>
        </div>
      </div>

      <div className="overflow-hidden border-t border-foreground/10 px-2 pt-2 pb-4 sm:px-4 sm:pb-6">
        <p
          className="footer-sahay-text font-display pointer-events-none font-black uppercase text-foreground select-none"
          aria-hidden
        >
          SAHAY
        </p>
      </div>
    </footer>
  );
}
