"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Tag,
  Package,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  CheckCircle,
  XCircle,
  ArrowUpRight,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { getCategories, getProducts, deleteCategory, Category, Product } from "@/lib/api";

const ITEMS_PER_PAGE = 10;

export default function KelolaKategoriPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterStatus]);

  async function loadData() {
    setLoading(true);
    const [catRes, prodRes] = await Promise.all([getCategories(), getProducts()]);
    if (catRes.data) setCategories(catRes.data);
    if (prodRes.data) setProducts(prodRes.data);
    setLoading(false);
  }

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    const result = await deleteCategory(deleteId);
    if (!result.error) {
      toast.success("Kategori berhasil dihapus");
      loadData();
      setDeleteId(null);
    } else {
      toast.error(result.error);
    }
    setDeleting(false);
  }

  const filteredCategories = categories.filter((cat) => {
    const matchSearch = cat.name.toLowerCase().includes(search.toLowerCase());
    const matchStatus =
      !filterStatus ||
      (filterStatus === "active" && cat.isActive) ||
      (filterStatus === "inactive" && !cat.isActive);
    return matchSearch && matchStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filteredCategories.length / ITEMS_PER_PAGE));
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedCategories = filteredCategories.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const activeCount = categories.filter((c) => c.isActive).length;
  const totalProducts = products.length;
  const emptyCategories = categories.filter((c) => {
    return !products.some((p) => p.categoryId === c.id);
  }).length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-900">
            <Tag className="h-4 w-4 text-white" />
          </div>
          <div>
            <h1 className="text-base font-semibold">Kelola Kategori</h1>
            <p className="text-sm text-zinc-500 hidden sm:block">Tambah, edit, dan hapus kategori produk</p>
          </div>
        </div>
        <Button className="h-9 w-full sm:w-auto gap-2 bg-zinc-900 text-sm font-medium" onClick={() => window.location.href = "/admin/kategori/tambah"}>
          <Plus className="h-4 w-4" /> Tambah Kategori
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Kategori", value: categories.length.toString(), change: `${activeCount} aktif`, trend: "neutral" as const, icon: LayoutGrid, iconColor: "text-zinc-600", iconBg: "bg-zinc-100" },
          { label: "Kategori Aktif", value: activeCount.toString(), change: `${categories.length - activeCount} nonaktif`, trend: "up" as const, icon: CheckCircle, iconColor: "text-green-600", iconBg: "bg-green-50" },
          { label: "Total Produk", value: totalProducts.toString(), change: `Di ${categories.length} kategori`, trend: "neutral" as const, icon: Package, iconColor: "text-blue-600", iconBg: "bg-blue-50" },
          { label: "Kategori Kosong", value: emptyCategories.toString(), change: "Tanpa produk", trend: "neutral" as const, icon: XCircle, iconColor: "text-amber-600", iconBg: "bg-amber-50" },
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
            placeholder="Cari kategori..."
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
          <option value="active">Aktif</option>
          <option value="inactive">Nonaktif</option>
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
        </div>
      ) : (
        <div className="rounded-lg border border-zinc-200 bg-white">
          {paginatedCategories.length === 0 ? (
            <div className="px-4 py-12 text-center">
              <Tag className="mx-auto h-10 w-10 text-zinc-300" />
              <p className="mt-3 text-sm font-medium text-zinc-900">
                {search || filterStatus ? "Kategori tidak ditemukan" : "Belum Ada Kategori"}
              </p>
              <p className="mt-1 text-sm text-zinc-500">
                {search || filterStatus ? "Coba ubah filter pencarian" : "Buat kategori pertama"}
              </p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-zinc-100 bg-zinc-50/80">
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Kategori</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Slug</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Produk</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Status</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-zinc-500">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {paginatedCategories.map((category) => (
                      <tr key={category.id} className="hover:bg-zinc-50/50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            {category.icon ? (
                              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-100 text-xl">
                                {category.icon}
                              </div>
                            ) : (
                              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-100">
                                <Tag className="h-5 w-5 text-zinc-400" />
                              </div>
                            )}
                            <span className="text-sm font-medium text-zinc-900">{category.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-zinc-500">/{category.slug}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5 text-sm text-zinc-600">
                            <Package className="h-4 w-4" />
                            {category._count?.products || 0}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                            category.isActive ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                          }`}>
                            {category.isActive ? "Aktif" : "Nonaktif"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-1">
                            <button onClick={() => window.location.href = `/admin/kategori/${category.id}/edit`} className="rounded-md p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600" title="Edit">
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button onClick={() => setDeleteId(category.id)} className="rounded-md p-1.5 text-zinc-400 hover:bg-red-50 hover:text-red-600" title="Hapus">
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
                {paginatedCategories.map((category) => (
                  <div key={category.id} className="p-4 space-y-2">
                    <div className="flex items-center gap-3">
                      {category.icon ? (
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-xl">
                          {category.icon}
                        </div>
                      ) : (
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zinc-100">
                          <Tag className="h-5 w-5 text-zinc-400" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-zinc-900">{category.name}</p>
                        <p className="text-xs text-zinc-500">/{category.slug}</p>
                      </div>
                      <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${category.isActive ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                        {category.isActive ? "Aktif" : "Nonaktif"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-sm text-zinc-500">
                        <Package className="h-4 w-4" />
                        {category._count?.products || 0} produk
                      </div>
                      <div className="flex items-center gap-1">
                        <button onClick={() => window.location.href = `/admin/kategori/${category.id}/edit`} className="rounded-md p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600">
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button onClick={() => setDeleteId(category.id)} className="rounded-md p-1.5 text-zinc-400 hover:bg-red-50 hover:text-red-600">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Pagination */}
          <div className="flex flex-col gap-2 border-t border-zinc-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-zinc-500">
              {filteredCategories.length === 0
                ? "0 kategori"
                : `${startIndex + 1}-${Math.min(startIndex + ITEMS_PER_PAGE, filteredCategories.length)} dari ${filteredCategories.length} kategori`}
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
            <h2 className="mt-4 text-base font-semibold">Hapus Kategori?</h2>
            <p className="mt-2 text-sm text-zinc-500">Kategori yang dihapus tidak dapat dikembalikan. Pastikan tidak ada produk yang menggunakan kategori ini.</p>
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
