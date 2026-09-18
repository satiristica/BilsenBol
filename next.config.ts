import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Dev server only; has no effect on `next build` / `next start`.
  // Opening the dev server from a phone on the home network (e.g.
  // http://192.168.1.49:3000) is a cross-origin request to Next's dev assets,
  // which Next blocks by default. The page still renders, but React never
  // hydrates, so every button is dead while plain links keep working.
  // `*` matches exactly one hostname label, so this covers 192.168.x.y only.
  allowedDevOrigins: ["192.168.*.*"],
};

export default nextConfig;
