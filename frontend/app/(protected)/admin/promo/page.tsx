"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Tag,
  ChevronLeft,
  ChevronRight,
  Percent,
  CheckCircle,
  XCircle,
  Clock,
  ArrowUpRight,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { getPromos, deletePromo, Promo } from "@/lib/api";

const ITEMS_PER_PAGE = 10;

export default function KelolaPromoPage() {
  const [promos, setPromos] = useState<Promo[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadPromos();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterStatus]);

  async function loadPromos() {
    setLoading(true);
    const result = await getPromos();
    if (result.data) setPromos(result.data);
    setLoading(false);
  }

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    const result = await deletePromo(deleteId);
    if (!result.error) {
      toast.success("Promo berhasil dihapus");
      loadPromos();
      setDeleteId(null);
    } else {
      toast.error(result.error);
    }
    setDeleting(false);
  }

  function formatPrice(price: number) {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(price);
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
  }

  function getPromoStatus(promo: Promo) {
    const now = new Date();
    if (!promo.isActive) return { label: "Nonaktif", color: "bg-red-50 text-red-700" };
    if (now < new Date(promo.startDate)) return { label: "Belum Mulai", color: "bg-zinc-100 text-zinc-700" };
    if (now > new Date(promo.endDate)) return { label: "Berakhir", color: "bg-red-50 text-red-700" };
    if (promo.usageLimit && promo.usedCount >= promo.usageLimit) return { label: "Habis", color: "bg-amber-50 text-amber-700" };
    return { label: "Aktif", color: "bg-green-50 text-green-700" };
  }

  // Stats
  const activePromos = promos.filter((p) => getPromoStatus(p).label === "Aktif").length;
  const expiredPromos = promos.filter((p) => getPromoStatus(p).label === "Berakhir").length;
  const totalUsed = promos.reduce((sum, p) => sum + p.usedCount, 0);

  const filteredPromos = promos.filter((p) => {
    const matchSearch = p.code.toLowerCase().includes(search.toLowerCase()) || (p.description || "").toLowerCase().includes(search.toLowerCase());
    const status = getPromoStatus(p);
    const matchStatus = !filterStatus || status.label === filterStatus;
    return matchSearch && matchStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filteredPromos.length / ITEMS_PER_PAGE));
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedPromos = filteredPromos.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-900">
            <Tag className="h-4 w-4 text-white" />
          </div>
          <div>
            <h1 className="text-base font-semibold">Kelola Promo</h1>
            <p className="text-sm text-zinc-500 hidden sm:block">Buat dan kelola kode promo</p>
          </div>
        </div>
        <Button className="h-9 w-full sm:w-auto gap-2 bg-zinc-900 text-sm font-medium" onClick={() => window.location.href = "/admin/promo/tambah"}>
          <Plus className="h-4 w-4" /> Tambah Promo
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Promo", value: promos.length.toString(), change: `${activePromos} aktif`, trend: "neutral" as const, icon: Tag, iconColor: "text-zinc-600", iconBg: "bg-zinc-100" },
          { label: "Promo Aktif", value: activePromos.toString(), change: `${promos.length > 0 ? Math.round((activePromos / promos.length) * 100) : 0}% dari total`, trend: "up" as const, icon: CheckCircle, iconColor: "text-green-600", iconBg: "bg-green-50" },
          { label: "Total Digunakan", value: totalUsed.toString(), change: "Kali dipakai", trend: "neutral" as const, icon: Percent, iconColor: "text-blue-600", iconBg: "bg-blue-50" },
          { label: "Promo Berakhir", value: expiredPromos.toString(), change: "Sudah expired", trend: "neutral" as const, icon: Clock, iconColor: "text-amber-600", iconBg: "bg-amber-50" },
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

      {/* Search & Filter */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Cari kode promo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 w-full rounded-lg border border-zinc-200 bg-white pl-9 pr-3 text-sm placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="h-9 rounded-lg border border-zinc-200 bg-white px-3 text-sm focus:border-zinc-900 focus:outline-none"
        >
          <option value="">Semua Status</option>
          <option value="Aktif">Aktif</option>
          <option value="Nonaktif">Nonaktif</option>
          <option value="Berakhir">Berakhir</option>
          <option value="Habis">Habis</option>
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
        </div>
      ) : (
        <div className="rounded-lg border border-zinc-200 bg-white">
          {paginatedPromos.length === 0 ? (
            <div className="px-4 py-12 text-center">
              <Tag className="mx-auto h-10 w-10 text-zinc-300" />
              <p className="mt-3 text-sm font-medium text-zinc-900">
                {search || filterStatus ? "Promo tidak ditemukan" : "Belum Ada Promo"}
              </p>
              <p className="mt-1 text-sm text-zinc-500">
                {search || filterStatus ? "Coba ubah filter pencarian" : "Buat kode promo pertama"}
              </p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-zinc-100 bg-zinc-50/80">
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Kode</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Diskon</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Min. Pembelian</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Penggunaan</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Periode</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Status</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-zinc-500">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {paginatedPromos.map((promo) => {
                      const status = getPromoStatus(promo);
                      return (
                        <tr key={promo.id} className="hover:bg-zinc-50/50">
                          <td className="px-4 py-3">
                            <div>
                              <p className="text-sm font-mono font-bold text-zinc-900">{promo.code}</p>
                              {promo.description && <p className="text-xs text-zinc-500 truncate max-w-[200px]">{promo.description}</p>}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-sm font-medium text-zinc-900">
                              {promo.discountType === "PERCENTAGE" ? `${promo.discountValue}%` : formatPrice(promo.discountValue)}
                            </span>
                            {promo.maxDiscount && promo.discountType === "PERCENTAGE" && (
                              <p className="text-xs text-zinc-500">Maks. {formatPrice(promo.maxDiscount)}</p>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm text-zinc-600">
                            {promo.minPurchase > 0 ? formatPrice(promo.minPurchase) : "—"}
                          </td>
                          <td className="px-4 py-3 text-sm text-zinc-600">
                            {promo.usedCount}{promo.usageLimit ? ` / ${promo.usageLimit}` : " / ∞"}
                          </td>
                          <td className="px-4 py-3">
                            <p className="text-sm text-zinc-600">{formatDate(promo.startDate)}</p>
                            <p className="text-xs text-zinc-400">s/d {formatDate(promo.endDate)}</p>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${status.color}`}>{status.label}</span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex justify-end gap-1">
                              <button onClick={() => window.location.href = `/admin/promo/${promo.id}/edit`} className="rounded-md p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600" title="Edit">
                                <Pencil className="h-4 w-4" />
                              </button>
                              <button onClick={() => setDeleteId(promo.id)} className="rounded-md p-1.5 text-zinc-400 hover:bg-red-50 hover:text-red-600" title="Hapus">
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="sm:hidden divide-y divide-zinc-100">
                {paginatedPromos.map((promo) => {
                  const status = getPromoStatus(promo);
                  return (
                    <div key={promo.id} className="p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-mono font-bold text-zinc-900">{promo.code}</p>
                          {promo.description && <p className="text-xs text-zinc-500 truncate max-w-[200px]">{promo.description}</p>}
                        </div>
                        <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${status.color}`}>{status.label}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-zinc-500">
                          {promo.discountType === "PERCENTAGE" ? `${promo.discountValue}%` : formatPrice(promo.discountValue)}
                          {promo.minPurchase > 0 && ` • Min. ${formatPrice(promo.minPurchase)}`}
                        </span>
                        <span className="text-zinc-500">{promo.usedCount}{promo.usageLimit ? `/${promo.usageLimit}` : "/∞"} dipakai</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-zinc-400">{formatDate(promo.startDate)} - {formatDate(promo.endDate)}</span>
                        <div className="flex items-center gap-1">
                          <button onClick={() => window.location.href = `/admin/promo/${promo.id}/edit`} className="rounded-md p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600">
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button onClick={() => setDeleteId(promo.id)} className="rounded-md p-1.5 text-zinc-400 hover:bg-red-50 hover:text-red-600">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* Pagination */}
          <div className="flex flex-col gap-2 border-t border-zinc-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-zinc-500">
              {filteredPromos.length === 0
                ? "0 promo"
                : `${startIndex + 1}-${Math.min(startIndex + ITEMS_PER_PAGE, filteredPromos.length)} dari ${filteredPromos.length} promo`}
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
            <h2 className="mt-4 text-base font-semibold">Hapus Promo?</h2>
            <p className="mt-2 text-sm text-zinc-500">Promo yang dihapus tidak dapat dikembalikan.</p>
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
