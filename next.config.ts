import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ensure lib/prompts/system_patent_writer.txt is bundled in Vercel serverless functions.
  // Without this, fs.readFileSync would fail at runtime in production.
  outputFileTracingIncludes: {
    "/api/**": ["./lib/prompts/*.txt"],
    "/projects/**": ["./lib/prompts/*.txt"],
  },
};

export default nextConfig;
