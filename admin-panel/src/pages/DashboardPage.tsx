import { Link } from 'react-router-dom';

import { useAuth } from '../contexts/AuthContext';

const modules = [
  { title: 'Villages', description: 'Create and search village records', href: '/villages' },
  { title: 'Users', description: 'Manage staff accounts and roles', href: '/users' },
  { title: 'Farmers', description: 'Track farmer profiles and mapping', href: '/farmers' },
  { title: 'Bucks', description: 'Track buck inventory and status', href: '/bucks' },
  { title: 'Does', description: 'Track doe inventory and status', href: '/does' },
  {
    title: 'Breeding Events',
    description: 'Record mating plans and outcomes',
    href: '/breeding-events',
  },
];

export default function DashboardPage() {
  const { user, logout } = useAuth();

  return (
    <main className="min-h-screen bg-stone-50 px-6 py-16">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 rounded-2xl border border-stone-200 bg-white p-8 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-stone-500">
              Authenticated
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-stone-900">Welcome back</h1>
          </div>
          <button
            onClick={() => void logout()}
            className="rounded-lg border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700"
          >
            Logout
          </button>
        </div>

        <div className="rounded-xl bg-stone-100 p-4 text-sm text-stone-700">
          <p>
            <span className="font-semibold">Signed in as:</span> {user?.fullName ?? user?.email}
          </p>
          <p className="mt-2">
            <span className="font-semibold">Role:</span> {user?.role}
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {modules.map((module) => (
            <Link
              key={module.href}
              to={module.href}
              className="rounded-2xl border border-stone-200 p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-stone-300"
            >
              <h2 className="text-lg font-semibold text-stone-900">{module.title}</h2>
              <p className="mt-2 text-sm text-stone-600">{module.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
