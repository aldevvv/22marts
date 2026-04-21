"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Loader2,
  Users,
  Trash2,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  ShieldCheck,
  UserPlus,
  ArrowUpRight,
  Calendar,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { getUsers, updateUserRole, deleteUser, User } from "@/lib/api";

const ITEMS_PER_PAGE = 10;
const PIE_COLORS = ["#18181b", "#3b82f6"];

export default function KelolaUserPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [mounted, setMounted] = useState(false);

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    setMounted(true);
    loadUsers();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterRole]);

  async function loadUsers() {
    setLoading(true);
    const result = await getUsers();
    if (result.data) setUsers(result.data);
    else toast.error(result.error);
    setLoading(false);
  }

  async function handleRoleChange(userId: string, newRole: 'USER' | 'ADMIN') {
    const result = await updateUserRole(userId, newRole);
    if (result.data) {
      toast.success("Role berhasil diupdate");
      setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, role: newRole } : u));
    } else {
      toast.error(result.error);
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    const result = await deleteUser(deleteId);
    if (!result.error) {
      toast.success("User berhasil dihapus");
      loadUsers();
      setDeleteId(null);
    } else {
      toast.error(result.error);
    }
    setDeleting(false);
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
    });
  }

  // Stats
  const userCount = users.filter((u) => u.role === "USER").length;
  const adminCount = users.filter((u) => u.role === "ADMIN").length;

  // Chart: registrations per day (last 7 days)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d;
  });

  const registrationsByDay = last7Days.map((date) => ({
    day: date.toLocaleDateString("id-ID", { day: "numeric", month: "short" }),
    pengguna: users.filter((u) => new Date(u.createdAt).toDateString() === date.toDateString()).length,
  }));

  // Pie
  const pieData = [
    { name: "User", value: userCount },
    { name: "Admin", value: adminCount },
  ].filter((d) => d.value > 0);

  // Filter
  const filteredUsers = users.filter((user) => {
    const matchSearch = user.name.toLowerCase().includes(search.toLowerCase()) || user.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = !filterRole || user.role === filterRole;
    return matchSearch && matchRole;
  });

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / ITEMS_PER_PAGE));
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-900">
            <Users className="h-4 w-4 text-white" />
          </div>
          <div>
            <h1 className="text-base font-semibold">Kelola Pengguna</h1>
            <p className="text-sm text-zinc-500 hidden sm:block">Kelola pengguna dan hak akses</p>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Pengguna", value: users.length.toString(), change: "+12%", trend: "up" as const, icon: Users, iconColor: "text-zinc-600", iconBg: "bg-zinc-100" },
          { label: "Pengguna Aktif", value: userCount.toString(), change: `${users.length > 0 ? Math.round((userCount / users.length) * 100) : 0}% dari total`, trend: "neutral" as const, icon: UserCheck, iconColor: "text-green-600", iconBg: "bg-green-50" },
          { label: "Admin", value: adminCount.toString(), change: `${adminCount} orang`, trend: "neutral" as const, icon: ShieldCheck, iconColor: "text-blue-600", iconBg: "bg-blue-50" },
          { label: "Baru Bergabung", value: users.filter((u) => { const d = new Date(u.createdAt); const now = new Date(); return (now.getTime() - d.getTime()) < 7 * 24 * 60 * 60 * 1000; }).length.toString(), change: "7 hari terakhir", trend: "up" as const, icon: UserPlus, iconColor: "text-amber-600", iconBg: "bg-amber-50" },
        ].map((stat) => (
          <div key={stat.label} className="flex items-center gap-3 rounded-lg border border-zinc-200 bg-white p-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${stat.iconBg}`}>
              <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
            </div>
            <div className="flex-1">
              <p className="text-xs text-zinc-500">{stat.label}</p>
              <div className="flex items-baseline gap-2">
                <p className="text-lg font-semibold">{stat.value}</p>
                <span className={`flex items-center text-xs font-medium ${stat.trend === "up" ? "text-green-600" : "text-zinc-400"}`}>
                  {stat.trend === "up" && <ArrowUpRight className="h-3 w-3" />}
                  {stat.change}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-3 lg:grid-cols-3">
        <div className="rounded-lg border border-zinc-200 bg-white p-3 sm:p-4 lg:col-span-2">
          <div className="mb-3">
            <h2 className="text-sm font-semibold">Registrasi Pengguna</h2>
            <p className="text-xs text-zinc-500">7 hari terakhir</p>
          </div>
          <div className="h-52">
            {mounted && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={registrationsByDay}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#71717a" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#71717a" }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e4e4e7" }} />
                  <Bar dataKey="pengguna" fill="#18181b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="rounded-lg border border-zinc-200 bg-white p-3 sm:p-4">
          <div className="mb-3">
            <h2 className="text-sm font-semibold">Distribusi Role</h2>
            <p className="text-xs text-zinc-500">User vs Admin</p>
          </div>
          <div className="h-36">
            {mounted && pieData.length > 0 && (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={35} outerRadius={55} dataKey="value" paddingAngle={2}>
                    {pieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e4e4e7" }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="mt-2 space-y-1.5">
            {[
              { name: "User", value: userCount, color: "#18181b" },
              { name: "Admin", value: adminCount, color: "#3b82f6" },
            ].map((item) => (
              <div key={item.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-zinc-600">{item.name}</span>
                </div>
                <span className="font-medium text-zinc-900">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Cari pengguna..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 w-full rounded-lg border border-zinc-200 bg-white pl-9 pr-3 text-sm placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
          />
        </div>
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="h-9 rounded-lg border border-zinc-200 bg-white px-3 text-sm focus:border-zinc-900 focus:outline-none"
        >
          <option value="">Semua Role</option>
          <option value="USER">User</option>
          <option value="ADMIN">Admin</option>
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
        </div>
      ) : (
        <div className="rounded-lg border border-zinc-200 bg-white">
          {paginatedUsers.length === 0 ? (
            <div className="px-4 py-12 text-center">
              <Users className="mx-auto h-10 w-10 text-zinc-300" />
              <p className="mt-3 text-sm font-medium text-zinc-900">
                {search || filterRole ? "Pengguna tidak ditemukan" : "Belum Ada Pengguna"}
              </p>
              <p className="mt-1 text-sm text-zinc-500">
                {search || filterRole ? "Coba ubah filter pencarian" : "Pengguna yang terdaftar akan muncul di sini"}
              </p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-zinc-100 bg-zinc-50/80">
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Pengguna</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Role</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Bergabung</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-zinc-500">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {paginatedUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-zinc-50/50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-900 text-sm font-medium text-white">
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-zinc-900">{user.name}</p>
                              <p className="text-sm text-zinc-500">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <select
                            value={user.role}
                            onChange={(e) => handleRoleChange(user.id, e.target.value as 'USER' | 'ADMIN')}
                            className="h-8 rounded-lg border border-zinc-200 bg-white px-2 text-xs font-medium text-zinc-700 focus:outline-none focus:border-zinc-900"
                          >
                            <option value="USER">User</option>
                            <option value="ADMIN">Admin</option>
                          </select>
                        </td>
                        <td className="px-4 py-3 text-sm text-zinc-500">{formatDate(user.createdAt)}</td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end">
                            <button onClick={() => setDeleteId(user.id)} className="rounded-md p-1.5 text-zinc-400 hover:bg-red-50 hover:text-red-600" title="Hapus">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="sm:hidden divide-y divide-zinc-100">
                {paginatedUsers.map((user) => (
                  <div key={user.id} className="p-4 space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-sm font-medium text-white">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-zinc-900 truncate">{user.name}</p>
                        <p className="text-xs text-zinc-500 truncate">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <select
                          value={user.role}
                          onChange={(e) => handleRoleChange(user.id, e.target.value as 'USER' | 'ADMIN')}
                          className="h-7 rounded border border-zinc-200 bg-white px-1.5 text-xs font-medium focus:outline-none"
                        >
                          <option value="USER">User</option>
                          <option value="ADMIN">Admin</option>
                        </select>
                        <span className="text-xs text-zinc-400">{formatDate(user.createdAt)}</span>
                      </div>
                      <button onClick={() => setDeleteId(user.id)} className="rounded-md p-1.5 text-zinc-400 hover:bg-red-50 hover:text-red-600">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Pagination */}
          <div className="flex flex-col gap-2 border-t border-zinc-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-zinc-500">
              {filteredUsers.length === 0
                ? "0 pengguna"
                : `${startIndex + 1}-${Math.min(startIndex + ITEMS_PER_PAGE, filteredUsers.length)} dari ${filteredUsers.length} pengguna`}
            </p>
            <div className="flex items-center gap-1">
              <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 text-zinc-600 hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed">
                <ChevronLeft className="h-4 w-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button key={page} onClick={() => setCurrentPage(page)} className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-medium ${currentPage === page ? "bg-zinc-900 text-white" : "border border-zinc-200 text-zinc-600 hover:bg-zinc-50"}`}>
                  {page}
                </button>
              ))}
              <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 text-zinc-600 hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <Trash2 className="h-6 w-6 text-red-600" />
            </div>
            <h2 className="mt-4 text-base font-semibold">Hapus Pengguna?</h2>
            <p className="mt-2 text-sm text-zinc-500">Pengguna yang dihapus tidak dapat dikembalikan. Semua data terkait pengguna ini akan hilang.</p>
            <div className="mt-5 flex gap-3">
              <Button variant="outline" className="flex-1 h-10 text-sm" onClick={() => setDeleteId(null)}>Batal</Button>
              <Button className="flex-1 h-10 bg-red-600 hover:bg-red-700 text-sm" onClick={handleDelete} disabled={deleting}>
                {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Hapus"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
