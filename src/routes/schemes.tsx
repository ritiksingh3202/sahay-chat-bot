import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/schemes")({
  component: SchemesLayout,
});

function SchemesLayout() {
  return <Outlet />;
}
