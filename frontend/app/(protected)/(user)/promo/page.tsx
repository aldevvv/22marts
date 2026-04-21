"use client";

import { useState, useEffect } from "react";
import {
  Tag,
  Search,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Percent,
  Clock,
  Copy,
  CheckCircle,
} from "lucide-react";
import { toast } from "sonner";
import { getPromos, Promo } from "@/lib/api";

const ITEMS_PER_PAGE = 10;

export default function PromoVoucherPage() {
  const [promos, setPromos] = useState<Promo[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    loadPromos();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  async function loadPromos() {
    setLoading(true);
    const result = await getPromos();
    if (result.data) {
      // Only show active & valid promos to users
      const now = new Date();
      setPromos(
        result.data.filter(
          (p) => p.isActive && new Date(p.startDate) <= now && new Date(p.endDate) >= now && (!p.usageLimit || p.usedCount < p.usageLimit)
        )
      );
    }
    setLoading(false);
  }

  function formatPrice(price: number) {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(price);
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
  }

  function handleCopy(code: string, id: string) {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    toast.success(`Kode ${code} berhasil disalin`);
    setTimeout(() => setCopiedId(null), 2000);
  }

  const filteredPromos = promos.filter(
    (p) => p.code.toLowerCase().includes(search.toLowerCase()) || (p.description || "").toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filteredPromos.length / ITEMS_PER_PAGE));
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedPromos = filteredPromos.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-900">
          <Tag className="h-4 w-4 text-white" />
        </div>
        <div>
          <h1 className="text-base font-semibold">Promo & Voucher</h1>
          <p className="text-sm text-zinc-500 hidden sm:block">Gunakan kode promo untuk mendapatkan diskon</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
        <input
          type="text"
          placeholder="Cari kode promo..."
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
          {paginatedPromos.length === 0 ? (
            <div className="px-4 py-12 text-center">
              <Tag className="mx-auto h-10 w-10 text-zinc-300" />
              <p className="mt-3 text-sm font-medium text-zinc-900">
                {search ? "Promo tidak ditemukan" : "Belum Ada Promo"}
              </p>
              <p className="mt-1 text-sm text-zinc-500">
                {search ? "Coba kata kunci lain" : "Belum ada promo yang tersedia saat ini"}
              </p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-zinc-100 bg-zinc-50/80">
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Kode Promo</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Diskon</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Min. Pembelian</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Berlaku Sampai</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-zinc-500">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {paginatedPromos.map((promo) => (
                      <tr key={promo.id} className="hover:bg-zinc-50/50">
                        <td className="px-4 py-3">
                          <div>
                            <p className="text-sm font-mono font-bold text-zinc-900">{promo.code}</p>
                            {promo.description && <p className="text-xs text-zinc-500 truncate max-w-[250px]">{promo.description}</p>}
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
                          {promo.minPurchase > 0 ? formatPrice(promo.minPurchase) : "Tanpa minimum"}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5 text-sm text-zinc-600">
                            <Clock className="h-3.5 w-3.5 text-zinc-400" />
                            {formatDate(promo.endDate)}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end">
                            <button
                              onClick={() => handleCopy(promo.code, promo.id)}
                              className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-zinc-900 px-3 text-xs font-medium text-white hover:bg-zinc-800 transition-colors"
                            >
                              {copiedId === promo.id ? <CheckCircle className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                              {copiedId === promo.id ? "Disalin" : "Salin Kode"}
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
                {paginatedPromos.map((promo) => (
                  <div key={promo.id} className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-mono font-bold text-zinc-900">{promo.code}</p>
                        {promo.description && <p className="text-xs text-zinc-500 mt-0.5">{promo.description}</p>}
                      </div>
                      <button
                        onClick={() => handleCopy(promo.code, promo.id)}
                        className="shrink-0 inline-flex h-8 items-center gap-1.5 rounded-lg bg-zinc-900 px-3 text-xs font-medium text-white hover:bg-zinc-800"
                      >
                        {copiedId === promo.id ? <CheckCircle className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                        {copiedId === promo.id ? "Disalin" : "Salin"}
                      </button>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1.5">
                        <Percent className="h-3.5 w-3.5 text-zinc-400" />
                        <span className="font-medium text-zinc-900">
                          {promo.discountType === "PERCENTAGE" ? `${promo.discountValue}%` : formatPrice(promo.discountValue)}
                        </span>
                      </div>
                      <span className="text-zinc-300">•</span>
                      <span className="text-zinc-500">
                        {promo.minPurchase > 0 ? `Min. ${formatPrice(promo.minPurchase)}` : "Tanpa minimum"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                      <Clock className="h-3 w-3" />
                      Berlaku sampai {formatDate(promo.endDate)}
                      {promo.maxDiscount && promo.discountType === "PERCENTAGE" && (
                        <span>• Maks. {formatPrice(promo.maxDiscount)}</span>
                      )}
                    </div>
                  </div>
                ))}
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
    </div>
  );
}
