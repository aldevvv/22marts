"use client";

import { ShoppingBag } from "lucide-react";

export default function RiwayatPesananPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Riwayat Pesanan</h1>
        <p className="mt-1 text-zinc-500">
          Lihat semua pesanan yang pernah Anda buat.
        </p>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white">
        <div className="p-6">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <ShoppingBag className="h-12 w-12 text-zinc-300" />
            <p className="mt-4 font-medium text-zinc-900">Belum Ada Pesanan</p>
            <p className="mt-1 text-sm text-zinc-500">
              Riwayat pesanan Anda akan muncul di sini setelah Anda melakukan pembelian.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
