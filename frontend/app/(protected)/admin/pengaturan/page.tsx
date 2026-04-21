"use client";

import { Store, Bell, Shield, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PengaturanAdminPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-semibold">Pengaturan</h1>
        <p className="text-sm text-zinc-500">Kelola pengaturan toko</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-zinc-200 bg-white p-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
              <Store className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h2 className="font-semibold">Informasi Toko</h2>
              <p className="text-xs text-zinc-500">Nama, alamat, kontak</p>
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-zinc-700">Nama Toko</label>
              <input type="text" defaultValue="22Mart" className="mt-1 h-9 w-full rounded-md border border-zinc-200 px-3 text-sm" />
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-700">Email</label>
              <input type="email" defaultValue="halo@22mart.id" className="mt-1 h-9 w-full rounded-md border border-zinc-200 px-3 text-sm" />
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-700">Telepon</label>
              <input type="tel" defaultValue="0812-3456-7890" className="mt-1 h-9 w-full rounded-md border border-zinc-200 px-3 text-sm" />
            </div>
          </div>
          <Button size="sm" className="mt-4 h-8 bg-zinc-900 text-xs">Simpan</Button>
        </div>

        <div className="rounded-lg border border-zinc-200 bg-white p-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100">
              <Bell className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <h2 className="font-semibold">Notifikasi</h2>
              <p className="text-xs text-zinc-500">Atur preferensi notifikasi</p>
            </div>
          </div>
          <div className="space-y-3">
            <label className="flex items-center justify-between">
              <span className="text-sm">Pesanan baru</span>
              <input type="checkbox" defaultChecked className="h-4 w-4 rounded" />
            </label>
            <label className="flex items-center justify-between">
              <span className="text-sm">Stok menipis</span>
              <input type="checkbox" defaultChecked className="h-4 w-4 rounded" />
            </label>
            <label className="flex items-center justify-between">
              <span className="text-sm">Ulasan baru</span>
              <input type="checkbox" className="h-4 w-4 rounded" />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
