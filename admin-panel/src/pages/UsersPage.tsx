import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { requestJson } from '../lib/api';

type User = {
  id: string;
  email: string;
  fullName: string;
  role: string;
  isActive: boolean;
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [form, setForm] = useState({
    email: '',
    password: '',
    fullName: '',
    role: 'DATA_ENUMERATOR',
  });
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    const json = await requestJson(`/auth/users?search=${encodeURIComponent(search)}`);
    setUsers(json.data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    void load();
  }, [search]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    await requestJson('/auth/users', {
      method: 'POST',
      body: JSON.stringify(form),
    });
    setForm({ email: '', password: '', fullName: '', role: 'DATA_ENUMERATOR' });
    void load();
  };

  return (
    <main className="min-h-screen bg-stone-50 p-6">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-stone-500">
              Management
            </p>
            <h1 className="text-3xl font-semibold text-stone-900">Users</h1>
          </div>
          <Link
            to="/"
            className="rounded-lg border border-stone-300 px-4 py-2 text-sm text-stone-700"
          >
            Back to dashboard
          </Link>
        </div>

        <form
          onSubmit={submit}
          className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm"
        >
          <div className="grid gap-4 md:grid-cols-4">
            <input
              value={form.fullName}
              onChange={(event) => setForm({ ...form, fullName: event.target.value })}
              placeholder="Full name"
              className="rounded-lg border border-stone-300 px-3 py-2"
              required
            />
            <input
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
              placeholder="Email"
              className="rounded-lg border border-stone-300 px-3 py-2"
              required
            />
            <input
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
              placeholder="Password"
              className="rounded-lg border border-stone-300 px-3 py-2"
              required
            />
            <select
              value={form.role}
              onChange={(event) => setForm({ ...form, role: event.target.value })}
              className="rounded-lg border border-stone-300 px-3 py-2"
            >
              <option value="DIRECTOR">Director</option>
              <option value="HOD">HOD</option>
              <option value="SENIOR_SCIENTIST">Senior Scientist</option>
              <option value="CO_PI">Co-PI</option>
              <option value="DATA_ENUMERATOR">Data Enumerator</option>
            </select>
          </div>
          <div className="mt-4">
            <button className="rounded-lg bg-stone-900 px-4 py-2 text-sm font-semibold text-white">
              Create user
            </button>
          </div>
        </form>

        <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search users"
            className="mb-4 rounded-lg border border-stone-300 px-3 py-2"
          />
          {loading ? (
            <p className="text-sm text-stone-500">Loading...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-stone-200 text-left text-stone-600">
                    <th className="px-3 py-2">Name</th>
                    <th className="px-3 py-2">Email</th>
                    <th className="px-3 py-2">Role</th>
                    <th className="px-3 py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b border-stone-100">
                      <td className="px-3 py-2">{user.fullName}</td>
                      <td className="px-3 py-2">{user.email}</td>
                      <td className="px-3 py-2">{user.role}</td>
                      <td className="px-3 py-2">{user.isActive ? 'Active' : 'Inactive'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
