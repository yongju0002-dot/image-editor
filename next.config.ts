import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  // Produces a self-contained .next/standalone build for the Docker image.
  output: "standalone",
  // next-intl's request config loads `../../messages/${locale}.json` via a
  // dynamic import with a template literal, which Next's file tracer can't
  // statically resolve - without this, .next/standalone ships with no
  // messages/ directory at all and every locale 500s at runtime.
  outputFileTracingIncludes: {
    "/[locale]": ["./messages/*.json"],
  },
};

const withNextIntl = createNextIntlPlugin();

export default withNextIntl(nextConfig);
