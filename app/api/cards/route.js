import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Card from '@/models/Card';
import List from '@/models/List';
import Board from '@/models/Board';

export async function POST(req) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, listId, boardId } = await req.json(); // boardId needed for verification? listId implies board but checking permission on list is harder without board context unless we populate.
    // Actually, list has boardId.

    if (!title || !listId) {
        return NextResponse.json({ error: 'Title and List ID are required' }, { status: 400 });
    }

    await dbConnect();

    const list = await List.findById(listId);
    if (!list) {
        return NextResponse.json({ error: 'List not found' }, { status: 404 });
    }

    // Verify board access
    // We should check if user has access to list.boardId
    const board = await Board.findOne({
        _id: list.boardId,
        $or: [{ owner: session.user.id }, { members: session.user.id }]
    });

    if (!board) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const cardCount = list.cards.length;

    const card = await Card.create({
        title,
        listId,
        order: cardCount,
        assignees: [] // Default: no assignees
    });

    list.cards.push(card._id);
    await list.save();

    return NextResponse.json(card);
}
