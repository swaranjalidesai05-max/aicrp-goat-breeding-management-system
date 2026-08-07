import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { requestJson } from '../lib/api';

type Cluster = {
  id: string;
  code: string;
  name: string;
  district?: string | null;
  state?: string | null;
  description?: string | null;
  isActive: boolean;
};

type ClusterForm = {
  code: string;
  name: string;
  district: string;
  state: string;
  description: string;
};

export default function ClustersPage() {
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [form, setForm] = useState<ClusterForm>({
    code: '',
    name: '',
    district: '',
    state: '',
    description: '',
  });
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [editingCluster, setEditingCluster] = useState<Cluster | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadClusters = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await requestJson(`/clusters?search=${encodeURIComponent(search)}`);
      setClusters(result.data ?? []);
    } catch (err) {
      setError('Unable to load clusters.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadClusters();
  }, [search]);

  const resetForm = () => {
    setEditingCluster(null);
    setForm({ code: '', name: '', district: '', state: '', description: '' });
    setError(null);
  };

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    try {
      const payload = {
        code: form.code.trim(),
        name: form.name.trim(),
        district: form.district.trim() || null,
        state: form.state.trim() || null,
        description: form.description.trim() || null,
      };

      const endpoint = editingCluster ? `/clusters/${editingCluster.id}` : '/clusters';
      const method = editingCluster ? 'PATCH' : 'POST';

      await requestJson(endpoint, {
        method,
        body: JSON.stringify(payload),
      });

      resetForm();
      void loadClusters();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save cluster');
    }
  };

  const handleEdit = (cluster: Cluster) => {
    setEditingCluster(cluster);
    setForm({
      code: cluster.code,
      name: cluster.name,
      district: cluster.district ?? '',
      state: cluster.state ?? '',
      description: cluster.description ?? '',
    });
    setError(null);
  };

  const handleToggleActive = async (cluster: Cluster) => {
    setError(null);

    try {
      await requestJson(`/clusters/${cluster.id}/active`, {
        method: 'PATCH',
        body: JSON.stringify({ isActive: !cluster.isActive }),
      });

      void loadClusters();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update cluster status');
    }
  };

  return (
    <main className="min-h-screen bg-stone-50 p-6">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-stone-500">
              Management
            </p>
            <h1 className="text-3xl font-semibold text-stone-900">Clusters</h1>
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
              value={form.code}
              onChange={(event) => setForm({ ...form, code: event.target.value })}
              placeholder="Cluster code"
              className="rounded-lg border border-stone-300 px-3 py-2"
              required
            />
            <input
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
              placeholder="Cluster name"
              className="rounded-lg border border-stone-300 px-3 py-2"
              required
            />
            <input
              value={form.district}
              onChange={(event) => setForm({ ...form, district: event.target.value })}
              placeholder="District"
              className="rounded-lg border border-stone-300 px-3 py-2"
            />
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <input
              value={form.state}
              onChange={(event) => setForm({ ...form, state: event.target.value })}
              placeholder="State"
              className="rounded-lg border border-stone-300 px-3 py-2"
            />
            <button className="rounded-lg bg-stone-900 px-4 py-2 text-sm font-semibold text-white">
              {editingCluster ? 'Update cluster' : 'Create cluster'}
            </button>
          </div>

          <textarea
            value={form.description}
            onChange={(event) => setForm({ ...form, description: event.target.value })}
            placeholder="Optional notes or operational details"
            className="mt-4 h-24 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
          />

          {editingCluster ? (
            <button
              type="button"
              onClick={resetForm}
              className="mt-3 text-sm text-stone-500 underline"
            >
              Cancel edit
            </button>
          ) : null}

          {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}
        </form>

        <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-stone-400">Clusters</p>
              <p className="mt-1 text-2xl font-semibold text-stone-900">{clusters.length}</p>
            </div>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search clusters by code, name, or location"
              className="rounded-lg border border-stone-300 px-3 py-2"
            />
          </div>

          {loading ? (
            <p className="text-sm text-stone-500">Loading clusters...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-stone-200 text-left text-stone-600">
                    <th className="px-3 py-2">Code</th>
                    <th className="px-3 py-2">Name</th>
                    <th className="px-3 py-2">Location</th>
                    <th className="px-3 py-2">Status</th>
                    <th className="px-3 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {clusters.map((cluster) => (
                    <tr key={cluster.id} className="border-b border-stone-100">
                      <td className="px-3 py-2">{cluster.code}</td>
                      <td className="px-3 py-2">{cluster.name}</td>
                      <td className="px-3 py-2 text-stone-500">
                        {cluster.district || '—'}{cluster.state ? `, ${cluster.state}` : ''}
                      </td>
                      <td className="px-3 py-2">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs uppercase tracking-[0.2em] ${
                            cluster.isActive
                              ? 'bg-emerald-500/15 text-emerald-700'
                              : 'bg-stone-200 text-stone-600'
                          }`}
                        >
                          {cluster.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-3 py-2 space-x-2">
                        <button
                          type="button"
                          onClick={() => handleEdit(cluster)}
                          className="rounded-lg border border-stone-300 px-3 py-1 text-sm text-stone-700"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleToggleActive(cluster)}
                          className="rounded-lg border border-stone-300 px-3 py-1 text-sm text-stone-700"
                        >
                          {cluster.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
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
