import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    output: 'standalone',
    /* config options here */
    images: {
        localPatterns: [
            {
                pathname: '/qr/**',
            },
        ],
        remotePatterns: [
            {
                protocol: 'http',
                hostname: 'localhost',
                port: '3000',
                pathname: '/qr/**',
            },
        ],
    },
};

export default nextConfig;
