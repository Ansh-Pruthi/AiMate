// src/pages/RegisterPage.tsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { type IRegisterInput } from '../types';

export const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState<IRegisterInput>({
    name: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await register(form);
      navigate('/');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Registration failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[#212121] px-4 overflow-hidden">

      {/* Ambient glows */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-white/2.5 blur-3xl" />
        <div className="absolute bottom-0 left-1/4 h-64 w-64 rounded-full bg-white/1.5 blur-3xl" />
      </div>

      <div
        className="relative w-full max-w-sm"
        style={{ animation: 'fadeSlideUp 0.45s ease both' }}
      >
        {/* Glass card */}
        <div className="rounded-2xl border border-white/[0.07] bg-white/3 px-8 py-10 shadow-2xl">

          {/* Header */}
          <div
            className="mb-8 text-center"
            style={{ animation: 'fadeSlideUp 0.45s 0.05s ease both', animationFillMode: 'both' }}
          >
            <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
            </div>
            <h1 className="text-xl font-semibold tracking-tight text-white">Create account</h1>
            <p className="mt-1.5 text-sm text-gray-500">Start chatting with AI today</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div style={{ animation: 'fadeSlideUp 0.4s 0.1s ease both', animationFillMode: 'both' }}>
              <Input
                label="Name"
                type="text"
                placeholder="John Doe"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                autoFocus
              />
            </div>

            <div style={{ animation: 'fadeSlideUp 0.4s 0.15s ease both', animationFillMode: 'both' }}>
              <Input
                label="Email"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>

            <div style={{ animation: 'fadeSlideUp 0.4s 0.2s ease both', animationFillMode: 'both' }}>
              <Input
                label="Password"
                type="password"
                placeholder="Min 8 chars, uppercase, number"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>

            {error && (
              <div
                style={{ animation: 'fadeSlideUp 0.3s ease both' }}
                className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3"
              >
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            <div
              style={{ animation: 'fadeSlideUp 0.4s 0.25s ease both', animationFillMode: 'both' }}
              className="pt-1"
            >
              <Button type="submit" fullWidth isLoading={isLoading}>
                Create account
              </Button>
            </div>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-white/6" />
            <span className="text-xs text-gray-600">already a member?</span>
            <div className="h-px flex-1 bg-white/6" />
          </div>

          <p className="text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-medium text-gray-300 underline-offset-4 transition-all duration-200 hover:text-white hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>

      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
      `}</style>
    </div>
  );
};