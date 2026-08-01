import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000/api/v1';

type Village = {
  id: string;
  clusterId: string;
  code: string;
  name: string;
  latitude?: number | null;
  longitude?: number | null;
  isActive: boolean;
  cluster?: { name: string };
};

type Cluster = { id: string; name: string };

export default function VillagesPage() {
  const [villages, setVillages] = useState<Village[]>([]);
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [form, setForm] = useState({
    code: '',
    name: '',
    clusterId: '',
    latitude: '',
    longitude: '',
  });
  const [filterCluster, setFilterCluster] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [villagesRes, clustersRes] = await Promise.all([
        fetch(
          `${API_BASE_URL}/villages?search=${encodeURIComponent(search)}${filterCluster ? `&clusterId=${filterCluster}` : ''}`,
        ),
        fetch(`${API_BASE_URL}/clusters`),
      ]);
      const villagesJson = await villagesRes.json();
      const clustersJson = await clustersRes.json();
      setVillages(villagesJson.data ?? []);
      setClusters(clustersJson.data ?? []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [search, filterCluster]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const payload = {
      clusterId: form.clusterId,
      code: form.code,
      name: form.name,
      latitude: form.latitude ? Number(form.latitude) : null,
      longitude: form.longitude ? Number(form.longitude) : null,
    };
    await fetch(`${API_BASE_URL}/villages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    setForm({ code: '', name: '', clusterId: '', latitude: '', longitude: '' });
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
            <h1 className="text-3xl font-semibold text-stone-900">Villages</h1>
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
              value={form.code}
              onChange={(event) => setForm({ ...form, code: event.target.value })}
              placeholder="Village code"
              className="rounded-lg border border-stone-300 px-3 py-2"
              required
            />
            <input
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
              placeholder="Village name"
              className="rounded-lg border border-stone-300 px-3 py-2"
              required
            />
            <select
              value={form.clusterId}
              onChange={(event) => setForm({ ...form, clusterId: event.target.value })}
              className="rounded-lg border border-stone-300 px-3 py-2"
              required
            >
              <option value="">Select cluster</option>
              {clusters.map((cluster) => (
                <option key={cluster.id} value={cluster.id}>
                  {cluster.name}
                </option>
              ))}
            </select>
            <input
              value={form.latitude}
              onChange={(event) => setForm({ ...form, latitude: event.target.value })}
              placeholder="Latitude"
              className="rounded-lg border border-stone-300 px-3 py-2"
            />
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <input
              value={form.longitude}
              onChange={(event) => setForm({ ...form, longitude: event.target.value })}
              placeholder="Longitude"
              className="rounded-lg border border-stone-300 px-3 py-2"
            />
            <button className="rounded-lg bg-stone-900 px-4 py-2 text-sm font-semibold text-white">
              Add village
            </button>
          </div>
        </form>

        <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search villages"
              className="rounded-lg border border-stone-300 px-3 py-2"
            />
            <select
              value={filterCluster}
              onChange={(event) => setFilterCluster(event.target.value)}
              className="rounded-lg border border-stone-300 px-3 py-2"
            >
              <option value="">All clusters</option>
              {clusters.map((cluster) => (
                <option key={cluster.id} value={cluster.id}>
                  {cluster.name}
                </option>
              ))}
            </select>
          </div>
          {loading ? (
            <p className="text-sm text-stone-500">Loading...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-stone-200 text-left text-stone-600">
                    <th className="px-3 py-2">Code</th>
                    <th className="px-3 py-2">Name</th>
                    <th className="px-3 py-2">Cluster</th>
                    <th className="px-3 py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {villages.map((village) => (
                    <tr key={village.id} className="border-b border-stone-100">
                      <td className="px-3 py-2">{village.code}</td>
                      <td className="px-3 py-2">{village.name}</td>
                      <td className="px-3 py-2">{village.cluster?.name ?? '—'}</td>
                      <td className="px-3 py-2">{village.isActive ? 'Active' : 'Inactive'}</td>
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
