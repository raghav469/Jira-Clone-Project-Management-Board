'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function SignIn() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get('callbackUrl') || '/';
    const error = searchParams.get('error');

    async function handleSubmit(e) {
        e.preventDefault();
        setLoading(true);

        const res = await signIn('credentials', {
            redirect: false,
            email,
            password,
            callbackUrl,
        });

        if (res?.error) {
            setLoading(false);
            // alert('Invalid credentials'); // Simple alert for now or add UI state
        } else {
            router.push(callbackUrl);
        }
    }

    return (
        <div className="signin-container">
            <div className="signin-card glass-panel">
                <h1 className="signin-title">Welcome Back</h1>
                <p className="signin-subtitle">Login to your Project Board</p>

                {error && (
                    <div className="error-message">
                        {error === 'CredentialsSignin' ? 'Invalid email or password' : 'An error occurred'}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="signin-form">
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            id="email"
                            type="email"
                            placeholder="user@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            id="password"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="btn signin-btn" disabled={loading}>
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <div className="auth-footer">
                    Made by <span className="highlight">Raghav Saini</span>
                </div>
            </div>

            <style jsx>{`
        .signin-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg-primary); 
          /* Inherits from globals but ensure full height and centering */
        }
        .signin-card {
          width: 100%;
          max-width: 400px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .signin-title {
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
          background: linear-gradient(to right, #818cf8, #c084fc);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .signin-subtitle {
          color: var(--text-secondary);
          margin-bottom: 2rem;
        }
        .signin-form {
          width: 100%;
        }
        .form-group {
          margin-bottom: 1.5rem;
          text-align: left;
          width: 100%;
        }
        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          color: var(--text-secondary);
          font-size: 0.875rem;
        }
        .signin-btn {
          width: 100%;
          margin-top: 1rem;
          background: linear-gradient(90deg, var(--accent-color), #c084fc);
        }
        .error-message {
            background: rgba(239, 68, 68, 0.2);
            color: #fca5a5;
            padding: 0.75rem;
            border-radius: 0.5rem;
            margin-bottom: 1.5rem;
            width: 100%;
            text-align: center;
            border: 1px solid rgba(239, 68, 68, 0.5);
        }
        .auth-footer {
          margin-top: 2rem;
          font-size: 0.875rem;
          color: var(--text-secondary);
        }
        .highlight {
          color: var(--accent-color);
          font-weight: 600;
        }
      `}</style>
        </div>
    );
}
