import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000/api/v1';

type BreedingEvent = {
  id: string;
  status: string;
  matingDate: string;
  buck?: { tagNumber: string; name?: string | null };
  doe?: { tagNumber: string; name?: string | null };
};

type Buck = { id: string; tagNumber: string; name?: string | null };
type Doe = { id: string; tagNumber: string; name?: string | null };

export default function BreedingEventsPage() {
  const [events, setEvents] = useState<BreedingEvent[]>([]);
  const [bucks, setBucks] = useState<Buck[]>([]);
  const [does, setDoes] = useState<Doe[]>([]);
  const [form, setForm] = useState({
    buckId: '',
    doeId: '',
    matingType: 'NATURAL',
    matingDate: '',
    status: 'PLANNED',
    notes: '',
  });
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    const [eventsRes, bucksRes, doesRes] = await Promise.all([
      fetch(`${API_BASE_URL}/breeding-events?search=${encodeURIComponent(search)}`),
      fetch(`${API_BASE_URL}/bucks`),
      fetch(`${API_BASE_URL}/does`),
    ]);
    const eventsJson = await eventsRes.json();
    const bucksJson = await bucksRes.json();
    const doesJson = await doesRes.json();
    setEvents(eventsJson.data ?? []);
    setBucks(bucksJson.data ?? []);
    setDoes(doesJson.data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    void load();
  }, [search]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    await fetch(`${API_BASE_URL}/breeding-events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, matingDate: new Date(form.matingDate).toISOString() }),
    });
    setForm({
      buckId: '',
      doeId: '',
      matingType: 'NATURAL',
      matingDate: '',
      status: 'PLANNED',
      notes: '',
    });
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
            <h1 className="text-3xl font-semibold text-stone-900">Breeding Events</h1>
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
          <div className="grid gap-4 md:grid-cols-3">
            <select
              value={form.buckId}
              onChange={(event) => setForm({ ...form, buckId: event.target.value })}
              className="rounded-lg border border-stone-300 px-3 py-2"
              required
            >
              <option value="">Select buck</option>
              {bucks.map((buck) => (
                <option key={buck.id} value={buck.id}>
                  {buck.tagNumber} {buck.name ? `(${buck.name})` : ''}
                </option>
              ))}
            </select>
            <select
              value={form.doeId}
              onChange={(event) => setForm({ ...form, doeId: event.target.value })}
              className="rounded-lg border border-stone-300 px-3 py-2"
              required
            >
              <option value="">Select doe</option>
              {does.map((doe) => (
                <option key={doe.id} value={doe.id}>
                  {doe.tagNumber} {doe.name ? `(${doe.name})` : ''}
                </option>
              ))}
            </select>
            <select
              value={form.matingType}
              onChange={(event) => setForm({ ...form, matingType: event.target.value })}
              className="rounded-lg border border-stone-300 px-3 py-2"
            >
              <option value="NATURAL">Natural</option>
              <option value="ARTIFICIAL_INSEMINATION">Artificial insemination</option>
            </select>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <input
              type="date"
              value={form.matingDate}
              onChange={(event) => setForm({ ...form, matingDate: event.target.value })}
              className="rounded-lg border border-stone-300 px-3 py-2"
              required
            />
            <select
              value={form.status}
              onChange={(event) => setForm({ ...form, status: event.target.value })}
              className="rounded-lg border border-stone-300 px-3 py-2"
            >
              <option value="PLANNED">Planned</option>
              <option value="MATED">Mated</option>
              <option value="PREGNANT">Pregnant</option>
              <option value="KIDDED">Kidded</option>
              <option value="FAILED">Failed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
            <input
              value={form.notes}
              onChange={(event) => setForm({ ...form, notes: event.target.value })}
              placeholder="Notes"
              className="rounded-lg border border-stone-300 px-3 py-2"
            />
          </div>
          <div className="mt-4 flex justify-end">
            <button className="rounded-lg bg-stone-900 px-4 py-2 text-sm font-semibold text-white">
              Create breeding event
            </button>
          </div>
        </form>

        <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search breeding events"
            className="mb-4 rounded-lg border border-stone-300 px-3 py-2"
          />
          {loading ? (
            <p className="text-sm text-stone-500">Loading...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-stone-200 text-left text-stone-600">
                    <th className="px-3 py-2">Buck</th>
                    <th className="px-3 py-2">Doe</th>
                    <th className="px-3 py-2">Mating date</th>
                    <th className="px-3 py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((event) => (
                    <tr key={event.id} className="border-b border-stone-100">
                      <td className="px-3 py-2">{event.buck?.tagNumber ?? '—'}</td>
                      <td className="px-3 py-2">{event.doe?.tagNumber ?? '—'}</td>
                      <td className="px-3 py-2">
                        {new Date(event.matingDate).toLocaleDateString()}
                      </td>
                      <td className="px-3 py-2">{event.status}</td>
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
