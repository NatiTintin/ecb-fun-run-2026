/** @type {import('next').NextConfig} */
const nextConfig = {
  // Served at ecb.asia/fun-run (reverse-proxied from the main site) rather
  // than owning its own domain root — basePath makes every internal link,
  // static asset, and Server Action endpoint carry the /fun-run prefix
  // automatically. NEXT_PUBLIC_APP_URL must also include /fun-run so
  // manually-built links (email/QR) match.
  basePath: '/fun-run',
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
};

export default nextConfig;
