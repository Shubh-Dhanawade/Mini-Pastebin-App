import { redis } from '@/lib/redis';
import { nanoid } from 'nanoid';

export interface PasteData {
    content: string;
    remaining_views?: number | null;
    expires_at?: number | null; // Timestamp
}

export async function createPaste(content: string, ttl_seconds?: number | null, max_views?: number | null) {
    const id = nanoid(10);
    const key = `paste:${id}`;
    const now = Date.now();

    const pipeline = redis.pipeline();

    const payload: Record<string, string | number> = {
        content: content,
        created_at: now,
    };

    if (max_views) {
        payload.remaining_views = max_views;
    }

    if (ttl_seconds) {
        const expiresAt = now + (ttl_seconds * 1000);
        payload.expires_at = expiresAt;
        pipeline.hset(key, payload);
        pipeline.expire(key, ttl_seconds); // Redis native expiry as backup
    } else {
        pipeline.hset(key, payload);
    }

    await pipeline.exec();
    return id;
}

export async function getPaste(id: string, now: number = Date.now()): Promise<PasteData | null> {
    const key = `paste:${id}`;

    const script = `
    local key = KEYS[1]
    local now = tonumber(ARGV[1])
    
    if redis.call("EXISTS", key) == 0 then
      return nil
    end

    local expires_at = redis.call("HGET", key, "expires_at")
    if expires_at and tonumber(expires_at) < now then
      return nil
    end

    local remaining = redis.call("HGET", key, "remaining_views")
    if remaining then
      local rem_val = tonumber(remaining)
      if rem_val <= 0 then
        return nil
      end
      -- Decrement
      redis.call("HINCRBY", key, "remaining_views", -1)
      -- Return updated value
      remaining = rem_val - 1
    end

    local content = redis.call("HGET", key, "content")
    
    return {content, remaining, expires_at}
  `;

    const result = await redis.eval(script, [key], [now]) as [string, number | null, string | null] | null;

    if (!result) {
        return null;
    }

    const [content, remaining_views, expires_at] = result;

    return {
        content,
        remaining_views: remaining_views,
        expires_at: expires_at ? parseInt(expires_at, 10) : undefined,
    };
}
