'use client';

import { signOut } from 'next-auth/react';
import { LogOut } from 'lucide-react';

export default function LogoutButton() {
    return (
        <button
            onClick={() => signOut()}
            className="btn"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.1)' }}
        >
            <LogOut size={16} />
            Logout
        </button>
    );
}
