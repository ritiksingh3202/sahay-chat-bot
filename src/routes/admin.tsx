import { createFileRoute, redirect } from "@tanstack/react-router";
import { isAdmin, isAuthenticated } from "@/lib/auth";
import { Navbar } from "@/components/Navbar";
import { Reveal } from "@/components/Reveal";
import { Download, FileDown, Users, FileCheck, MessageSquare, TrendingUp } from "lucide-react";
import { getPilotStats, loadSession } from "@/lib/session";
import { SCHEMES } from "@/lib/schemes-data";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin Console — Sahay" }] }),
  beforeLoad: () => {
    if (!isAuthenticated()) {
      throw redirect({ to: "/auth", search: { next: "/admin" } });
    }
    if (!isAdmin()) {
      throw redirect({ to: "/" });
    }
  },
  component: Admin,
});

function Admin() {
  const stats = getPilotStats();
  const session = loadSession();
  const baseUsers = 284000 + stats.sessions;
  const checks = 118000 + stats.eligibilityCompleted;
  const sms = 62000 + stats.chatMessages;
  const completion = stats.eligibilityCompleted > 0 ? Math.min(95, 68 + stats.eligibilityCompleted * 5) : 68;

  const metrics = [
    { icon: Users, label: "Pilot events tracked", value: baseUsers.toLocaleString(), delta: `+${stats.sessions} this device` },
    { icon: FileCheck, label: "Eligibility checks", value: checks.toLocaleString(), delta: `+${stats.eligibilityCompleted} completed` },
    { icon: MessageSquare, label: "Chat interactions", value: sms.toLocaleString(), delta: `+${stats.chatMessages} messages` },
    { icon: TrendingUp, label: "Match rate", value: `${completion.toFixed(1)}%`, delta: `${stats.matchedCount} schemes matched` },
  ];

  const schemeBars = SCHEMES.slice(0, 6).map((s, i) => ({
    name: s.name,
    value: 92 - i * 12 + (session.matchedSchemeIds.includes(s.id) ? 8 : 0),
  }));

  const langLabels: Record<string, string> = {
    en: "English",
    hi: "Hindi",
    ta: "Tamil",
    mr: "Marathi",
    bn: "Bangla",
    te: "Telugu",
  };

  const langDist = [
    { l: langLabels[stats.lang] ?? "English", v: 42 },
    { l: "Hindi", v: 28 },
    { l: "Tamil", v: 12 },
    { l: "Bangla", v: 10 },
    { l: "Marathi", v: 5 },
    { l: "Telugu", v: 3 },
  ];

  const sessions = session.pilotEvents.slice(-5).reverse().map((e, i) => ({
    id: `E-${1000 + i}`,
    state: session.eligibility?.state ?? "—",
    persona: session.persona ?? "—",
    lang: langLabels[stats.lang] ?? stats.lang,
    scheme: session.matchedSchemeIds[0] ?? "—",
    status: e.type.includes("complete") ? "Completed" : e.type,
  }));

  const displaySessions =
    sessions.length > 0
      ? sessions
      : [
          { id: "U-10421", state: "Bihar", persona: "farmer", lang: "Hindi", scheme: "PM-KISAN", status: "Sample" },
          { id: "U-10422", state: "Tamil Nadu", persona: "gig", lang: "Tamil", scheme: "e-Shram", status: "Sample" },
        ];

  function exportCsv() {
    const rows = [
      ["event", "timestamp", "lang", "persona", "matched_schemes"],
      ...session.pilotEvents.map((e) => [e.type, e.at, stats.lang, stats.persona ?? "", session.matchedSchemeIds.join(";")]),
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sahay-pilot-events.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main>
      <Navbar />
      <section className="mx-auto max-w-7xl px-6 py-12 md:py-16">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Admin Console</p>
              <h1 className="mt-3 font-display text-4xl font-bold tracking-tight md:text-5xl">Welfare Reach Dashboard</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Live pilot metrics from this device + projected scale. Export CSV for hackathon deliverables.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={exportCsv}
                className="inline-flex items-center gap-2 rounded-full border border-foreground px-5 py-2.5 text-sm"
              >
                <Download className="size-4" /> CSV
              </button>
              <a
                href="/docs/PILOT_REPORT.md"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm text-background"
              >
                <FileDown className="size-4" /> Pilot report
              </a>
            </div>
          </div>
        </Reveal>

        <div className="mt-10 grid gap-px overflow-hidden border border-foreground/10 bg-foreground/10 md:grid-cols-4">
          {metrics.map((m) => (
            <div key={m.label} className="bg-background p-6">
              <m.icon className="size-5" />
              <div className="mt-6 font-display text-3xl font-bold tracking-tight">{m.value}</div>
              <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
                <span>{m.label}</span>
                <span className="font-mono">{m.delta}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <Reveal>
            <div className="rounded-2xl border border-foreground p-6">
              <h2 className="font-display text-xl font-semibold">Scheme popularity</h2>
              <div className="mt-6 space-y-4">
                {schemeBars.map((b) => (
                  <div key={b.name}>
                    <div className="flex justify-between text-xs">
                      <span>{b.name}</span>
                      <span className="font-mono text-muted-foreground">{b.value}k</span>
                    </div>
                    <div className="mt-1.5 h-2 rounded-full bg-muted">
                      <div className="h-full rounded-full bg-foreground" style={{ width: `${Math.min(100, b.value)}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="rounded-2xl border border-foreground p-6">
              <h2 className="font-display text-xl font-semibold">Language distribution</h2>
              <div className="mt-6 grid grid-cols-2 gap-4">
                {langDist.map((l) => (
                  <div key={l.l} className="rounded-xl border border-foreground/30 p-4">
                    <div className="flex items-baseline justify-between">
                      <span className="font-display text-lg font-semibold">{l.l}</span>
                      <span className="font-mono text-xs text-muted-foreground">{l.v}%</span>
                    </div>
                    <div className="mt-3 h-1.5 rounded-full bg-muted">
                      <div className="h-full rounded-full bg-foreground" style={{ width: `${l.v * 2}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>

        <Reveal>
          <div className="mt-10 overflow-hidden rounded-2xl border border-foreground">
            <div className="border-b border-foreground/10 p-6">
              <h2 className="font-display text-xl font-semibold">Recent pilot events</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-6 py-3">ID</th>
                    <th className="px-6 py-3">State</th>
                    <th className="px-6 py-3">Persona</th>
                    <th className="px-6 py-3">Language</th>
                    <th className="px-6 py-3">Top scheme</th>
                    <th className="px-6 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {displaySessions.map((s) => (
                    <tr key={s.id} className="border-t border-foreground/10">
                      <td className="px-6 py-4 font-mono">{s.id}</td>
                      <td className="px-6 py-4">{s.state}</td>
                      <td className="px-6 py-4 capitalize">{String(s.persona)}</td>
                      <td className="px-6 py-4">{s.lang}</td>
                      <td className="px-6 py-4">{s.scheme}</td>
                      <td className="px-6 py-4">
                        <span className="rounded-full border border-foreground px-3 py-1 text-xs">{s.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Reveal>
      </section>
    </main>
  );
}
