"use client";

import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users, Package } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const monthlyData = [
  { month: "Jan", revenue: 85, orders: 320 },
  { month: "Feb", revenue: 92, orders: 380 },
  { month: "Mar", revenue: 78, orders: 290 },
  { month: "Apr", revenue: 105, orders: 420 },
  { month: "Mei", revenue: 112, orders: 480 },
  { month: "Jun", revenue: 98, orders: 390 },
];

const stats = [
  { label: "Pendapatan Bulan Ini", value: "Rp 98.5M", change: "+12%", trend: "up", icon: DollarSign },
  { label: "Total Pesanan", value: "390", change: "+8%", trend: "up", icon: ShoppingCart },
  { label: "Pengguna Baru", value: "156", change: "+24%", trend: "up", icon: Users },
  { label: "Produk Terjual", value: "1,234", change: "-5%", trend: "down", icon: Package },
];

export default function LaporanPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">Laporan & Statistik</h1>
          <p className="text-sm text-zinc-500">Ringkasan performa bisnis</p>
        </div>
        <select className="h-8 rounded-md border border-zinc-200 bg-white px-2 text-xs">
          <option>Bulan Ini</option>
          <option>3 Bulan Terakhir</option>
          <option>6 Bulan Terakhir</option>
          <option>Tahun Ini</option>
        </select>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-lg border border-zinc-200 bg-white p-4">
            <div className="flex items-center justify-between">
              <stat.icon className="h-5 w-5 text-zinc-400" />
              <span className={`flex items-center text-xs font-medium ${stat.trend === "up" ? "text-green-600" : "text-red-600"}`}>
                {stat.trend === "up" ? <TrendingUp className="mr-1 h-3 w-3" /> : <TrendingDown className="mr-1 h-3 w-3" />}
                {stat.change}
              </span>
            </div>
            <p className="mt-2 text-2xl font-bold">{stat.value}</p>
            <p className="text-xs text-zinc-500">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-zinc-200 bg-white p-4">
        <h2 className="mb-4 text-sm font-semibold">Tren Pendapatan & Pesanan</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#71717a" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#71717a" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e4e4e7" }} />
              <Line type="monotone" dataKey="revenue" stroke="#22c55e" strokeWidth={2} dot={{ r: 3 }} name="Pendapatan (Juta)" />
              <Line type="monotone" dataKey="orders" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} name="Pesanan" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
