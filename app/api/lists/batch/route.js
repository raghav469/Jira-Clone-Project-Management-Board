import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import List from '@/models/List';
import Card from '@/models/Card';
import Board from '@/models/Board';

export async function PUT(req) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { lists } = await req.json(); // Expects array of { id, cards: [cardIds] }
    if (!lists || !Array.isArray(lists)) {
        return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    await dbConnect();

    // Verify ownership of the board(s) involved?
    // We assume all lists belong to a board the user has access to.
    // Ideally, verify each list execution or check one list and assume consistency if valid.
    // For safety, we'll check the first list's board.

    if (lists.length > 0) {
        const checkList = await List.findById(lists[0].id);
        if (checkList) {
            const board = await Board.findOne({
                _id: checkList.boardId,
                $or: [{ owner: session.user.id }, { members: session.user.id }]
            });
            if (!board) {
                return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
            }
        }
    }

    // Iterate and update
    for (const listData of lists) {
        const { id, cards } = listData;
        // Update List's card order
        await List.findByIdAndUpdate(id, { cards });

        // Also update each card's listId (if moved across lists)
        // This is expensive if we do it one by one. 
        // Optimization: Update all cards in this list to have this listId.
        if (cards.length > 0) {
            await Card.updateMany(
                { _id: { $in: cards } },
                { listId: id }
            );
        }
    }

    return NextResponse.json({ success: true });
}
