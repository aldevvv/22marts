"use client";

import { useEffect, useState } from "react";
import {
  ShoppingBag,
  Clock,
  Heart,
  Truck,
  ArrowUpRight,
  ChevronRight,
  Package,
  DollarSign,
  CheckCircle,
  LayoutDashboard,
  ImageIcon,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  getOrders,
  getFavorites,
  Order,
  FavoriteItem,
} from "@/lib/api";

interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
}

const STATUS_COLORS: Record<string, { icon: React.ElementType; color: string }> = {
  DIPROSES: { icon: Clock, color: "text-amber-600 bg-amber-50" },
  DIKIRIM: { icon: Truck, color: "text-blue-600 bg-blue-50" },
  SELESAI: { icon: CheckCircle, color: "text-green-600 bg-green-50" },
};

const PIE_COLORS = ["#f59e0b", "#3b82f6", "#22c55e"];

export default function DashboardPage() {
  const [user, setUser] = useState<UserData | null>(null);
  const [mounted, setMounted] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState("overall");

  useEffect(() => {
    setMounted(true);
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const u = JSON.parse(storedUser);
      setUser(u);
      loadData(u.id);
    }
  }, []);

  async function loadData(userId: string) {
    setLoading(true);
    const [ordersRes, favRes] = await Promise.all([
      getOrders(userId),
      getFavorites(userId),
    ]);
    if (ordersRes.data) setOrders(ordersRes.data);
    if (favRes.data) setFavorites(favRes.data);
    setLoading(false);
  }

  function formatPrice(price: number) {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(price);
  }

  function formatCompact(price: number) {
    if (price >= 1000000) return `Rp ${(price / 1000000).toFixed(1)}M`;
    if (price >= 1000) return `Rp ${(price / 1000).toFixed(0)}K`;
    return `Rp ${price}`;
  }

  function timeAgo(dateString: string) {
    const diff = Date.now() - new Date(dateString).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Baru saja";
    if (mins < 60) return `${mins} menit lalu`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} jam lalu`;
    const days = Math.floor(hours / 24);
    return `${days} hari lalu`;
  }

  // Date range filter
  function filterByRange<T extends { createdAt: string }>(items: T[]): T[] {
    if (dateRange === "overall") return items;
    const now = new Date();
    const cutoff = new Date();
    if (dateRange === "today") cutoff.setHours(0, 0, 0, 0);
    else if (dateRange === "7days") cutoff.setDate(now.getDate() - 7);
    else if (dateRange === "14days") cutoff.setDate(now.getDate() - 14);
    else if (dateRange === "30days") cutoff.setDate(now.getDate() - 30);
    return items.filter((item) => new Date(item.createdAt) >= cutoff);
  }

  const rangedOrders = filterByRange(orders);

  // Stats
  const totalSpending = rangedOrders.reduce((sum, o) => sum + o.total, 0);
  const totalDiscount = rangedOrders.reduce((sum, o) => sum + (o.discount || 0), 0);
  const countByStatus = {
    DIPROSES: rangedOrders.filter((o) => o.status === "DIPROSES").length,
    DIKIRIM: rangedOrders.filter((o) => o.status === "DIKIRIM").length,
    SELESAI: rangedOrders.filter((o) => o.status === "SELESAI").length,
  };

  // Period comparison
  const now = new Date();
  const rangeDays = dateRange === "today" ? 1 : dateRange === "7days" ? 7 : dateRange === "14days" ? 14 : dateRange === "30days" ? 30 : 7;
  const prevOrders = orders.filter((o) => {
    const diff = now.getTime() - new Date(o.createdAt).getTime();
    return diff >= rangeDays * 86400000 && diff < rangeDays * 2 * 86400000;
  });
  const prevSpending = prevOrders.reduce((sum, o) => sum + o.total, 0);

  function calcChange(current: number, previous: number) {
    if (previous === 0) return current > 0 ? "+100%" : "0%";
    const pct = Math.round(((current - previous) / previous) * 100);
    return pct >= 0 ? `+${pct}%` : `${pct}%`;
  }

  const spendingChange = calcChange(totalSpending, prevSpending);
  const orderChange = calcChange(rangedOrders.length, prevOrders.length);

  // Charts
  const chartDays = dateRange === "today" ? 1 : dateRange === "7days" ? 7 : dateRange === "14days" ? 14 : dateRange === "30days" ? 30 : 7;
  const chartRange = Array.from({ length: Math.min(chartDays, 14) }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (Math.min(chartDays, 14) - 1 - i));
    return d;
  });

  const spendingByDay = chartRange.map((date) => ({
    day: date.toLocaleDateString("id-ID", { day: "numeric", month: "short" }),
    pengeluaran: rangedOrders
      .filter((o) => new Date(o.createdAt).toDateString() === date.toDateString())
      .reduce((sum, o) => sum + o.total, 0),
  }));

  const pieData = [
    { name: "Diproses", value: countByStatus.DIPROSES },
    { name: "Dikirim", value: countByStatus.DIKIRIM },
    { name: "Selesai", value: countByStatus.SELESAI },
  ].filter((d) => d.value > 0);

  // Recent orders - latest 5
  const recentOrders = rangedOrders.slice(0, 5);



  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-900">
            <LayoutDashboard className="h-4 w-4 text-white" />
          </div>
          <div>
            <h1 className="text-base font-semibold">Halo, {user?.name?.split(" ")[0] || "User"}!</h1>
            <p className="text-sm text-zinc-500 hidden sm:block">Berikut ringkasan aktivitas Anda</p>
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

      {/* KPI Cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Belanja", value: formatCompact(totalSpending), change: spendingChange, trend: spendingChange.startsWith("+") ? "up" : "down", icon: DollarSign, iconColor: "text-green-600", iconBg: "bg-green-50" },
          { label: "Total Pesanan", value: rangedOrders.length.toString(), change: orderChange, trend: orderChange.startsWith("+") ? "up" : "down", icon: ShoppingBag, iconColor: "text-blue-600", iconBg: "bg-blue-50" },
          { label: "Dalam Pengiriman", value: countByStatus.DIKIRIM.toString(), change: `${countByStatus.DIPROSES} diproses`, trend: "neutral" as const, icon: Truck, iconColor: "text-purple-600", iconBg: "bg-purple-50" },
          { label: "Hemat Diskon", value: formatCompact(totalDiscount), change: `${rangedOrders.filter((o) => o.discount > 0).length} pesanan`, trend: "neutral" as const, icon: Heart, iconColor: "text-amber-600", iconBg: "bg-amber-50" },
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
                  stat.trend === "up" ? "text-green-600" : stat.trend === "down" ? "text-red-600" : "text-zinc-400"
                }`}>
                  {stat.trend === "up" && <ArrowUpRight className="h-3 w-3" />}
                  {stat.trend === "down" && <ArrowUpRight className="h-3 w-3 rotate-90" />}
                  {stat.change}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-3 lg:grid-cols-3">
        {/* Spending Chart */}
        <div className="rounded-lg border border-zinc-200 bg-white p-3 sm:p-4 lg:col-span-2">
          <div className="mb-3 sm:mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-sm font-semibold flex items-center gap-2"><DollarSign className="h-4 w-4 text-zinc-400" />Pengeluaran</h2>
              <p className="text-xs text-zinc-500">
                {dateRange === "today" ? "Hari ini" : dateRange === "7days" ? "7 hari terakhir" : dateRange === "14days" ? "14 hari terakhir" : dateRange === "30days" ? "30 hari terakhir" : "Semua waktu"}
              </p>
            </div>
            <div className="sm:text-right">
              <p className="text-lg font-semibold">{formatCompact(totalSpending)}</p>
              <p className="text-xs text-zinc-500">{rangedOrders.length} pesanan</p>
            </div>
          </div>
          <div className="h-52">
            {mounted && (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={spendingByDay}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#71717a" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#71717a" }} axisLine={false} tickLine={false} tickFormatter={(v) => formatCompact(v)} />
                  <Tooltip
                    contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e4e4e7" }}
                    formatter={(value: number) => [formatPrice(value), "Pengeluaran"]}
                  />
                  <Area type="monotone" dataKey="pengeluaran" stroke="#18181b" fill="#18181b" fillOpacity={0.05} strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Order Status Pie */}
        <div className="rounded-lg border border-zinc-200 bg-white p-3 sm:p-4">
          <div className="mb-3 sm:mb-4">
            <h2 className="text-sm font-semibold flex items-center gap-2"><Package className="h-4 w-4 text-zinc-400" />Status Pesanan</h2>
            <p className="text-xs text-zinc-500">Distribusi saat ini</p>
          </div>
          <div className="h-36">
            {mounted && pieData.length > 0 ? (
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
            ) : mounted ? (
              <div className="flex h-full items-center justify-center text-sm text-zinc-400">Belum ada pesanan</div>
            ) : null}
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

      {/* Recent Orders */}
      <div className="rounded-lg border border-zinc-200 bg-white overflow-hidden">
        <div className="flex items-center justify-between border-b border-zinc-100 bg-zinc-50/80 px-4 py-3">
          <h2 className="text-sm font-semibold flex items-center gap-2"><ShoppingBag className="h-4 w-4 text-zinc-400" />Pesanan Terbaru</h2>
          <button onClick={() => window.location.href = "/pesanan"} className="flex items-center text-xs font-medium text-zinc-500 hover:text-zinc-900">
            Lihat Semua <ChevronRight className="h-3 w-3" />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50/80">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">No. Pesanan</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 hidden sm:table-cell">Produk</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Total</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-12 text-center">
                    <ShoppingBag className="mx-auto h-10 w-10 text-zinc-300" />
                    <p className="mt-3 text-sm font-medium text-zinc-900">Belum Ada Pesanan</p>
                    <p className="mt-1 text-sm text-zinc-500">Mulai belanja untuk membuat pesanan pertama</p>
                    <button onClick={() => window.location.href = "/produk"} className="mt-4 inline-flex h-9 items-center gap-2 rounded-lg bg-zinc-900 px-4 text-sm font-medium text-white hover:bg-zinc-800">
                      <ShoppingBag className="h-4 w-4" /> Mulai Belanja
                    </button>
                  </td>
                </tr>
              ) : (
                recentOrders.map((order) => {
                  const statusConfig = STATUS_COLORS[order.status] || STATUS_COLORS.DIPROSES;
                  const StatusIcon = statusConfig.icon;
                  const totalQty = order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

                  return (
                    <tr key={order.id} className="hover:bg-zinc-50/50 cursor-pointer" onClick={() => window.location.href = `/pesanan/${order.orderId}`}>
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-sm font-mono font-medium text-zinc-900">{order.orderId}</p>
                          <p className="text-xs text-zinc-400">{timeAgo(order.createdAt)} • {totalQty} item</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <p className="text-sm text-zinc-600 truncate max-w-[250px]">
                          {order.items?.map((i) => i.product?.name).filter(Boolean).join(", ") || "—"}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-zinc-900">{formatPrice(order.total)}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${statusConfig.color}`}>
                          <StatusIcon className="h-3.5 w-3.5" />
                          {order.status === "DIPROSES" ? "Diproses" : order.status === "DIKIRIM" ? "Dikirim" : "Selesai"}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
