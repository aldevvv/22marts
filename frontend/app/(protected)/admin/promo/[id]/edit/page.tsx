"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Tag, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { getPromos, updatePromo } from "@/lib/api";

export default function EditPromoPage() {
  const router = useRouter();
  const params = useParams();
  const promoId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    code: "",
    description: "",
    discountType: "PERCENTAGE" as "PERCENTAGE" | "FIXED",
    discountValue: "",
    minPurchase: "",
    maxDiscount: "",
    usageLimit: "",
    perUserLimit: "",
    startDate: "",
    endDate: "",
    isActive: true,
  });

  useEffect(() => {
    loadPromo();
  }, [promoId]);

  async function loadPromo() {
    setLoading(true);
    const result = await getPromos();
    if (result.data) {
      const promo = result.data.find((p) => p.id === promoId);
      if (promo) {
        setForm({
          code: promo.code,
          description: promo.description || "",
          discountType: promo.discountType,
          discountValue: promo.discountValue.toString(),
          minPurchase: promo.minPurchase > 0 ? promo.minPurchase.toString() : "",
          maxDiscount: promo.maxDiscount ? promo.maxDiscount.toString() : "",
          usageLimit: promo.usageLimit ? promo.usageLimit.toString() : "",
          perUserLimit: promo.perUserLimit > 0 ? promo.perUserLimit.toString() : "",
          startDate: promo.startDate.split("T")[0],
          endDate: promo.endDate.split("T")[0],
          isActive: promo.isActive,
        });
      } else {
        toast.error("Promo tidak ditemukan");
        router.push("/admin/promo");
      }
    }
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    const result = await updatePromo(promoId, {
      code: form.code,
      description: form.description || undefined,
      discountType: form.discountType,
      discountValue: parseInt(form.discountValue),
      minPurchase: form.minPurchase ? parseInt(form.minPurchase) : 0,
      maxDiscount: form.maxDiscount ? parseInt(form.maxDiscount) : undefined,
      usageLimit: form.usageLimit ? parseInt(form.usageLimit) : undefined,
      perUserLimit: form.perUserLimit ? parseInt(form.perUserLimit) : 0,
      startDate: form.startDate,
      endDate: form.endDate,
      isActive: form.isActive,
    } as any);

    if (result.data) {
      toast.success("Promo berhasil diupdate");
      router.push("/admin/promo");
    } else {
      toast.error(result.error);
    }
    setSubmitting(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-900">
            <Tag className="h-4 w-4 text-white" />
          </div>
          <div>
            <h1 className="text-base font-semibold">Edit Promo</h1>
            <p className="text-sm text-zinc-500 hidden sm:block">Perbarui informasi promo</p>
          </div>
        </div>
        <Button className="h-9 bg-zinc-900 text-sm" onClick={() => window.location.href = "/admin/promo"}>Kembali</Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="rounded-lg border border-zinc-200 bg-white p-5 space-y-5">
          <h2 className="font-medium">Informasi Promo</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium">Kode Promo</label>
              <input
                type="text"
                required
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                className="h-10 w-full rounded-lg border border-zinc-200 px-3 text-sm font-mono uppercase focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Deskripsi <span className="text-zinc-400 font-normal">(opsional)</span></label>
              <input
                type="text"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="h-10 w-full rounded-lg border border-zinc-200 px-3 text-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
              />
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-zinc-200 bg-white p-5 space-y-5">
          <h2 className="font-medium">Pengaturan Diskon</h2>
          <div>
            <label className="mb-2 block text-sm font-medium">Tipe Diskon</label>
            <div className="flex gap-2">
              {[
                { value: "PERCENTAGE", label: "Persentase (%)" },
                { value: "FIXED", label: "Nominal Tetap (Rp)" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setForm({ ...form, discountType: opt.value as any })}
                  className={`flex-1 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${
                    form.discountType === opt.value
                      ? "border-zinc-900 bg-zinc-900 text-white"
                      : "border-zinc-200 text-zinc-600 hover:border-zinc-300"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm font-medium">
                {form.discountType === "PERCENTAGE" ? "Nilai Diskon (%)" : "Nilai Diskon (Rp)"}
              </label>
              <input
                type="number"
                required
                min="1"
                max={form.discountType === "PERCENTAGE" ? 100 : undefined}
                value={form.discountValue}
                onChange={(e) => setForm({ ...form, discountValue: e.target.value })}
                className="h-10 w-full rounded-lg border border-zinc-200 px-3 text-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Min. Pembelian (Rp)</label>
              <input
                type="number"
                min="0"
                value={form.minPurchase}
                onChange={(e) => setForm({ ...form, minPurchase: e.target.value })}
                className="h-10 w-full rounded-lg border border-zinc-200 px-3 text-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Maks. Diskon (Rp)</label>
              <input
                type="number"
                min="0"
                value={form.maxDiscount}
                onChange={(e) => setForm({ ...form, maxDiscount: e.target.value })}
                className="h-10 w-full rounded-lg border border-zinc-200 px-3 text-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                disabled={form.discountType === "FIXED"}
              />
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-zinc-200 bg-white p-5 space-y-5">
          <h2 className="font-medium">Periode & Batas</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium">Tanggal Mulai</label>
              <input type="date" required value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                className="h-10 w-full rounded-lg border border-zinc-200 px-3 text-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Tanggal Berakhir</label>
              <input type="date" required value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                className="h-10 w-full rounded-lg border border-zinc-200 px-3 text-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900" />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium">Batas Penggunaan Total</label>
              <input type="number" min="1" value={form.usageLimit} onChange={(e) => setForm({ ...form, usageLimit: e.target.value })}
                className="h-10 w-full rounded-lg border border-zinc-200 px-3 text-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900" placeholder="Kosong = unlimited" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Batas Per User</label>
              <input type="number" min="0" value={form.perUserLimit} onChange={(e) => setForm({ ...form, perUserLimit: e.target.value })}
                className="h-10 w-full rounded-lg border border-zinc-200 px-3 text-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900" placeholder="0 = unlimited" />
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-zinc-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Promo Aktif</p>
              <p className="text-xs text-zinc-500">Promo dapat langsung digunakan</p>
            </div>
            <label className="relative inline-flex cursor-pointer items-center">
              <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="peer sr-only" />
              <div className="peer h-6 w-11 rounded-full bg-zinc-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:bg-zinc-900 peer-checked:after:translate-x-full"></div>
            </label>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button type="button" className="h-10 bg-zinc-900 text-sm" onClick={() => router.back()}>Batal</Button>
          <Button type="submit" className="h-10 bg-zinc-900 text-sm" disabled={submitting}>
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Simpan Perubahan"}
          </Button>
        </div>
      </form>
    </div>
  );
}
