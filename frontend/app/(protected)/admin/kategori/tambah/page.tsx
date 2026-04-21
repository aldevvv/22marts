"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Tag, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { createCategory } from "@/lib/api";

export default function TambahKategoriPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    icon: "",
    isActive: true,
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    const result = await createCategory({
      name: form.name,
      icon: form.icon || undefined,
      isActive: form.isActive,
    });

    if (result.data) {
      toast.success("Kategori berhasil ditambahkan");
      router.push("/admin/kategori");
    } else {
      toast.error(result.error);
    }

    setSubmitting(false);
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-900">
            <Tag className="h-4 w-4 text-white" />
          </div>
          <div>
            <h1 className="text-base font-semibold">Tambah Kategori</h1>
            <p className="text-sm text-zinc-500 hidden sm:block">Tambahkan kategori produk baru</p>
          </div>
        </div>
        <Button className="h-9 bg-zinc-900 text-sm" onClick={() => window.location.href = "/admin/kategori"}>Kembali</Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="rounded-lg border border-zinc-200 bg-white p-5 space-y-5">
          <h2 className="font-medium">Informasi Kategori</h2>

          <div>
            <label className="mb-2 block text-sm font-medium">Nama Kategori</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="h-10 w-full rounded-lg border border-zinc-200 px-3 text-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
              placeholder="Contoh: Sayur & Buah"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Icon (Emoji)</label>
            <input
              type="text"
              value={form.icon}
              onChange={(e) => setForm({ ...form, icon: e.target.value })}
              className="h-10 w-full rounded-lg border border-zinc-200 px-3 text-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
              placeholder="Contoh: 🥬"
            />
          </div>
        </div>

        <div className="rounded-lg border border-zinc-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Kategori Aktif</p>
              <p className="text-xs text-zinc-500">Kategori akan ditampilkan di toko</p>
            </div>
            <label className="relative inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                className="peer sr-only"
              />
              <div className="peer h-6 w-11 rounded-full bg-zinc-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:bg-zinc-900 peer-checked:after:translate-x-full"></div>
            </label>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button type="button" className="h-10 bg-zinc-900 text-sm" onClick={() => router.back()}>
            Batal
          </Button>
          <Button type="submit" className="h-10 bg-zinc-900 text-sm" disabled={submitting}>
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Simpan Kategori"}
          </Button>
        </div>
      </form>
    </div>
  );
}
