"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Upload,
  Loader2,
  Package,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { getCategories, createProduct, Category } from "@/lib/api";

export default function TambahProdukPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    categoryId: "",
    isActive: true,
  });
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    const result = await getCategories();
    if (result.data) {
      setCategories(result.data);
      if (result.data.length > 0) {
        setFormData((prev) => ({ ...prev, categoryId: result.data![0].id }));
      }
    }
    setLoading(false);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnailFile(file);
      setThumbnailPreview(URL.createObjectURL(file));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    const data = new FormData();
    data.append("name", formData.name);
    data.append("description", formData.description);
    data.append("price", formData.price);
    data.append("stock", formData.stock || "0");
    data.append("categoryId", formData.categoryId);
    data.append("isActive", formData.isActive.toString());

    if (thumbnailFile) {
      data.append("thumbnail", thumbnailFile);
    }

    const result = await createProduct(data);
    if (result.data) {
      toast.success("Produk berhasil ditambahkan");
      router.push("/admin/produk");
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-900">
            <Package className="h-4 w-4 text-white" />
          </div>
          <div>
            <h1 className="text-base font-semibold">Tambah Produk</h1>
            <p className="text-sm text-zinc-500 hidden sm:block">Tambahkan produk baru ke toko</p>
          </div>
        </div>
        <Button className="h-9 bg-zinc-900 text-sm" onClick={() => window.location.href = "/admin/produk"}>Kembali</Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
          <div className="rounded-lg border border-zinc-200 bg-white p-5 space-y-5">
            <h2 className="font-medium">Informasi Produk</h2>

            {/* Thumbnail */}
            <div>
              <label className="mb-2 block text-sm font-medium">Thumbnail</label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="relative flex h-40 cursor-pointer items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-zinc-200 bg-zinc-50 hover:border-zinc-300"
              >
                {thumbnailPreview ? (
                  <img src={thumbnailPreview} alt="Preview" className="h-full w-full object-contain" />
                ) : (
                  <div className="text-center">
                    <Upload className="mx-auto h-8 w-8 text-zinc-400" />
                    <p className="mt-2 text-sm text-zinc-500">Klik untuk upload gambar</p>
                    <p className="text-xs text-zinc-400">PNG, JPG hingga 5MB</p>
                  </div>
                )}
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
            </div>

            {/* Name */}
            <div>
              <label className="mb-2 block text-sm font-medium">Nama Produk</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="h-10 w-full rounded-lg border border-zinc-200 px-3 text-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                placeholder="Contoh: Apel Fuji Premium"
              />
            </div>

            {/* Description */}
            <div>
              <label className="mb-2 block text-sm font-medium">Deskripsi</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full rounded-lg border border-zinc-200 px-3 py-2.5 text-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                placeholder="Jelaskan detail produk..."
              />
            </div>
          </div>

          <div className="rounded-lg border border-zinc-200 bg-white p-5 space-y-5">
            <h2 className="font-medium">Harga & Stok</h2>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium">Harga (Rp)</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="h-10 w-full rounded-lg border border-zinc-200 px-3 text-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">Stok</label>
                <input
                  type="number"
                  min="0"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  className="h-10 w-full rounded-lg border border-zinc-200 px-3 text-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-zinc-200 bg-white p-5 space-y-5">
            <h2 className="font-medium">Kategori & Status</h2>

            <div>
              <label className="mb-2 block text-sm font-medium">Kategori</label>
              <select
                required
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                className="h-10 w-full rounded-lg border border-zinc-200 px-3 text-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
              >
                <option value="">Pilih Kategori</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-zinc-200 px-4 py-3">
              <div>
                <p className="text-sm font-medium">Produk Aktif</p>
                <p className="text-xs text-zinc-500">Produk akan ditampilkan di toko</p>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="peer sr-only"
                />
                <div className="peer h-6 w-11 rounded-full bg-zinc-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:bg-zinc-900 peer-checked:after:translate-x-full"></div>
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-3">
            <Button type="button" className="h-10 bg-zinc-900 text-sm" onClick={() => router.back()}>
              Batal
            </Button>
            <Button type="submit" className="h-10 bg-zinc-900 text-sm" disabled={submitting}>
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Simpan Produk"}
            </Button>
          </div>
        </form>
    </div>
  );
}
