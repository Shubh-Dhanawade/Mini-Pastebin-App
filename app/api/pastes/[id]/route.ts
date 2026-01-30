import { NextRequest, NextResponse } from 'next/server';
import { getPaste } from '@/lib/pastes';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    const id = params.id;

    // Deterministic Time logic
    let now = Date.now();
    const isTestMode = process.env.TEST_MODE === '1';
    if (isTestMode) {
        const testNow = req.headers.get('x-test-now-ms');
        if (testNow) {
            const parsed = parseInt(testNow, 10);
            if (!isNaN(parsed)) {
                now = parsed;
            }
        }
    }

    try {
        const result = await getPaste(id, now);

        if (!result) {
            return NextResponse.json({ error: 'Paste not found or unavailable' }, { status: 404 });
        }

        return NextResponse.json({
            content: result.content,
            remaining_views: result.remaining_views,
            expires_at: result.expires_at ? new Date(result.expires_at).toISOString() : null, // API spec says string | null
        });

    } catch (error) {
        console.error('Fetch paste error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
