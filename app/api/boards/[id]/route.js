import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Board from '@/models/Board';

export async function GET(req, { params }) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    await dbConnect();

    const board = await Board.findOne({
        _id: id,
        $or: [
            { owner: session.user.id },
            { members: session.user.id }
        ]
    }).populate({
        path: 'lists',
        populate: { path: 'cards', populate: { path: 'assignees' } }
    });

    if (!board) {
        return NextResponse.json({ error: 'Board not found' }, { status: 404 });
    }

    return NextResponse.json(board);
}

export async function PUT(req, { params }) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const data = await req.json();

    await dbConnect();

    // Check ownership/membership permissions here
    const board = await Board.findOne({
        _id: id,
        $or: [{ owner: session.user.id }, { members: session.user.id }]
    });

    if (!board) {
        return NextResponse.json({ error: 'Board not found' }, { status: 404 });
    }

    // Update fields
    if (data.title) board.title = data.title;
    if (data.lists) board.lists = data.lists; // For reordering lists

    await board.save();

    return NextResponse.json(board);
}

export async function DELETE(req, { params }) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    await dbConnect();

    // Only owner can delete
    const board = await Board.findOne({
        _id: id,
        owner: session.user.id
    });

    if (!board) {
        return NextResponse.json({ error: 'Board not found or unauthorized' }, { status: 404 });
    }

    await Board.deleteOne({ _id: id });

    // TODO: Cleanup lists and cards (cascade delete)

    return NextResponse.json({ success: true });
}
