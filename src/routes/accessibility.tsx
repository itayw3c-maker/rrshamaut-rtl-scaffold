import { createFileRoute, redirect } from "@tanstack/react-router";

// Canonical statement URL is the Hebrew slug — 301 redirect any legacy hits.
export const Route = createFileRoute("/accessibility")({
  beforeLoad: () => {
    throw redirect({ href: "/הסדרי-נגישות/", statusCode: 301 });
  },
  component: () => null,
});
