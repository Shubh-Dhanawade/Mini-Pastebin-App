import { getPaste } from '@/lib/pastes';
import { notFound } from 'next/navigation';

export default async function ViewPaste({ params }: { params: Promise<{ id: string }> }) {
    // Deterministic Time Logic (Read from headers if possible? No, Server Components don't easily access request headers for logic like this without headers() function)
    // But wait, the REQUIREMENT says "Use request header x-test-now-ms ... This applies ONLY to expiry logic"
    // If I use `headers()` from `next/headers`, I can get it.

    // NOTE: In production (Vercel), usually caching might be an issue, but for Pastebin logic we want dynamic.
    // Next.js App Router: default is dynamic if we use headers() or searchParams.

    // We cannot easily pass `x-test-now-ms` to a browser navigation (GET /p/id).
    // The User Request says "Visiting the URL displays the paste content".
    // Automated tests will likely use API or maybe Puppeteer setting headers?
    // If verifying via HTML, we should support it if the header is present.

    // However, `headers()` is readonly.

    const { headers } = await import('next/headers');
    const headersList = await headers();
    const testNow = headersList.get('x-test-now-ms');

    let now = Date.now();
    if (process.env.TEST_MODE === '1' && testNow) {
        const parsed = parseInt(testNow, 10);
        if (!isNaN(parsed)) now = parsed;
    }

    const resolvedParams = await params;
    const paste = await getPaste(resolvedParams.id, now);

    if (!paste) {
        notFound();
    }

    return (
        <main className="min-h-screen p-8 max-w-3xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-slate-300">Paste Configuration</h1>
                <a href="/" className="text-blue-400 hover:underline text-sm">Create New</a>
            </div>

            <div className="bg-slate-900 border border-slate-700 rounded-lg overflow-hidden">
                <div className="bg-slate-800 px-4 py-2 border-b border-slate-700 flex justify-between text-xs text-slate-400 font-mono">
                    <span>Views left: {paste.remaining_views !== undefined && paste.remaining_views !== null ? paste.remaining_views : '∞'}</span>
                    <span>Expires: {paste.expires_at ? new Date(paste.expires_at).toLocaleString() : 'Never'}</span>
                </div>
                <pre className="p-6 overflow-auto text-sm font-mono text-slate-200 whitespace-pre-wrap break-words">
                    {paste.content}
                </pre>
            </div>
        </main>
    );
}
