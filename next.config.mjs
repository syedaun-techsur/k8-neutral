/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    // Return empty array — no custom headers added.
    // This suppresses any default X-Frame-Options Next.js 14 might inject,
    // allowing the app to be embedded in an iframe preview.
    // Do NOT add frame-ancestors to CSP.
    return [];
  },
};
export default nextConfig;
