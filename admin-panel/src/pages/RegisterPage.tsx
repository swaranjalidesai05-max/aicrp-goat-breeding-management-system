import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { requestJson } from '../lib/api';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('DATA_ENUMERATOR');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);

    try {
      await requestJson('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password, fullName, phone: phone || undefined, role }),
      });

      navigate('/login', { state: { registered: true, email } });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to register account.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-stone-100 px-6 py-16">
      <div className="w-full max-w-xl rounded-2xl border border-stone-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-stone-500">AICRP</p>
        <h1 className="mt-3 text-3xl font-semibold text-stone-900">Create Admin Account</h1>
        <p className="mt-2 text-sm text-stone-600">
          Register a new staff account to access the breeding dashboard.
        </p>

        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <label className="block text-sm font-medium text-stone-700">
            Full Name
            <input
              type="text"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 outline-none ring-0"
              required
            />
          </label>

          <label className="block text-sm font-medium text-stone-700">
            Email
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 outline-none ring-0"
              required
            />
          </label>

          <label className="block text-sm font-medium text-stone-700">
            Phone (optional)
            <input
              type="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 outline-none ring-0"
            />
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="block text-sm font-medium text-stone-700">
              Password
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 outline-none ring-0"
                required
              />
            </label>
            <label className="block text-sm font-medium text-stone-700">
              Confirm Password
              <input
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 outline-none ring-0"
                required
              />
            </label>
          </div>

          <label className="block text-sm font-medium text-stone-700">
            Role
            <select
              value={role}
              onChange={(event) => setRole(event.target.value)}
              className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 outline-none ring-0"
            >
              <option value="DIRECTOR">Director</option>
              <option value="HOD">HOD</option>
              <option value="SENIOR_SCIENTIST">Senior Scientist</option>
              <option value="CO_PI">Co-PI</option>
              <option value="DATA_ENUMERATOR">Data Enumerator</option>
            </select>
          </label>

          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          <button
            type="submit"
            className="w-full rounded-lg bg-stone-900 px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Registering...' : 'Create account'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-stone-500">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-stone-900 underline">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
