import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { isAuthenticated } from "@/lib/auth";
import { Navbar } from "@/components/Navbar";
import { SchemeCaseStudy } from "@/components/SchemeCaseStudy";
import { getScheme } from "@/lib/schemes-data";
import { useSession } from "@/hooks/use-session";

export const Route = createFileRoute("/schemes/$id")({
  head: ({ params }) => {
    const scheme = getScheme(params.id);
    return { meta: [{ title: `${scheme?.name ?? params.id} — Sahay` }] };
  },
  beforeLoad: ({ params }) => {
    if (!isAuthenticated()) {
      throw redirect({ to: "/auth", search: { next: `/schemes/${params.id}` } });
    }
  },
  component: SchemeDetail,
});

function SchemeDetail() {
  const { id } = Route.useParams();
  const { session } = useSession();
  const scheme = getScheme(id);

  if (!scheme) {
    return (
      <main>
        <Navbar />
        <div className="mx-auto max-w-4xl px-6 py-20 text-center">
          <h1 className="font-display text-3xl font-bold">Scheme not found</h1>
          <Link to="/schemes" className="mt-6 inline-block underline">
            Back to results
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main>
      <Navbar />
      <SchemeCaseStudy scheme={scheme} lang={session.lang} />
    </main>
  );
}
