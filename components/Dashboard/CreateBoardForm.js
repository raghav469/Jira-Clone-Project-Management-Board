'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, X } from 'lucide-react';

export default function CreateBoardForm() {
    const [isCreating, setIsCreating] = useState(false);
    const [title, setTitle] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    async function handleSubmit(e) {
        e.preventDefault();
        if (!title.trim()) return;

        setLoading(true);
        try {
            const res = await fetch('/api/boards', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title }),
            });

            if (res.ok) {
                setTitle('');
                setIsCreating(false);
                router.refresh();
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    if (isCreating) {
        return (
            <div className="glass-panel" style={{ minHeight: '150px', border: '1px dashed var(--accent-color)' }}>
                <form onSubmit={handleSubmit}>
                    <input
                        autoFocus
                        type="text"
                        placeholder="Board Title..."
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        disabled={loading}
                    />
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button type="submit" className="btn" disabled={loading} style={{ flex: 1 }}>
                            {loading ? 'Creating...' : 'Create'}
                        </button>
                        <button
                            type="button"
                            className="btn"
                            onClick={() => setIsCreating(false)}
                            style={{ background: 'transparent', border: '1px solid var(--glass-border)' }}
                        >
                            <X size={16} />
                        </button>
                    </div>
                </form>
            </div>
        );
    }

    return (
        <button
            onClick={() => setIsCreating(true)}
            className="glass-panel"
            style={{
                minHeight: '150px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                border: '1px dashed var(--glass-border)',
                width: '100%',
                color: 'var(--text-secondary)'
            }}
        >
            <Plus size={32} />
            <span style={{ marginTop: '0.5rem' }}>Create Board</span>
        </button>
    );
}
