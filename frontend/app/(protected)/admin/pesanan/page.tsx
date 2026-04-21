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
  Truck,
  CheckCircle,
  Clock,
  TrendingUp,
  ArrowUpRight,
  DollarSign,
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
  AreaChart,
  Area,
} from "recharts";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { getOrders, updateOrderStatus, Order } from "@/lib/api";

const ITEMS_PER_PAGE = 10;

const STATUS_CONFIG: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  DIPROSES: { label: "Diproses", icon: Clock, color: "bg-amber-50 text-amber-700" },
  DIKIRIM: { label: "Dikirim", icon: Truck, color: "bg-blue-50 text-blue-700" },
  SELESAI: { label: "Selesai", icon: CheckCircle, color: "bg-green-50 text-green-700" },
};

const PIE_COLORS = ["#f59e0b", "#3b82f6", "#22c55e"];

export default function KelolaPesananPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [mounted, setMounted] = useState(false);
  const [dateRange, setDateRange] = useState("overall");

  useEffect(() => {
    setMounted(true);
    loadOrders();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterStatus]);

  async function loadOrders() {
    setLoading(true);
    const result = await getOrders();
    if (result.data) setOrders(result.data);
    setLoading(false);
  }

  async function handleStatusChange(orderId: string, status: string) {
    const result = await updateOrderStatus(orderId, status);
    if (result.data) {
      toast.success(`Status pesanan diubah ke ${STATUS_CONFIG[status]?.label || status}`);
      setOrders((prev) =>
        prev.map((o) => (o.orderId === orderId ? { ...o, status } : o))
      );
    } else {
      toast.error(result.error);
    }
  }

  function formatPrice(price: number) {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(price);
  }

  function formatCompact(price: number) {
    if (price >= 1000000) return `Rp ${(price / 1000000).toFixed(1)}M`;
    if (price >= 1000) return `Rp ${(price / 1000).toFixed(0)}K`;
    return `Rp ${price}`;
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  }

  // Date range filter
  function getDateRangeOrders() {
    if (dateRange === "overall") return orders;
    const now = new Date();
    const cutoff = new Date();
    if (dateRange === "today") cutoff.setHours(0, 0, 0, 0);
    else if (dateRange === "7days") cutoff.setDate(now.getDate() - 7);
    else if (dateRange === "14days") cutoff.setDate(now.getDate() - 14);
    else if (dateRange === "30days") cutoff.setDate(now.getDate() - 30);
    return orders.filter((o) => new Date(o.createdAt) >= cutoff);
  }

  const rangedOrders = getDateRangeOrders();

  // Stats
  const totalRevenue = rangedOrders.reduce((sum, o) => sum + o.total, 0);
  const totalDiscount = rangedOrders.reduce((sum, o) => sum + (o.discount || 0), 0);
  const avgOrderValue = rangedOrders.length > 0 ? Math.round(totalRevenue / rangedOrders.length) : 0;

  const countByStatus = {
    DIPROSES: rangedOrders.filter((o) => o.status === "DIPROSES").length,
    DIKIRIM: rangedOrders.filter((o) => o.status === "DIKIRIM").length,
    SELESAI: rangedOrders.filter((o) => o.status === "SELESAI").length,
  };

  // Chart data - dynamic based on date range
  const chartDays = dateRange === "today" ? 1 : dateRange === "7days" ? 7 : dateRange === "14days" ? 14 : dateRange === "30days" ? 30 : 7;
  const chartDateRange = Array.from({ length: Math.min(chartDays, 14) }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (Math.min(chartDays, 14) - 1 - i));
    return d;
  });

  const ordersByDay = chartDateRange.map((date) => {
    const dayStr = date.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
    const count = rangedOrders.filter((o) => new Date(o.createdAt).toDateString() === date.toDateString()).length;
    const revenue = rangedOrders
      .filter((o) => new Date(o.createdAt).toDateString() === date.toDateString())
      .reduce((sum, o) => sum + o.total, 0);
    return { day: dayStr, pesanan: count, pendapatan: revenue };
  });

  // Pie data
  const pieData = [
    { name: "Diproses", value: countByStatus.DIPROSES },
    { name: "Dikirim", value: countByStatus.DIKIRIM },
    { name: "Selesai", value: countByStatus.SELESAI },
  ].filter((d) => d.value > 0);

  // Filter
  const filteredOrders = orders.filter((order) => {
    const matchSearch =
      order.orderId.toLowerCase().includes(search.toLowerCase()) ||
      (order.user?.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (order.user?.email || "").toLowerCase().includes(search.toLowerCase()) ||
      order.shippingName.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !filterStatus || order.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / ITEMS_PER_PAGE));
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedOrders = filteredOrders.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-900">
            <ShoppingCart className="h-4 w-4 text-white" />
          </div>
          <div>
            <h1 className="text-base font-semibold">Kelola Pesanan</h1>
            <p className="text-sm text-zinc-500 hidden sm:block">Kelola dan update status pesanan</p>
          </div>
        </div>
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="h-9 rounded-lg border border-zinc-200 bg-white px-3 text-sm focus:border-zinc-900 focus:outline-none"
        >
          <option value="today">Hari Ini</option>
          <option value="7days">7 Hari Terakhir</option>
          <option value="14days">14 Hari Terakhir</option>
          <option value="30days">30 Hari Terakhir</option>
          <option value="overall">Overall</option>
        </select>
      </div>

      {/* Stats */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {[
          { label: "Total Pesanan", value: rangedOrders.length.toString(), change: "+12.5%", trend: "up" as const, icon: Package, iconColor: "text-zinc-600", iconBg: "bg-zinc-100" },
          { label: "Total Pendapatan", value: formatCompact(totalRevenue), change: "+8.2%", trend: "up" as const, icon: DollarSign, iconColor: "text-green-600", iconBg: "bg-green-50" },
          { label: "Sedang Dikirim", value: countByStatus.DIKIRIM.toString(), change: `${countByStatus.DIPROSES} diproses`, trend: "neutral" as const, icon: Truck, iconColor: "text-blue-600", iconBg: "bg-blue-50" },
          { label: "Pesanan Selesai", value: countByStatus.SELESAI.toString(), change: `${rangedOrders.length > 0 ? Math.round((countByStatus.SELESAI / rangedOrders.length) * 100) : 0}% selesai`, trend: "up" as const, icon: CheckCircle, iconColor: "text-green-600", iconBg: "bg-green-50" },
          { label: "Total Diskon", value: formatCompact(totalDiscount), change: `${rangedOrders.filter((o) => o.discount > 0).length} pesanan`, trend: "neutral" as const, icon: TrendingUp, iconColor: "text-amber-600", iconBg: "bg-amber-50" },
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

      {/* Charts */}
      <div className="grid gap-3 lg:grid-cols-3">
        {/* Orders & Revenue Chart */}
        <div className="rounded-lg border border-zinc-200 bg-white p-3 sm:p-4 lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold">Pesanan & Pendapatan</h2>
              <p className="text-xs text-zinc-500">
                {dateRange === "today" ? "Hari ini" : dateRange === "7days" ? "7 hari terakhir" : dateRange === "14days" ? "14 hari terakhir" : dateRange === "30days" ? "30 hari terakhir" : "Semua waktu"}
              </p>
            </div>
          </div>
          <div className="h-52">
            {mounted && (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={ordersByDay}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#71717a" }} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="left" tick={{ fontSize: 11, fill: "#71717a" }} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: "#71717a" }} axisLine={false} tickLine={false} tickFormatter={(v) => formatCompact(v)} />
                  <Tooltip
                    contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e4e4e7" }}
                    formatter={(value: number, name: string) => [
                      name === "pendapatan" ? formatPrice(value) : value,
                      name === "pendapatan" ? "Pendapatan" : "Pesanan",
                    ]}
                  />
                  <Area yAxisId="right" type="monotone" dataKey="pendapatan" stroke="#22c55e" fill="#22c55e" fillOpacity={0.1} strokeWidth={2} />
                  <Area yAxisId="left" type="monotone" dataKey="pesanan" stroke="#18181b" fill="#18181b" fillOpacity={0.05} strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Status Pie */}
        <div className="rounded-lg border border-zinc-200 bg-white p-4">
          <div className="mb-3">
            <h2 className="text-sm font-semibold">Status Pesanan</h2>
            <p className="text-xs text-zinc-500">Distribusi saat ini</p>
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
              { name: "Diproses", value: countByStatus.DIPROSES, color: "#f59e0b" },
              { name: "Dikirim", value: countByStatus.DIKIRIM, color: "#3b82f6" },
              { name: "Selesai", value: countByStatus.SELESAI, color: "#22c55e" },
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

      {/* Search & Filter */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Cari nomor pesanan, nama, atau email..."
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
                {search || filterStatus ? "Coba ubah filter pencarian" : "Pesanan dari pelanggan akan muncul di sini"}
              </p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-zinc-100 bg-zinc-50/80">
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">No. Pesanan</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Pelanggan</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Total</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Catatan</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {paginatedOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-zinc-50/50">
                        <td className="px-4 py-3">
                          <div>
                            <Link href={`/admin/pesanan/${order.orderId}`} className="text-sm font-mono font-medium text-zinc-900 hover:underline">
                              {order.orderId}
                            </Link>
                            <p className="text-xs text-zinc-400">{formatDate(order.createdAt)}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm font-medium text-zinc-900">{order.user?.name || "—"}</p>
                          <p className="text-xs text-zinc-500">{order.user?.email || "—"}</p>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm font-medium text-zinc-900">{formatPrice(order.total)}</span>
                        </td>
                        <td className="px-4 py-3">
                          {order.notes ? (
                            <p className="text-sm text-zinc-600 max-w-[200px] truncate" title={order.notes}>{order.notes}</p>
                          ) : (
                            <span className="text-sm text-zinc-400">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <select
                            value={order.status}
                            onChange={(e) => handleStatusChange(order.orderId, e.target.value)}
                            className="h-8 rounded-lg border border-zinc-200 bg-white px-2 text-xs font-medium focus:outline-none focus:border-zinc-900"
                          >
                            <option value="DIPROSES">Diproses</option>
                            <option value="DIKIRIM">Dikirim</option>
                            <option value="SELESAI">Selesai</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="sm:hidden divide-y divide-zinc-100">
                {paginatedOrders.map((order) => {
                  const statusConfig = STATUS_CONFIG[order.status] || STATUS_CONFIG.DIPROSES;
                  return (
                    <div key={order.id} className="p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <Link href={`/admin/pesanan/${order.orderId}`} className="text-sm font-mono font-medium text-zinc-900 hover:underline">
                          {order.orderId}
                        </Link>
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusConfig.color}`}>
                          {statusConfig.label}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-zinc-500">{order.user?.name || "—"}</span>
                        <span className="font-medium text-zinc-900">{formatPrice(order.total)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-zinc-400">{formatDate(order.createdAt)}</span>
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.orderId, e.target.value)}
                          className="h-7 rounded border border-zinc-200 bg-white px-1.5 text-xs font-medium focus:outline-none"
                        >
                          <option value="DIPROSES">Diproses</option>
                          <option value="DIKIRIM">Dikirim</option>
                          <option value="SELESAI">Selesai</option>
                        </select>
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
                    currentPage === page ? "bg-zinc-900 text-white" : "border border-zinc-200 text-zinc-600 hover:bg-zinc-50"
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
