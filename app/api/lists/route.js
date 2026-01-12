import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import List from '@/models/List';
import Board from '@/models/Board';

export async function POST(req) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, boardId } = await req.json();
    if (!title || !boardId) {
        return NextResponse.json({ error: 'Title and Board ID are required' }, { status: 400 });
    }

    await dbConnect();

    // Verify board ownership/membership
    const board = await Board.findOne({
        _id: boardId,
        $or: [{ owner: session.user.id }, { members: session.user.id }]
    });

    if (!board) {
        return NextResponse.json({ error: 'Board not found or unauthorized' }, { status: 404 });
    }

    // Get current list count for order
    const listCount = board.lists.length;

    const list = await List.create({
        title,
        boardId,
        order: listCount,
        cards: []
    });

    // Add list to board
    board.lists.push(list._id);
    await board.save();

    return NextResponse.json(list);
}
