"use client";

import { useState, useEffect } from "react";
import {
  Heart,
  Search,
  Loader2,
  ImageIcon,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ShoppingCart,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useFavorite } from "@/lib/favorite-context";
import { useCart } from "@/lib/cart-context";
import { getFavorites, removeFavorite, addToCart, FavoriteItem } from "@/lib/api";

const ITEMS_PER_PAGE = 10;

export default function FavoritPage() {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const { refreshCount: refreshFavoriteCount } = useFavorite();
  const { refreshCount: refreshCartCount } = useCart();

  useEffect(() => {
    loadFavorites();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  function getUserId() {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) return null;
    return JSON.parse(storedUser).id;
  }

  async function loadFavorites() {
    const userId = getUserId();
    if (!userId) return;

    setLoading(true);
    const result = await getFavorites(userId);
    if (result.data) setFavorites(result.data);
    setLoading(false);
  }

  async function handleRemove(productId: string) {
    const userId = getUserId();
    if (!userId) return;

    setFavorites((prev) => prev.filter((f) => f.productId !== productId));

    const result = await removeFavorite(userId, productId);
    if (!result.error) {
      toast.success("Dihapus dari favorit");
      refreshFavoriteCount();
    } else {
      toast.error(result.error);
      loadFavorites();
    }
  }

  async function handleAddToCart(productId: string, productName: string) {
    const userId = getUserId();
    if (!userId) return;

    const result = await addToCart(userId, productId, 1);
    if (result.data) {
      toast.success(`${productName} ditambahkan ke keranjang`);
      refreshCartCount();
    } else {
      toast.error(result.error);
    }
  }

  function formatPrice(price: number) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  const filteredFavorites = favorites.filter((f) =>
    f.product.name.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filteredFavorites.length / ITEMS_PER_PAGE));
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedFavorites = filteredFavorites.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-900">
          <Heart className="h-4 w-4 text-white" />
        </div>
        <div>
          <h1 className="text-base font-semibold">Favorit</h1>
          <p className="text-sm text-zinc-500 hidden sm:block">Produk yang Anda sukai</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
        <input
          type="text"
          placeholder="Cari produk favorit..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-9 w-full rounded-lg border border-zinc-200 bg-white pl-9 pr-3 text-sm placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
        />
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
        </div>
      ) : (
        <div className="rounded-lg border border-zinc-200 bg-white">
          {paginatedFavorites.length === 0 ? (
            <div className="px-4 py-12 text-center">
              <Heart className="mx-auto h-10 w-10 text-zinc-300" />
              <p className="mt-3 text-sm font-medium text-zinc-900">
                {search ? "Produk tidak ditemukan" : "Belum Ada Favorit"}
              </p>
              <p className="mt-1 text-sm text-zinc-500">
                {search ? "Coba kata kunci lain" : "Tambahkan produk favorit dari halaman produk"}
              </p>
              {!search && (
                <button onClick={() => window.location.href = "/produk"} className="mt-4 inline-flex h-9 items-center gap-2 rounded-lg bg-zinc-900 px-4 text-sm font-medium text-white hover:bg-zinc-800">
                  <ShoppingCart className="h-4 w-4" /> Jelajahi Produk
                </button>
              )}
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
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Ditambahkan</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-zinc-500">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {paginatedFavorites.map((fav) => (
                      <tr key={fav.id} className="hover:bg-zinc-50/50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg bg-zinc-100">
                              {fav.product.thumbnail ? (
                                <img src={fav.product.thumbnail} alt="" className="h-full w-full object-cover" />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center">
                                  <ImageIcon className="h-5 w-5 text-zinc-400" />
                                </div>
                              )}
                            </div>
                            <button onClick={() => window.location.href = `/produk/${fav.product.slug}`} className="min-w-0">
                              <p className="text-sm font-medium text-zinc-900 hover:underline truncate">{fav.product.name}</p>
                            </button>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="rounded-md bg-zinc-100 px-2 py-1 text-sm text-zinc-600">{fav.product.category?.name || "—"}</span>
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-zinc-900">{formatPrice(fav.product.price)}</td>
                        <td className="px-4 py-3">
                          <span className={`text-sm ${fav.product.stock === 0 ? "text-red-600 font-medium" : "text-zinc-600"}`}>
                            {fav.product.stock === 0 ? "Habis" : fav.product.stock}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-zinc-500">{formatDate(fav.createdAt)}</td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-1">
                            <button
                              onClick={() => handleAddToCart(fav.productId, fav.product.name)}
                              disabled={fav.product.stock === 0}
                              className="rounded-md p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 disabled:opacity-40"
                              title="Tambah ke Keranjang"
                            >
                              <ShoppingCart className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleRemove(fav.productId)}
                              className="rounded-md p-1.5 text-zinc-400 hover:bg-red-50 hover:text-red-600"
                              title="Hapus dari Favorit"
                            >
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
                {paginatedFavorites.map((fav) => (
                  <div key={fav.id} className="p-4 space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-zinc-100">
                        {fav.product.thumbnail ? (
                          <img src={fav.product.thumbnail} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <ImageIcon className="h-5 w-5 text-zinc-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <button onClick={() => window.location.href = `/produk/${fav.product.slug}`}>
                          <p className="text-sm font-medium text-zinc-900 hover:underline truncate">{fav.product.name}</p>
                        </button>
                        <p className="text-xs text-zinc-500">{fav.product.category?.name || "—"}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-zinc-900">{formatPrice(fav.product.price)}</span>
                        <span className={`text-xs ${fav.product.stock === 0 ? "text-red-600" : "text-zinc-500"}`}>
                          Stok: {fav.product.stock === 0 ? "Habis" : fav.product.stock}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleAddToCart(fav.productId, fav.product.name)}
                          disabled={fav.product.stock === 0}
                          className="rounded-md p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 disabled:opacity-40"
                        >
                          <ShoppingCart className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleRemove(fav.productId)}
                          className="rounded-md p-1.5 text-zinc-400 hover:bg-red-50 hover:text-red-600"
                        >
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
              {filteredFavorites.length === 0
                ? "0 favorit"
                : `${startIndex + 1}-${Math.min(startIndex + ITEMS_PER_PAGE, filteredFavorites.length)} dari ${filteredFavorites.length} favorit`}
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
    </div>
  );
}
