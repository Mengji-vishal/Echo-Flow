/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: '/',
        destination: '/manager/dashboard',
        permanent: false,
      },
      {
        source: '/manager',
        destination: '/manager/dashboard',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
