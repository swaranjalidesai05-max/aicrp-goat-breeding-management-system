import { Link } from 'react-router-dom';

export default function ReportsPage() {
  return (
    <main className="min-h-screen bg-stone-50 p-6">
      <div className="mx-auto max-w-6xl rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-stone-500">
              Reports
            </p>
            <h1 className="text-3xl font-semibold text-stone-900">Reports</h1>
          </div>
          <Link
            to="/"
            className="rounded-lg border border-stone-300 px-4 py-2 text-sm text-stone-700"
          >
            Back to dashboard
          </Link>
        </div>
        <p className="mt-6 text-sm text-stone-600">
          Reports are not implemented yet. This placeholder keeps the admin UI build passing.
        </p>
      </div>
    </main>
  );
}
