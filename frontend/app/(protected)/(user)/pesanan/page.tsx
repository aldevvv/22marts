"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShoppingCart,
  Search,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Package,
  ImageIcon,
  Truck,
  CheckCircle,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getOrders, Order } from "@/lib/api";

const ITEMS_PER_PAGE = 10;

const STATUS_CONFIG: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  DIPROSES: { label: "Diproses", icon: Clock, color: "bg-amber-50 text-amber-700" },
  DIKIRIM: { label: "Dikirim", icon: Truck, color: "bg-blue-50 text-blue-700" },
  SELESAI: { label: "Selesai", icon: CheckCircle, color: "bg-green-50 text-green-700" },
};

export default function PesananSayaPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterStatus]);

  async function loadOrders() {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) return;

    setLoading(true);
    const user = JSON.parse(storedUser);
    const result = await getOrders(user.id);
    if (result.data) setOrders(result.data);
    setLoading(false);
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

  const filteredOrders = orders.filter((order) => {
    const matchSearch = order.orderId.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !filterStatus || order.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / ITEMS_PER_PAGE));
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedOrders = filteredOrders.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-900">
          <ShoppingCart className="h-4 w-4 text-white" />
        </div>
        <div>
          <h1 className="text-base font-semibold">Pesanan Saya</h1>
          <p className="text-sm text-zinc-500 hidden sm:block">Lihat dan lacak semua pesanan Anda</p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Cari nomor pesanan..."
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
          <option value="DIPROSES">Diproses</option>
          <option value="DIKIRIM">Dikirim</option>
          <option value="SELESAI">Selesai</option>
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
        </div>
      ) : (
        <div className="rounded-lg border border-zinc-200 bg-white">
          {paginatedOrders.length === 0 ? (
            <div className="px-4 py-12 text-center">
              <Package className="mx-auto h-10 w-10 text-zinc-300" />
              <p className="mt-3 text-sm font-medium text-zinc-900">
                {search || filterStatus ? "Pesanan tidak ditemukan" : "Belum Ada Pesanan"}
              </p>
              <p className="mt-1 text-sm text-zinc-500">
                {search || filterStatus ? "Coba ubah filter pencarian" : "Mulai belanja untuk membuat pesanan pertama"}
              </p>
              {!search && !filterStatus && (
                <button onClick={() => window.location.href = "/produk"} className="mt-4 inline-flex h-9 items-center gap-2 rounded-lg bg-zinc-900 px-4 text-sm font-medium text-white hover:bg-zinc-800">
                  <ShoppingCart className="h-4 w-4" /> Mulai Belanja
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
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">No. Pesanan</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Produk</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Total</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {paginatedOrders.map((order) => {
                      const statusConfig = STATUS_CONFIG[order.status] || STATUS_CONFIG.DIPROSES;
                      const StatusIcon = statusConfig.icon;
                      const totalQty = order.items.reduce((sum, item) => sum + item.quantity, 0);

                      return (
                        <tr key={order.id} className="hover:bg-zinc-50/50 cursor-pointer" onClick={() => window.location.href = `/pesanan/${order.orderId}`}>
                          <td className="px-4 py-3">
                            <div>
                              <p className="text-sm font-mono font-medium text-zinc-900">{order.orderId}</p>
                              <p className="text-xs text-zinc-400">{formatDate(order.createdAt)}</p>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="flex -space-x-2">
                                {order.items.slice(0, 3).map((item) => (
                                  <div key={item.id} className="h-8 w-8 shrink-0 overflow-hidden rounded-md border-2 border-white bg-zinc-100">
                                    {item.product?.thumbnail ? (
                                      <img src={item.product.thumbnail} alt="" className="h-full w-full object-cover" />
                                    ) : (
                                      <div className="flex h-full w-full items-center justify-center">
                                        <ImageIcon className="h-3.5 w-3.5 text-zinc-300" />
                                      </div>
                                    )}
                                  </div>
                                ))}
                                {order.items.length > 3 && (
                                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border-2 border-white bg-zinc-100 text-[10px] font-medium text-zinc-500">
                                    +{order.items.length - 3}
                                  </div>
                                )}
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm text-zinc-600 truncate max-w-[200px]">
                                  {order.items.map((i) => i.product?.name || "—").join(", ")}
                                </p>
                                <p className="text-xs text-zinc-400">{totalQty} item</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-sm font-medium text-zinc-900">{formatPrice(order.total)}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${statusConfig.color}`}>
                              <StatusIcon className="h-3.5 w-3.5" />
                              {statusConfig.label}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="sm:hidden divide-y divide-zinc-100">
                {paginatedOrders.map((order) => {
                  const statusConfig = STATUS_CONFIG[order.status] || STATUS_CONFIG.DIPROSES;
                  const StatusIcon = statusConfig.icon;
                  const totalQty = order.items.reduce((sum, item) => sum + item.quantity, 0);

                  return (
                    <button key={order.id} onClick={() => window.location.href = `/pesanan/${order.orderId}`} className="w-full text-left p-4 space-y-2 hover:bg-zinc-50/50">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-mono font-medium text-zinc-900">{order.orderId}</p>
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${statusConfig.color}`}>
                          <StatusIcon className="h-3 w-3" />
                          {statusConfig.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex -space-x-1.5">
                          {order.items.slice(0, 3).map((item) => (
                            <div key={item.id} className="h-7 w-7 shrink-0 overflow-hidden rounded border-2 border-white bg-zinc-100">
                              {item.product?.thumbnail ? (
                                <img src={item.product.thumbnail} alt="" className="h-full w-full object-cover" />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center">
                                  <ImageIcon className="h-3 w-3 text-zinc-300" />
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                        <p className="text-xs text-zinc-500 truncate flex-1">{order.items.map((i) => i.product?.name).filter(Boolean).join(", ")}</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-zinc-400">{formatDate(order.createdAt)} • {totalQty} item</span>
                        <span className="text-sm font-bold text-zinc-900">{formatPrice(order.total)}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {/* Pagination */}
          <div className="flex flex-col gap-2 border-t border-zinc-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-zinc-500">
              {filteredOrders.length === 0
                ? "0 pesanan"
                : `${startIndex + 1}-${Math.min(startIndex + ITEMS_PER_PAGE, filteredOrders.length)} dari ${filteredOrders.length} pesanan`}
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
    </div>
  );
}
