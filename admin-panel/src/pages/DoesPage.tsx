import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000/api/v1';

type Doe = {
  id: string;
  tagNumber: string;
  name?: string | null;
  breed: string;
  status: string;
  cluster?: { name: string };
  farmer?: { fullName: string };
};

type Cluster = { id: string; name: string };
type Farmer = { id: string; fullName: string };

export default function DoesPage() {
  const [does, setDoes] = useState<Doe[]>([]);
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [form, setForm] = useState({
    tagNumber: '',
    name: '',
    breed: 'Sangamneri',
    status: 'ACTIVE',
    clusterId: '',
    farmerId: '',
    notes: '',
  });
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    const [doesRes, clustersRes, farmersRes] = await Promise.all([
      fetch(`${API_BASE_URL}/does?search=${encodeURIComponent(search)}`),
      fetch(`${API_BASE_URL}/clusters`),
      fetch(`${API_BASE_URL}/farmers`),
    ]);
    const doesJson = await doesRes.json();
    const clustersJson = await clustersRes.json();
    const farmersJson = await farmersRes.json();
    setDoes(doesJson.data ?? []);
    setClusters(clustersJson.data ?? []);
    setFarmers(farmersJson.data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    void load();
  }, [search]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    await fetch(`${API_BASE_URL}/does`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, farmerId: form.farmerId || null }),
    });
    setForm({
      tagNumber: '',
      name: '',
      breed: 'Sangamneri',
      status: 'ACTIVE',
      clusterId: '',
      farmerId: '',
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
            <h1 className="text-3xl font-semibold text-stone-900">Does</h1>
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
            <input
              value={form.tagNumber}
              onChange={(event) => setForm({ ...form, tagNumber: event.target.value })}
              placeholder="Tag number"
              className="rounded-lg border border-stone-300 px-3 py-2"
              required
            />
            <input
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
              placeholder="Name"
              className="rounded-lg border border-stone-300 px-3 py-2"
            />
            <input
              value={form.breed}
              onChange={(event) => setForm({ ...form, breed: event.target.value })}
              placeholder="Breed"
              className="rounded-lg border border-stone-300 px-3 py-2"
            />
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <select
              value={form.status}
              onChange={(event) => setForm({ ...form, status: event.target.value })}
              className="rounded-lg border border-stone-300 px-3 py-2"
            >
              <option value="ACTIVE">Active</option>
              <option value="SOLD">Sold</option>
              <option value="DEAD">Dead</option>
              <option value="TRANSFERRED">Transferred</option>
            </select>
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
            <select
              value={form.farmerId}
              onChange={(event) => setForm({ ...form, farmerId: event.target.value })}
              className="rounded-lg border border-stone-300 px-3 py-2"
            >
              <option value="">Select farmer</option>
              {farmers.map((farmer) => (
                <option key={farmer.id} value={farmer.id}>
                  {farmer.fullName}
                </option>
              ))}
            </select>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <input
              value={form.notes}
              onChange={(event) => setForm({ ...form, notes: event.target.value })}
              placeholder="Notes"
              className="rounded-lg border border-stone-300 px-3 py-2"
            />
            <button className="rounded-lg bg-stone-900 px-4 py-2 text-sm font-semibold text-white">
              Create doe
            </button>
          </div>
        </form>

        <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search does"
            className="mb-4 rounded-lg border border-stone-300 px-3 py-2"
          />
          {loading ? (
            <p className="text-sm text-stone-500">Loading...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-stone-200 text-left text-stone-600">
                    <th className="px-3 py-2">Tag</th>
                    <th className="px-3 py-2">Name</th>
                    <th className="px-3 py-2">Cluster</th>
                    <th className="px-3 py-2">Farmer</th>
                    <th className="px-3 py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {does.map((doe) => (
                    <tr key={doe.id} className="border-b border-stone-100">
                      <td className="px-3 py-2">{doe.tagNumber}</td>
                      <td className="px-3 py-2">{doe.name ?? '—'}</td>
                      <td className="px-3 py-2">{doe.cluster?.name ?? '—'}</td>
                      <td className="px-3 py-2">{doe.farmer?.fullName ?? '—'}</td>
                      <td className="px-3 py-2">{doe.status}</td>
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
