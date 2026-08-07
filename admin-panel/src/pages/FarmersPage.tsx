import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { requestJson } from '../lib/api';

type Farmer = {
  id: string;
  code: string;
  fullName: string;
  phone?: string | null;
  address?: string | null;
  aadhaar?: string | null;
  gpsLatitude?: number | null;
  gpsLongitude?: number | null;
  isActive: boolean;
  village?: { name: string };
};

type Village = { id: string; name: string };

export default function FarmersPage() {
  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [villages, setVillages] = useState<Village[]>([]);
  const [form, setForm] = useState({
    villageId: '',
    fullName: '',
    phone: '',
    address: '',
    aadhaar: '',
    gpsLatitude: '',
    gpsLongitude: '',
  });
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    const [farmersJson, villagesJson] = await Promise.all([
      requestJson(`/farmers?search=${encodeURIComponent(search)}`),
      requestJson('/villages'),
    ]);
    setFarmers(farmersJson.data ?? []);
    setVillages(villagesJson.data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    void load();
  }, [search]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    await requestJson('/farmers', {
      method: 'POST',
      body: JSON.stringify({
        ...form,
        gpsLatitude: form.gpsLatitude ? Number(form.gpsLatitude) : null,
        gpsLongitude: form.gpsLongitude ? Number(form.gpsLongitude) : null,
      }),
    });
    setForm({
      villageId: '',
      fullName: '',
      phone: '',
      address: '',
      aadhaar: '',
      gpsLatitude: '',
      gpsLongitude: '',
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
            <h1 className="text-3xl font-semibold text-stone-900">Farmers</h1>
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
              value={form.fullName}
              onChange={(event) => setForm({ ...form, fullName: event.target.value })}
              placeholder="Full name"
              className="rounded-lg border border-stone-300 px-3 py-2"
              required
            />
            <input
              value={form.phone}
              onChange={(event) => setForm({ ...form, phone: event.target.value })}
              placeholder="Mobile number"
              className="rounded-lg border border-stone-300 px-3 py-2"
            />
            <select
              value={form.villageId}
              onChange={(event) => setForm({ ...form, villageId: event.target.value })}
              className="rounded-lg border border-stone-300 px-3 py-2"
              required
            >
              <option value="">Select village</option>
              {villages.map((village) => (
                <option key={village.id} value={village.id}>
                  {village.name}
                </option>
              ))}
            </select>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <input
              value={form.address}
              onChange={(event) => setForm({ ...form, address: event.target.value })}
              placeholder="Address"
              className="rounded-lg border border-stone-300 px-3 py-2"
            />
            <input
              value={form.aadhaar}
              onChange={(event) => setForm({ ...form, aadhaar: event.target.value })}
              placeholder="Aadhaar"
              className="rounded-lg border border-stone-300 px-3 py-2"
            />
            <input
              value={form.gpsLatitude}
              onChange={(event) => setForm({ ...form, gpsLatitude: event.target.value })}
              placeholder="Latitude"
              className="rounded-lg border border-stone-300 px-3 py-2"
            />
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <input
              value={form.gpsLongitude}
              onChange={(event) => setForm({ ...form, gpsLongitude: event.target.value })}
              placeholder="Longitude"
              className="rounded-lg border border-stone-300 px-3 py-2"
            />
            <button className="rounded-lg bg-stone-900 px-4 py-2 text-sm font-semibold text-white">
              Create farmer
            </button>
          </div>
        </form>

        <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search farmers"
            className="mb-4 rounded-lg border border-stone-300 px-3 py-2"
          />
          {loading ? (
            <p className="text-sm text-stone-500">Loading...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-stone-200 text-left text-stone-600">
                    <th className="px-3 py-2">Code</th>
                    <th className="px-3 py-2">Name</th>
                    <th className="px-3 py-2">Village</th>
                    <th className="px-3 py-2">Phone</th>
                    <th className="px-3 py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {farmers.map((farmer) => (
                    <tr key={farmer.id} className="border-b border-stone-100">
                      <td className="px-3 py-2">{farmer.code}</td>
                      <td className="px-3 py-2">{farmer.fullName}</td>
                      <td className="px-3 py-2">{farmer.village?.name ?? '—'}</td>
                      <td className="px-3 py-2">{farmer.phone ?? '—'}</td>
                      <td className="px-3 py-2">{farmer.isActive ? 'Active' : 'Inactive'}</td>
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
