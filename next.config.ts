import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    // Disable SSR for fair comparison with Angular CSR
    reactStrictMode: false,

    images: {
        unoptimized: true,
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'media.box.co.uk',
            },
            {
                protocol: 'https',
                hostname: 'admin.box.co.uk',
            },
        ],
    },

    // Add headers to handle CORS if needed
    async headers() {
        return [
            {
                source: '/api/:path*',
                headers: [
                    { key: 'Access-Control-Allow-Origin', value: '*' },
                    { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE,OPTIONS' },
                    { key: 'Access-Control-Allow-Headers', value: 'Content-Type' },
                ],
            },
        ];
    },
};

export default nextConfig;
