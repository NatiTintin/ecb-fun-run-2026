/** @type {import('next').NextConfig} */
const nextConfig = {
  // Served at ecb.asia/fun-run (reverse-proxied from the main site) rather
  // than owning its own domain root — basePath makes every internal link,
  // static asset, and Server Action endpoint carry the /fun-run prefix
  // automatically. NEXT_PUBLIC_APP_URL must also include /fun-run so
  // manually-built links (email/QR) match.
  basePath: '/fun-run',
  // Next's built-in Image Optimization API mis-builds the `url` query param
  // for local images when basePath is set (confirmed on Vercel: it omits
  // the /fun-run prefix, 404ing every request) — unoptimized serves the
  // file directly instead, which basePath handles correctly. The one
  // local image (logo.png) is pre-sized to 600px, so there's no real
  // resizing/format-conversion loss from skipping the optimizer.
  images: {
    unoptimized: true,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
};

export default nextConfig;
