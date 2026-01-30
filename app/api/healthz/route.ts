import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

export async function GET() {
  try {
    // ✅ Create Redis connection INSIDE the request
    const redis = Redis.fromEnv();

    // Simple ping to check connectivity
    await redis.ping();

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: "Persistence layer unavailable" },
      { status: 500 }
    );
  }
}
