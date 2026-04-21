"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Loader2,
  ImageIcon,
  Package,
  Truck,
  CheckCircle,
  Clock,
  ShoppingCart,
  ShoppingBag,
} from "lucide-react";
import { toast } from "sonner";
import { getOrderByOrderId, updateOrderStatus, Order } from "@/lib/api";

const STATUS_STEPS = [
  { key: "DIBUAT", label: "Pesanan Dibuat", icon: ShoppingBag },
  { key: "DIPROSES", label: "Diproses", icon: Clock },
  { key: "DIKIRIM", label: "Dikirim", icon: Truck },
  { key: "SELESAI", label: "Selesai", icon: CheckCircle },
];

export default function AdminDetailPesananPage() {
  const params = useParams();
  const orderId = params.orderId as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [itemPage, setItemPage] = useState(1);
  const ITEMS_PER_PAGE = 3;

  useEffect(() => {
    loadOrder();
  }, [orderId]);

  async function loadOrder() {
    setLoading(true);
    const result = await getOrderByOrderId(orderId);
    if (result.data) setOrder(result.data);
    setLoading(false);
  }

  async function handleStatusChange(status: string) {
    if (status === "DIBUAT") return;
    const result = await updateOrderStatus(orderId, status);
    if (result.data) {
      setOrder(result.data);
      toast.success(`Status diubah ke ${STATUS_STEPS.find((s) => s.key === status)?.label}`);
    } else {
      toast.error(result.error);
    }
  }

  function formatPrice(price: number) {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(price);
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  }

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-zinc-400" /></div>;
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Package className="h-10 w-10 text-zinc-300" />
        <p className="mt-3 text-sm font-medium">Pesanan tidak ditemukan</p>
        <Link href="/admin/pesanan" className="mt-2 text-sm text-zinc-500 hover:text-zinc-900 underline">Kembali</Link>
      </div>
    );
  }

  const totalQty = order.items.reduce((sum, item) => sum + item.quantity, 0);
  const totalItemPages = Math.max(1, Math.ceil(order.items.length / ITEMS_PER_PAGE));
  const paginatedItems = order.items.slice((itemPage - 1) * ITEMS_PER_PAGE, itemPage * ITEMS_PER_PAGE);
  // DIBUAT is always past (order exists), then map status
  const statusIndex = STATUS_STEPS.findIndex((s) => s.key === order.status);
  const currentStepIndex = statusIndex === -1 ? 0 : statusIndex;

  return (
    <div className="space-y-4">
      {/* Card 1: Status */}
      <div className="rounded-lg border border-zinc-200 bg-white overflow-hidden">
        <div className="border-b border-zinc-100 bg-zinc-50/80 px-4 py-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Status Pesanan</span>
        </div>
        <div className="p-4 flex justify-center">
          <div className="relative flex w-full max-w-2xl items-start justify-between">
            {/* Background line */}
            <div className="absolute top-[19px] left-[25px] right-[25px] h-0.5 bg-zinc-200 rounded-full" />
            {/* Active line */}
            {currentStepIndex > 0 && (
              <div
                className="absolute top-[19px] left-[25px] h-0.5 bg-zinc-900 rounded-full transition-all"
                style={{ width: `${(currentStepIndex / (STATUS_STEPS.length - 1)) * 100}%` }}
              />
            )}
            {/* Steps */}
            {STATUS_STEPS.map((step, i) => {
              const isPast = i <= currentStepIndex;
              const isCurrent = i === currentStepIndex;
              const Icon = step.icon;
              const isClickable = step.key !== "DIBUAT";

              return (
                <button
                  key={step.key}
                  onClick={() => isClickable && handleStatusChange(step.key)}
                  disabled={!isClickable}
                  className={`relative z-10 flex flex-col items-center gap-1.5 ${isClickable ? "group" : ""}`}
                >
                  <div className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
                    isCurrent ? "bg-zinc-900 text-white ring-4 ring-zinc-900/10"
                    : isPast ? "bg-zinc-900 text-white"
                    : isClickable ? "bg-zinc-100 text-zinc-400 group-hover:bg-zinc-200" : "bg-zinc-100 text-zinc-400"
                  }`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className={`text-xs font-medium whitespace-nowrap ${isPast ? "text-zinc-900" : "text-zinc-400"}`}>{step.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Card 2: Detail */}
      <div className="rounded-lg border border-zinc-200 bg-white overflow-hidden">
        <div className="border-b border-zinc-100 bg-zinc-50/80 px-4 py-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Detail Pesanan</span>
        </div>

        {/* Products + Summary */}
        <div className="grid lg:grid-cols-3">
        <div className="lg:col-span-2 overflow-x-auto border-b border-zinc-100 lg:border-b-0">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-100">
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Produk</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Harga</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Qty</th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-zinc-500">Subtotal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {paginatedItems.map((item) => (
              <tr key={item.id}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-zinc-100">
                      {item.product.thumbnail ? (
                        <img src={item.product.thumbnail} alt={item.product.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center"><ImageIcon className="h-4 w-4 text-zinc-300" /></div>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-zinc-900">{item.product.name}</p>
                      {item.product.category && <span className="text-xs text-zinc-500">{item.product.category?.name}</span>}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-zinc-600">{formatPrice(item.price)}</td>
                <td className="px-4 py-3 text-sm text-zinc-600">{item.quantity}</td>
                <td className="px-4 py-3 text-right text-sm font-medium text-zinc-900">{formatPrice(item.price * item.quantity)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {order.items.length > ITEMS_PER_PAGE && (
          <div className="flex items-center justify-between border-t border-zinc-100 px-4 py-2">
            <p className="text-xs text-zinc-500">{(itemPage - 1) * ITEMS_PER_PAGE + 1}-{Math.min(itemPage * ITEMS_PER_PAGE, order.items.length)} dari {order.items.length} produk</p>
            <div className="flex items-center gap-1">
              <button onClick={() => setItemPage((p) => Math.max(1, p - 1))} disabled={itemPage === 1} className="flex h-6 w-6 items-center justify-center rounded border border-zinc-200 text-zinc-600 hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed text-xs">‹</button>
              {Array.from({ length: totalItemPages }, (_, i) => i + 1).map((page) => (
                <button key={page} onClick={() => setItemPage(page)} className={`flex h-6 w-6 items-center justify-center rounded text-xs font-medium ${itemPage === page ? "bg-zinc-900 text-white" : "border border-zinc-200 text-zinc-600 hover:bg-zinc-50"}`}>{page}</button>
              ))}
              <button onClick={() => setItemPage((p) => Math.min(totalItemPages, p + 1))} disabled={itemPage === totalItemPages} className="flex h-6 w-6 items-center justify-center rounded border border-zinc-200 text-zinc-600 hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed text-xs">›</button>
            </div>
          </div>
        )}
        </div>

        {/* Summary - Right side */}
        <div className="lg:border-l border-zinc-100 p-4 space-y-2.5">
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Rincian Harga</p>
          <div className="flex items-center justify-between text-sm">
            <span className="text-zinc-500">Subtotal ({totalQty} item)</span>
            <span className="text-zinc-900">{formatPrice(order.subtotal)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-zinc-500">Ongkos Kirim</span>
            <span className="text-green-600 font-medium">Gratis</span>
          </div>
          {order.discount > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-zinc-500">Diskon {order.promoCode && <span className="font-mono text-xs">({order.promoCode})</span>}</span>
              <span className="text-green-600 font-medium">-{formatPrice(order.discount)}</span>
            </div>
          )}
          <div className="border-t border-zinc-100 pt-2.5 flex items-center justify-between">
            <span className="text-sm font-semibold text-zinc-900">Total</span>
            <span className="text-lg font-bold text-zinc-900">{formatPrice(order.total)}</span>
          </div>
          <div className="border-t border-zinc-100 pt-2.5 flex items-center justify-between text-sm">
            <span className="text-zinc-500">Pembayaran</span>
            <span className={`font-medium ${order.paymentStatus === "settlement" ? "text-green-600" : "text-amber-600"}`}>
              {order.paymentStatus === "settlement" ? "Lunas" : "Menunggu"}
            </span>
          </div>
          {order.paymentType && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-zinc-500">Metode</span>
              <span className="text-zinc-900 capitalize">{order.paymentType.replace(/_/g, " ")}</span>
            </div>
          )}
        </div>
        </div>

        {/* Info Grid - below table */}
        <div className="grid grid-cols-2 divide-x divide-zinc-100 border-t border-zinc-100 lg:grid-cols-4">
          <div className="p-4">
            <p className="text-xs text-zinc-500">Pelanggan</p>
            <p className="mt-1 text-sm font-medium text-zinc-600">{order.user?.name || "—"}</p>
            <p className="text-xs text-zinc-500">{order.user?.email || "—"}</p>
          </div>
          <div className="p-4">
            <p className="text-xs text-zinc-500">Penerima</p>
            <p className="mt-1 text-sm font-medium text-zinc-600">{order.shippingName}</p>
            <p className="text-xs text-zinc-500">{order.shippingPhone}</p>
          </div>
          <div className="p-4">
            <p className="text-xs text-zinc-500">Alamat Pengiriman</p>
            <p className="mt-1 text-sm text-zinc-600 leading-relaxed line-clamp-3">{order.shippingAddress}</p>
          </div>
          <div className="p-4">
            <p className="text-xs text-zinc-500">Catatan</p>
            {order.notes ? (
              <p className="mt-1 text-sm text-zinc-600 line-clamp-3">{order.notes}</p>
            ) : (
              <p className="mt-1 text-sm text-zinc-400 italic">Tidak ada</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
