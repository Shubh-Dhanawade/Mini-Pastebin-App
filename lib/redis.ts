import { Redis } from '@upstash/redis';

if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    throw new Error('Redis credentials are not defined in environment variables.');
}

if (process.env.UPSTASH_REDIS_REST_URL.includes('YOUR_UPSTASH_URL_HERE')) {
    console.error('ERROR: You must replace "YOUR_UPSTASH_URL_HERE" in .env.local with your actual Redis REST URL.');
    throw new Error('Please update .env.local with your actual Upstash Redis credentials.');
}

export const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
});
