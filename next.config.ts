import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

// IMPORTANT: keep this list in sync with `lib/imageUrl.ts`.
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Vercel Blob (AI-generated images)
      { protocol: "https", hostname: "**.public.blob.vercel-storage.com" },
      // OpenAI / DALL-E direct
      { protocol: "https", hostname: "oaidalleapiprodscus.blob.core.windows.net" },
      // Common public image hosts
      { protocol: "https", hostname: "i.imgur.com" },
      { protocol: "https", hostname: "imgur.com" },
      { protocol: "https", hostname: "**.cloudinary.com" },
      { protocol: "https", hostname: "**.googleusercontent.com" },
      { protocol: "https", hostname: "s.gravatar.com" },
    ],
  },
};

export default withNextIntl(nextConfig);
