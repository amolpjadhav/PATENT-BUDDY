import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ensure lib/prompts/system_patent_writer.txt is bundled in Vercel serverless functions.
  // Without this, fs.readFileSync would fail at runtime in production.
  outputFileTracingIncludes: {
    "/api/**": ["./lib/prompts/*.txt"],
    "/projects/**": ["./lib/prompts/*.txt"],
  },
  // pdf-parse reads test PDF files relative to __dirname during module init.
  // Marking it as external prevents Next.js from bundling it, preserving those paths.
  serverExternalPackages: ["pdf-parse"],
};

export default nextConfig;
