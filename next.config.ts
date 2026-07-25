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
  async headers() {
    // Next.js already sends immutable long-cache headers for hashed
    // /_next/static/* assets; the brand images under /public don't get that
    // by default, so Cloudflare (and browsers) treat them as uncacheable.
    const oneYear = "public, max-age=31536000, immutable";
    return [
      {
        source: "/logo.png",
        headers: [{ key: "Cache-Control", value: oneYear }],
      },
    ];
  },
};

const withNextIntl = createNextIntlPlugin();

export default withNextIntl(nextConfig);
