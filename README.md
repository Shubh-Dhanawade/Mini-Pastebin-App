# Pastebin Lite

A secure, minimalist pastebin clone built with Next.js 14, TypeScript, and Redis.

## Features
- Create text pastes with optional Expiry (TTL) and Max View limits.
- Secure, server-side data fetching.
- Atomic view counting using Redis Lua scripts.
- Deterministic time testing support.

## Tech Stack
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Database:** Redis (via `@upstash/redis`)
- **Styling:** Tailwind CSS

## Prerequisites
- Node.js 18+
- A Redis instance (e.g. Upstash or local)

## Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Variables**
   Create `.env.local`:
   ```env
   UPSTASH_REDIS_REST_URL="your-redis-url"
   UPSTASH_REDIS_REST_TOKEN="your-redis-token"
   TEST_MODE="0" # Set to "1" to enable time travel testing headers
   ```

3. **Run Development Server**
   ```bash
   npm run dev
   ```

4. **Run Tests**
   Ensure server is running on port 3000 and `TEST_MODE="1"`.
   ```bash
   node scripts/test-api.mjs
   ```

## API Endpoints

- `POST /api/pastes`: Create a paste.
  - Body: `{ content: string, ttl_seconds?: number, max_views?: number }`
- `GET /api/pastes/:id`: Fetch paste metadata (counts as a view).
- `GET /api/healthz`: Health check.

## Testing Architecture
The application supports deterministic testing of time-based features (TTL).
When `TEST_MODE=1` is set, the API respects the `x-test-now-ms` header to simulate the current server time.

## Deployment
Deploy to Vercel:
1. Push to GitHub.
2. Import project in Vercel.
3. Add Environment Variables (Redis credentials).
4. Deploy.
