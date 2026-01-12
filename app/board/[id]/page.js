import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import dbConnect from '@/lib/db';
import Board from '@/models/Board';
// We need to preload models or ensure deep populate works
import '@/models/List';
import '@/models/Card';
import BoardClient from '@/components/Board/BoardClient';
import Link from 'next/link';

export default async function BoardPage({ params }) {
    const session = await getServerSession(authOptions);
    if (!session) redirect('/api/auth/signin');

    const { id } = await params;
    await dbConnect();

    // Populate lists and cards
    // Need deep populate
    const board = await Board.findOne({
        _id: id,
        $or: [{ owner: session.user.id }, { members: session.user.id }]
    }).populate({
        path: 'lists',
        options: { sort: { order: 1 } },
        populate: {
            path: 'cards',
            model: 'Card',
            options: { sort: { order: 1 } }
        }
    });

    if (!board) {
        return <div className="container">Board not found or unauthorized</div>;
    }

    // Convert to plain object to avoid hydration issues with Mongoose docs
    const boardData = JSON.parse(JSON.stringify(board));

    // Sort lists by order just in case
    // boardData.lists.sort((a,b) => a.order - b.order); // already sorted by populate options?

    return (
        <div className="container" style={{ maxWidth: '100%', overflow: 'hidden' }}>
            <header className="page-header">
                <div className="flex items-center gap-4">
                    <Link href="/" className="btn" style={{ background: 'transparent', border: '1px solid var(--glass-border)' }}>← Back</Link>
                    <h1 className="page-title">{board.title}</h1>
                </div>
                <div className="flex items-center gap-2">
                    {/* Admin tools or Members list */}
                </div>
            </header>

            <BoardClient board={boardData} />
        </div>
    );
}
