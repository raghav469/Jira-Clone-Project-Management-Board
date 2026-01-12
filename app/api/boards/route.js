import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Board from '@/models/Board';

export async function GET(req) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const boards = await Board.find({
        $or: [
            { owner: session.user.id },
            { members: session.user.id }
        ]
    }).sort({ createdAt: -1 });

    return NextResponse.json(boards);
}

export async function POST(req) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title } = await req.json();
    if (!title) {
        return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    await dbConnect();
    const board = await Board.create({
        title,
        owner: session.user.id,
        members: [session.user.id],
        lists: []
    });

    return NextResponse.json(board);
}
