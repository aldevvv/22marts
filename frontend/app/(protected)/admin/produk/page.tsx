"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  ImageIcon,
  Package,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  Tag,
  AlertTriangle,
  ArrowUpRight,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  getProducts,
  getCategories,
  deleteProduct,
  Product,
  Category,
} from "@/lib/api";

const ITEMS_PER_PAGE = 10;

export default function KelolaProdukPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterCategory, filterStatus]);

  async function loadData() {
    setLoading(true);
    const [productsRes, categoriesRes] = await Promise.all([
      getProducts(),
      getCategories(),
    ]);
    if (productsRes.data) setProducts(productsRes.data);
    if (categoriesRes.data) setCategories(categoriesRes.data);
    setLoading(false);
  }

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);

    const result = await deleteProduct(deleteId);
    if (!result.error) {
      toast.success("Produk berhasil dihapus");
      loadData();
      setDeleteId(null);
    } else {
      toast.error(result.error);
    }

    setDeleting(false);
  }

  function formatPrice(price: number) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  }

  const filteredProducts = products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchCategory = !filterCategory || p.categoryId === filterCategory;
    const matchStatus =
      !filterStatus ||
      (filterStatus === "active" && p.isActive) ||
      (filterStatus === "inactive" && !p.isActive) ||
      (filterStatus === "outofstock" && p.stock === 0);
    return matchSearch && matchCategory && matchStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / ITEMS_PER_PAGE));
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-900">
            <Package className="h-4 w-4 text-white" />
          </div>
          <div>
            <h1 className="text-base font-semibold">Kelola Produk</h1>
            <p className="text-sm text-zinc-500 hidden sm:block">Tambah, edit, dan hapus produk toko</p>
          </div>
        </div>
        <Button className="h-9 w-full sm:w-auto gap-2 bg-zinc-900 text-sm font-medium" onClick={() => window.location.href = "/admin/produk/tambah"}>
          <Plus className="h-4 w-4" /> Tambah Produk
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: "Total Produk",
            value: products.length.toString(),
            change: `${products.filter((p) => p.isActive).length} aktif`,
            trend: "neutral" as const,
            icon: Package,
            iconColor: "text-zinc-600",
            iconBg: "bg-zinc-100",
          },
          {
            label: "Total Kategori",
            value: categories.length.toString(),
            change: `${new Set(products.map((p) => p.categoryId)).size} digunakan`,
            trend: "neutral" as const,
            icon: Tag,
            iconColor: "text-blue-600",
            iconBg: "bg-blue-50",
          },
          {
            label: "Rata-rata Harga",
            value: products.length > 0
              ? new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(
                  Math.round(products.reduce((sum, p) => sum + p.price, 0) / products.length)
                )
              : "Rp 0",
            change: `${products.filter((p) => p.price > 100000).length} > Rp 100K`,
            trend: "up" as const,
            icon: DollarSign,
            iconColor: "text-green-600",
            iconBg: "bg-green-50",
          },
          {
            label: "Stok Habis",
            value: products.filter((p) => p.stock === 0).length.toString(),
            change: `${products.filter((p) => p.stock > 0 && p.stock <= 10).length} stok rendah`,
            trend: "neutral" as const,
            icon: AlertTriangle,
            iconColor: "text-amber-600",
            iconBg: "bg-amber-50",
          },
        ].map((stat) => (
          <div key={stat.label} className="flex items-center gap-3 rounded-lg border border-zinc-200 bg-white p-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${stat.iconBg}`}>
              <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
            </div>
            <div className="flex-1">
              <p className="text-xs text-zinc-500">{stat.label}</p>
              <div className="flex items-baseline gap-2">
                <p className="text-lg font-semibold">{stat.value}</p>
                <span className={`flex items-center text-xs font-medium ${
                  stat.trend === "up" ? "text-green-600" : "text-zinc-400"
                }`}>
                  {stat.trend === "up" && <ArrowUpRight className="h-3 w-3" />}
                  {stat.change}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Cari produk..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 w-full rounded-lg border border-zinc-200 bg-white pl-9 pr-3 text-sm placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
          />
        </div>
        <div className="flex items-center gap-2">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="h-9 flex-1 sm:flex-none rounded-lg border border-zinc-200 bg-white px-3 text-sm focus:border-zinc-900 focus:outline-none"
          >
            <option value="">Kategori</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="h-9 flex-1 sm:flex-none rounded-lg border border-zinc-200 bg-white px-3 text-sm focus:border-zinc-900 focus:outline-none"
          >
          <option value="">Status</option>
          <option value="active">Aktif</option>
          <option value="inactive">Nonaktif</option>
          <option value="outofstock">Habis</option>
        </select>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
        </div>
      ) : (
        <div className="rounded-lg border border-zinc-200 bg-white">
          {paginatedProducts.length === 0 ? (
            <div className="px-4 py-12 text-center">
              <Package className="mx-auto h-10 w-10 text-zinc-300" />
              <p className="mt-3 text-sm font-medium text-zinc-900">Tidak ada produk</p>
              <p className="mt-1 text-sm text-zinc-500">
                {search || filterCategory || filterStatus ? "Coba ubah filter pencarian" : "Tambahkan produk pertama"}
              </p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-zinc-100 bg-zinc-50/80">
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Produk</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Kategori</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Harga</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Stok</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Status</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-zinc-500">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {paginatedProducts.map((product) => (
                      <tr key={product.id} className="hover:bg-zinc-50/50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg bg-zinc-100">
                              {product.thumbnail ? (
                                <img src={product.thumbnail} alt="" className="h-full w-full object-cover" />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center">
                                  <ImageIcon className="h-5 w-5 text-zinc-400" />
                                </div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-zinc-900 truncate">{product.name}</p>
                              <p className="text-sm text-zinc-500 truncate max-w-[200px]">{product.description || "—"}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="rounded-md bg-zinc-100 px-2 py-1 text-sm text-zinc-600">{product.category?.name || "—"}</span>
                        </td>
                        <td className="px-4 py-3 font-medium text-zinc-900">{formatPrice(product.price)}</td>
                        <td className="px-4 py-3">
                          <span className={product.stock === 0 ? "text-red-600 font-medium" : "text-zinc-600"}>{product.stock}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${product.isActive ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                            {product.isActive ? "Aktif" : "Nonaktif"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-1">
                            <Link href={`/admin/produk/${product.id}/edit`} className="rounded-md p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600" title="Edit">
                              <Pencil className="h-4 w-4" />
                            </Link>
                            <button onClick={() => setDeleteId(product.id)} className="rounded-md p-1.5 text-zinc-400 hover:bg-red-50 hover:text-red-600" title="Hapus">
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
                {paginatedProducts.map((product) => (
                  <div key={product.id} className="p-4 space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-zinc-100">
                        {product.thumbnail ? (
                          <img src={product.thumbnail} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <ImageIcon className="h-5 w-5 text-zinc-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-zinc-900 truncate">{product.name}</p>
                        <p className="text-xs text-zinc-500">{product.category?.name || "—"}</p>
                      </div>
                      <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${product.isActive ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                        {product.isActive ? "Aktif" : "Nonaktif"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-sm">
                        <span className="font-medium text-zinc-900">{formatPrice(product.price)}</span>
                        <span className={`${product.stock === 0 ? "text-red-600" : "text-zinc-500"}`}>Stok: {product.stock}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button onClick={() => window.location.href = `/admin/produk/${product.id}/edit`} className="rounded-md p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600">
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button onClick={() => setDeleteId(product.id)} className="rounded-md p-1.5 text-zinc-400 hover:bg-red-50 hover:text-red-600">
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
              {filteredProducts.length === 0
                ? "0 produk"
                : `${startIndex + 1}-${Math.min(startIndex + ITEMS_PER_PAGE, filteredProducts.length)} dari ${filteredProducts.length} produk`}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 text-zinc-600 hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-medium ${
                    currentPage === page
                      ? "bg-zinc-900 text-white"
                      : "border border-zinc-200 text-zinc-600 hover:bg-zinc-50"
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 text-zinc-600 hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
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
            <h2 className="mt-4 text-base font-semibold">Hapus Produk?</h2>
            <p className="mt-2 text-sm text-zinc-500">Produk yang dihapus tidak dapat dikembalikan.</p>
            <div className="mt-5 flex gap-3">
              <Button variant="outline" className="flex-1 h-10 text-sm" onClick={() => setDeleteId(null)}>
                Batal
              </Button>
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
