"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ShoppingCart,
  Users,
  Package,
  TrendingUp,
  ArrowUpRight,
  ChevronRight,
  Clock,
  CheckCircle,
  Truck,
  DollarSign,
  ImageIcon,
  BarChart3,
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
  getProducts,
  getUsers,
  Order,
  Product,
} from "@/lib/api";

interface UserData {
  name: string;
}

const STATUS_COLORS: Record<string, { icon: React.ElementType; color: string }> = {
  DIPROSES: { icon: Clock, color: "text-amber-600 bg-amber-50" },
  DIKIRIM: { icon: Truck, color: "text-blue-600 bg-blue-50" },
  SELESAI: { icon: CheckCircle, color: "text-green-600 bg-green-50" },
};

const PIE_COLORS = ["#f59e0b", "#3b82f6", "#22c55e"];

export default function AdminDashboardPage() {
  const [user, setUser] = useState<UserData | null>(null);
  const [mounted, setMounted] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState<{ id: string; name: string; email: string; role: string; createdAt: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState("overall");

  useEffect(() => {
    setMounted(true);
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    const [ordersRes, productsRes, usersRes] = await Promise.all([
      getOrders(),
      getProducts(),
      getUsers(),
    ]);
    if (ordersRes.data) setOrders(ordersRes.data);
    if (productsRes.data) setProducts(productsRes.data);
    if (usersRes.data) setUsers(usersRes.data);
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
  const rangedUsers = filterByRange(users);

  // Stats
  const totalRevenue = rangedOrders.reduce((sum, o) => sum + o.total, 0);
  const countByStatus = {
    DIPROSES: rangedOrders.filter((o) => o.status === "DIPROSES").length,
    DIKIRIM: rangedOrders.filter((o) => o.status === "DIKIRIM").length,
    SELESAI: rangedOrders.filter((o) => o.status === "SELESAI").length,
  };

  // Chart days based on date range
  const chartDays = dateRange === "today" ? 1 : dateRange === "7days" ? 7 : dateRange === "14days" ? 14 : dateRange === "30days" ? 30 : 7;
  const chartRange = Array.from({ length: Math.min(chartDays, 14) }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (Math.min(chartDays, 14) - 1 - i));
    return d;
  });

  const revenueByDay = chartRange.map((date) => ({
    day: date.toLocaleDateString("id-ID", { day: "numeric", month: "short" }),
    pendapatan: rangedOrders
      .filter((o) => new Date(o.createdAt).toDateString() === date.toDateString())
      .reduce((sum, o) => sum + o.total, 0),
    pesanan: rangedOrders.filter((o) => new Date(o.createdAt).toDateString() === date.toDateString()).length,
  }));

  // Orders by day bar chart
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d;
  });

  const ordersByDay = last7Days.map((date) => ({
    day: date.toLocaleDateString("id-ID", { weekday: "short" }),
    pesanan: rangedOrders.filter((o) => new Date(o.createdAt).toDateString() === date.toDateString()).length,
  }));

  // Pie data
  const pieData = [
    { name: "Diproses", value: countByStatus.DIPROSES },
    { name: "Dikirim", value: countByStatus.DIKIRIM },
    { name: "Selesai", value: countByStatus.SELESAI },
  ].filter((d) => d.value > 0);

  // Recent orders - latest 5
  const recentOrders = rangedOrders.slice(0, 5);

  // Top products by order frequency
  const productSales: Record<string, { name: string; thumbnail: string | null; sold: number; revenue: number }> = {};
  rangedOrders.forEach((order) => {
    order.items?.forEach((item) => {
      if (!productSales[item.productId]) {
        productSales[item.productId] = { name: item.product?.name || "—", thumbnail: item.product?.thumbnail || null, sold: 0, revenue: 0 };
      }
      productSales[item.productId].sold += item.quantity;
      productSales[item.productId].revenue += item.price * item.quantity;
    });
  });
  const topProducts = Object.values(productSales).sort((a, b) => b.sold - a.sold).slice(0, 4);

  // Calculate period-over-period changes
  const now = new Date();
  const rangeDays = dateRange === "today" ? 1 : dateRange === "7days" ? 7 : dateRange === "14days" ? 14 : dateRange === "30days" ? 30 : 7;

  const prevOrders = orders.filter((o) => {
    const diff = now.getTime() - new Date(o.createdAt).getTime();
    return diff >= rangeDays * 86400000 && diff < rangeDays * 2 * 86400000;
  });
  const prevRevenue = prevOrders.reduce((sum, o) => sum + o.total, 0);

  const prevUsers = users.filter((u) => {
    const diff = now.getTime() - new Date(u.createdAt).getTime();
    return diff >= rangeDays * 86400000 && diff < rangeDays * 2 * 86400000;
  });

  function calcChange(current: number, previous: number) {
    if (previous === 0) return current > 0 ? "+100%" : "0%";
    const pct = Math.round(((current - previous) / previous) * 100);
    return pct >= 0 ? `+${pct}%` : `${pct}%`;
  }

  const revenueChange = calcChange(totalRevenue, prevRevenue);
  const orderChange = calcChange(rangedOrders.length, prevOrders.length);
  const userChange = calcChange(rangedUsers.length, prevUsers.length);

  const stats = [
    { label: "Total Pendapatan", value: formatCompact(totalRevenue), change: revenueChange, trend: revenueChange.startsWith("+") ? "up" : "down", icon: DollarSign, iconColor: "text-green-600", iconBg: "bg-green-50" },
    { label: "Total Pesanan", value: rangedOrders.length.toString(), change: orderChange, trend: orderChange.startsWith("+") ? "up" : "down", icon: ShoppingCart, iconColor: "text-blue-600", iconBg: "bg-blue-50" },
    { label: "Total Produk", value: products.length.toString(), change: `${products.filter((p) => p.isActive).length} aktif`, trend: "up", icon: Package, iconColor: "text-purple-600", iconBg: "bg-purple-50" },
    { label: "Total Pengguna", value: rangedUsers.length.toString(), change: userChange, trend: userChange.startsWith("+") ? "up" : "down", icon: Users, iconColor: "text-amber-600", iconBg: "bg-amber-50" },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-900">
            <TrendingUp className="h-4 w-4 text-white" />
          </div>
          <div>
            <h1 className="text-base font-semibold">Dashboard Admin</h1>
            <p className="text-sm text-zinc-500 hidden sm:block">Selamat datang, {user?.name?.split(" ")[0] || "Admin"}!</p>
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
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="flex items-center gap-3 rounded-lg border border-zinc-200 bg-white p-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${stat.iconBg}`}>
              <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
            </div>
            <div className="flex-1">
              <p className="text-xs text-zinc-500">{stat.label}</p>
              <div className="flex items-baseline gap-2">
                <p className="text-lg font-semibold">{stat.value}</p>
                <span className={`flex items-center text-xs font-medium ${stat.trend === "up" ? "text-green-600" : "text-red-600"}`}>
                  <ArrowUpRight className={`h-3 w-3 ${stat.trend === "down" ? "rotate-90" : ""}`} />
                  {stat.change}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid gap-3 lg:grid-cols-3">
        {/* Revenue Chart */}
        <div className="rounded-lg border border-zinc-200 bg-white p-3 sm:p-4 lg:col-span-2">
          <div className="mb-3 sm:mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-sm font-semibold flex items-center gap-2"><DollarSign className="h-4 w-4 text-zinc-400" />Pendapatan & Pesanan</h2>
              <p className="text-xs text-zinc-500">
                {dateRange === "today" ? "Hari ini" : dateRange === "7days" ? "7 hari terakhir" : dateRange === "14days" ? "14 hari terakhir" : dateRange === "30days" ? "30 hari terakhir" : "Semua waktu"}
              </p>
            </div>
            <div className="sm:text-right">
              <p className="text-lg font-semibold">{formatCompact(totalRevenue)}</p>
              <p className="text-xs text-zinc-500">{rangedOrders.length} pesanan</p>
            </div>
          </div>
          <div className="h-52">
            {mounted && (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueByDay}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#71717a" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#71717a" }} axisLine={false} tickLine={false} tickFormatter={(v) => formatCompact(v)} />
                  <Tooltip
                    contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e4e4e7" }}
                    formatter={(value: number, name: string) => [name === "pendapatan" ? formatPrice(value) : value, name === "pendapatan" ? "Pendapatan" : "Pesanan"]}
                  />
                  <Area type="monotone" dataKey="pendapatan" stroke="#22c55e" fill="#22c55e" fillOpacity={0.1} strokeWidth={2} />
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

      {/* Orders by Day & Recent */}
      <div className="grid gap-3 lg:grid-cols-5">
        {/* Orders by Day */}
        <div className="rounded-lg border border-zinc-200 bg-white p-3 sm:p-4 lg:col-span-2">
          <div className="mb-3 sm:mb-4">
            <h2 className="text-sm font-semibold flex items-center gap-2"><BarChart3 className="h-4 w-4 text-zinc-400" />Pesanan per Hari</h2>
            <p className="text-xs text-zinc-500">7 hari terakhir</p>
          </div>
          <div className="h-40">
            {mounted && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ordersByDay}>
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#71717a" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#71717a" }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e4e4e7" }} />
                  <Bar dataKey="pesanan" fill="#18181b" radius={[4, 4, 0, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="rounded-lg border border-zinc-200 bg-white lg:col-span-3 overflow-hidden">
          <div className="flex items-center justify-between border-b border-zinc-100 bg-zinc-50/80 px-4 py-3">
            <h2 className="text-sm font-semibold flex items-center gap-2"><ShoppingCart className="h-4 w-4 text-zinc-400" />Pesanan Terbaru</h2>
            <button onClick={() => window.location.href = "/admin/pesanan"} className="flex items-center text-xs font-medium text-zinc-500 hover:text-zinc-900">
              Lihat Semua <ChevronRight className="h-3 w-3" />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-100 bg-zinc-50/80">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">No. Pesanan</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 hidden sm:table-cell">Pelanggan</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Total</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-12 text-center">
                      <ShoppingCart className="mx-auto h-10 w-10 text-zinc-300" />
                      <p className="mt-3 text-sm font-medium text-zinc-900">Belum Ada Pesanan</p>
                      <p className="mt-1 text-sm text-zinc-500">Pesanan dari pelanggan akan muncul di sini</p>
                      <button onClick={() => window.location.href = "/admin/pesanan"} className="mt-4 inline-flex h-9 items-center gap-2 rounded-lg bg-zinc-900 px-4 text-sm font-medium text-white hover:bg-zinc-800">
                        <ShoppingCart className="h-4 w-4" /> Kelola Pesanan
                      </button>
                    </td>
                  </tr>
                ) : (
                  recentOrders.map((order) => {
                    const statusConfig = STATUS_COLORS[order.status] || STATUS_COLORS.DIPROSES;
                    const StatusIcon = statusConfig.icon;
                    return (
                      <tr key={order.id} className="hover:bg-zinc-50/50 cursor-pointer" onClick={() => window.location.href = `/admin/pesanan/${order.orderId}`}>
                        <td className="px-4 py-3">
                          <div>
                            <p className="text-sm font-mono font-medium text-zinc-900">{order.orderId}</p>
                            <p className="text-xs text-zinc-400">{timeAgo(order.createdAt)}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3 hidden sm:table-cell">
                          <p className="text-sm font-medium text-zinc-900">{order.user?.name || "—"}</p>
                          <p className="text-xs text-zinc-500">{order.user?.email || "—"}</p>
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

      {/* Top Products */}
      <div className="rounded-lg border border-zinc-200 bg-white">
        <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3">
          <h2 className="text-sm font-semibold flex items-center gap-2"><TrendingUp className="h-4 w-4 text-zinc-400" />Produk Terlaris</h2>
          <button onClick={() => window.location.href = "/admin/produk"} className="flex items-center text-xs font-medium text-zinc-500 hover:text-zinc-900">
            Lihat Semua <ChevronRight className="h-3 w-3" />
          </button>
        </div>
        <div className="grid gap-3 p-3 sm:p-4 sm:grid-cols-2 lg:grid-cols-4">
          {topProducts.length === 0 ? (
            <p className="col-span-4 py-4 text-center text-sm text-zinc-400">Belum ada data</p>
          ) : (
            topProducts.map((product, i) => (
              <div key={product.name} className="flex items-center gap-3 rounded-lg border border-zinc-100 p-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-100 overflow-hidden">
                  {product.thumbnail ? (
                    <img src={product.thumbnail} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-sm font-bold text-zinc-600">#{i + 1}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{product.name}</p>
                  <p className="text-xs text-zinc-500">{product.sold} terjual • {formatCompact(product.revenue)}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
