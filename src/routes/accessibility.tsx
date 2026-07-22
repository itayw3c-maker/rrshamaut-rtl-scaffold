import { createFileRoute, redirect } from "@tanstack/react-router";

// Canonical statement URL is the Hebrew slug — 301 redirect any legacy hits.
// Location header must be ASCII, so URL-encode the Hebrew path.
export const Route = createFileRoute("/accessibility")({
  beforeLoad: () => {
    throw redirect({
      href: `/${encodeURIComponent("הסדרי-נגישות")}/`,
      statusCode: 301,
    });
  },
  component: () => null,
});
