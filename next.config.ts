import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    /* config options here */
    images: {
        localPatterns: [
            {
                pathname: "/qr/**",
                search: "",
            },
        ],
        remotePatterns: [
            {
                protocol: "http",
                hostname: "localhost",
                port: "3000",
                pathname: "/qr/**",
                search: "",
            },
        ],
    },
};

export default nextConfig;
