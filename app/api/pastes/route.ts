import { NextRequest, NextResponse } from 'next/server';
import { createPaste } from '@/lib/pastes';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { content, ttl_seconds, max_views } = body;

        // Validation
        if (!content || typeof content !== 'string' || content.trim().length === 0) {
            return NextResponse.json({ error: 'Content is required and must be a non-empty string' }, { status: 400 });
        }

        if (ttl_seconds !== undefined && ttl_seconds !== null) {
            if (!Number.isInteger(ttl_seconds) || ttl_seconds < 1) {
                return NextResponse.json({ error: 'ttl_seconds must be an integer >= 1' }, { status: 400 });
            }
        }

        if (max_views !== undefined && max_views !== null) {
            if (!Number.isInteger(max_views) || max_views < 1) {
                return NextResponse.json({ error: 'max_views must be an integer >= 1' }, { status: 400 });
            }
        }

        const id = await createPaste(content, ttl_seconds, max_views);

        // Construct URL
        const host = req.headers.get('host') || 'localhost:3000';
        const protocol = req.headers.get('x-forwarded-proto') || 'http';
        const url = `${protocol}://${host}/p/${id}`;

        return NextResponse.json({ id, url }, { status: 200 });

    } catch (error) {
        console.error('Create paste error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
