import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import dbConnect from '@/lib/db';
import Board from '@/models/Board';
import Link from 'next/link';
import CreateBoardForm from '@/components/Dashboard/CreateBoardForm';
import LogoutButton from '@/components/Auth/LogoutButton';

export default async function Dashboard() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/api/auth/signin');
  }

  await dbConnect();
  const boards = await Board.find({
    $or: [{ owner: session.user.id }, { members: session.user.id }]
  }).sort({ updatedAt: -1 });

  return (
    <div className="container">
      <header className="page-header">
        <h1 className="page-title">My Boards</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ color: 'var(--text-secondary)' }}>{session.user.name}</span>
          <LogoutButton />
        </div>
      </header>

      <div className="grid-container">
        {boards.map(board => (
          <Link href={`/board/${board._id}`} key={board._id.toString()} className="board-card glass-panel">
            <h3>{board.title}</h3>
            <p>Last active: {new Date(board.updatedAt).toLocaleDateString()}</p>
          </Link>
        ))}
        <CreateBoardForm />
      </div>

      <style>{`
        .grid-container {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 2rem;
        }
        .board-card {
           display: block;
           text-decoration: none;
           min-height: 150px;
           transition: transform 0.2s, background 0.2s;
           position: relative;
           overflow: hidden;
        }
        .board-card::before {
           content: '';
           position: absolute;
           top: 0; left: 0; width: 100%; height: 5px;
           background: linear-gradient(90deg, var(--accent-color), #c084fc);
           opacity: 0.7;
        }
        .board-card:hover {
           transform: translateY(-5px);
           background: rgba(30, 41, 59, 0.9);
        }
        .board-card h3 {
           font-size: 1.25rem;
           margin-bottom: 0.5rem;
           color: var(--text-primary);
        }
        .board-card p {
           color: var(--text-secondary);
           font-size: 0.875rem;
        }
      `}</style>
    </div>
  );
}
