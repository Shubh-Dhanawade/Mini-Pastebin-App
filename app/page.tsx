'use client';

import { useState } from 'react';

export default function Home() {
    const [content, setContent] = useState('');
    const [ttl, setTtl] = useState<string>('');
    const [maxViews, setMaxViews] = useState<string>('');
    const [result, setResult] = useState<{ url: string } | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const res = await fetch('/api/pastes', {
                method: 'post',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    content,
                    ttl_seconds: ttl ? parseInt(ttl) : null,
                    max_views: maxViews ? parseInt(maxViews) : null,
                }),
            });

            let data;
            const contentType = res.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                data = await res.json();
            } else {
                const text = await res.text();
                // If it's HTML, it's likely a Next.js error page
                console.error('Server returned non-JSON response:', text);
                throw new Error(`Server Error (${res.status}): Please check your server definition/logs.`);
            }

            if (!res.ok) {
                throw new Error(data.error || 'Failed to create paste');
            }

            setResult(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen p-8 max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-500">
                Pastebin Lite
            </h1>

            <form onSubmit={handleSubmit} className="space-y-6 bg-white/5 p-6 rounded-lg border border-white/10 dark:text-white">
                <div>
                    <label className="block mb-2 font-medium">Text Content</label>
                    <textarea
                        required
                        className="w-full h-48 p-3 bg-slate-900 border border-slate-700 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none text-white font-mono"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Paste your text here..."
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block mb-2 text-sm">TTL (Seconds, Optional)</label>
                        <input
                            type="number"
                            min="1"
                            className="w-full p-2 bg-slate-900 border border-slate-700 rounded text-white"
                            value={ttl}
                            onChange={(e) => setTtl(e.target.value)}
                            placeholder="e.g. 3600"
                        />
                    </div>
                    <div>
                        <label className="block mb-2 text-sm">Max Views (Optional)</label>
                        <input
                            type="number"
                            min="1"
                            className="w-full p-2 bg-slate-900 border border-slate-700 rounded text-white"
                            value={maxViews}
                            onChange={(e) => setMaxViews(e.target.value)}
                            placeholder="e.g. 5"
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded transition disabled:opacity-50"
                >
                    {loading ? 'Creating...' : 'Create Paste'}
                </button>
            </form>

            {error && (
                <div className="mt-6 p-4 bg-red-900/50 border border-red-500 text-red-200 rounded">
                    Error: {error}
                </div>
            )}

            {result && (
                <div className="mt-6 p-6 bg-green-900/30 border border-green-500 rounded text-center">
                    <p className="mb-2 text-green-300">Paste Created Successfully!</p>
                    <a
                        href={result.url}
                        className="text-xl font-mono text-blue-400 hover:underline break-all"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        {result.url}
                    </a>
                </div>
            )}
        </main>
    );
}
