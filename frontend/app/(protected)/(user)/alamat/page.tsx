"use client";

import { useState, useEffect } from "react";
import {
  MapPin,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Search,
  Home,
  Building2,
  Briefcase,
  Check,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  getAddresses,
  deleteAddress,
  setDefaultAddress,
  Address,
} from "@/lib/api";

const ITEMS_PER_PAGE = 10;

const LABEL_ICONS: Record<string, React.ElementType> = {
  Rumah: Home,
  Kantor: Briefcase,
  Apartemen: Building2,
};

export default function AlamatPengirimanPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadAddresses();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  function getUserId() {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) return null;
    return JSON.parse(storedUser).id;
  }

  async function loadAddresses() {
    const userId = getUserId();
    if (!userId) return;

    setLoading(true);
    const result = await getAddresses(userId);
    if (result.data) setAddresses(result.data);
    setLoading(false);
  }

  async function handleDelete() {
    if (!deleteId) return;
    const userId = getUserId();
    if (!userId) return;

    setDeleting(true);
    const result = await deleteAddress(deleteId, userId);
    if (!result.error) {
      toast.success("Alamat berhasil dihapus");
      loadAddresses();
      setDeleteId(null);
    } else {
      toast.error(result.error);
    }
    setDeleting(false);
  }

  async function handleSetDefault(id: string) {
    const userId = getUserId();
    if (!userId) return;

    const result = await setDefaultAddress(id, userId);
    if (result.data) {
      toast.success("Alamat utama berhasil diubah");
      loadAddresses();
    } else {
      toast.error(result.error);
    }
  }

  const filteredAddresses = addresses.filter(
    (addr) =>
      addr.label.toLowerCase().includes(search.toLowerCase()) ||
      addr.name.toLowerCase().includes(search.toLowerCase()) ||
      addr.address.toLowerCase().includes(search.toLowerCase()) ||
      addr.city.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filteredAddresses.length / ITEMS_PER_PAGE));
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedAddresses = filteredAddresses.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-900">
            <MapPin className="h-4 w-4 text-white" />
          </div>
          <div>
            <h1 className="text-base font-semibold">Alamat Pengiriman</h1>
            <p className="text-sm text-zinc-500 hidden sm:block">Kelola alamat pengiriman Anda</p>
          </div>
        </div>
        <Button className="h-9 w-full sm:w-auto gap-2 bg-zinc-900 text-sm font-medium" onClick={() => window.location.href = "/alamat/tambah"}>
          <Plus className="h-4 w-4" /> Tambah Alamat
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
        <input
          type="text"
          placeholder="Cari alamat..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-9 w-full rounded-lg border border-zinc-200 bg-white pl-9 pr-3 text-sm placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
        />
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
        </div>
      ) : (
        <div className="rounded-lg border border-zinc-200 bg-white">
          {paginatedAddresses.length === 0 ? (
            <div className="px-4 py-12 text-center">
              <MapPin className="mx-auto h-10 w-10 text-zinc-300" />
              <p className="mt-3 text-sm font-medium text-zinc-900">
                {search ? "Alamat tidak ditemukan" : "Belum Ada Alamat"}
              </p>
              <p className="mt-1 text-sm text-zinc-500">
                {search ? "Coba kata kunci lain" : "Tambahkan alamat pengiriman pertama Anda"}
              </p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-zinc-100 bg-zinc-50/80">
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Label</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Penerima</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Alamat</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Status</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-zinc-500">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {paginatedAddresses.map((addr) => {
                      const LabelIcon = LABEL_ICONS[addr.label] || MapPin;
                      return (
                        <tr key={addr.id} className="hover:bg-zinc-50/50">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${addr.isDefault ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-500"}`}>
                                <LabelIcon className="h-4 w-4" />
                              </div>
                              <span className="text-sm font-medium text-zinc-900">{addr.label}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <p className="text-sm font-medium text-zinc-900">{addr.name}</p>
                            <p className="text-xs text-zinc-500">{addr.phone}</p>
                          </td>
                          <td className="px-4 py-3">
                            <p className="text-sm text-zinc-600 max-w-xs truncate">{addr.address}, {addr.village}, {addr.district}</p>
                            <p className="text-xs text-zinc-400">{addr.city}, {addr.province}, {addr.postalCode}</p>
                          </td>
                          <td className="px-4 py-3">
                            {addr.isDefault ? (
                              <span className="rounded-full bg-zinc-900 px-2.5 py-1 text-xs font-medium text-white">Utama</span>
                            ) : (
                              <button onClick={() => handleSetDefault(addr.id)} className="rounded-full border border-zinc-200 px-2.5 py-1 text-xs font-medium text-zinc-500 hover:border-zinc-900 hover:text-zinc-900 transition-colors">
                                Jadikan Utama
                              </button>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex justify-end gap-1">
                              <button onClick={() => window.location.href = `/alamat/${addr.id}/edit`} className="rounded-md p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600" title="Edit">
                                <Pencil className="h-4 w-4" />
                              </button>
                              <button onClick={() => setDeleteId(addr.id)} className="rounded-md p-1.5 text-zinc-400 hover:bg-red-50 hover:text-red-600" title="Hapus">
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="sm:hidden divide-y divide-zinc-100">
                {paginatedAddresses.map((addr) => {
                  const LabelIcon = LABEL_ICONS[addr.label] || MapPin;
                  return (
                    <div key={addr.id} className="p-4 space-y-2">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${addr.isDefault ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-500"}`}>
                          <LabelIcon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-zinc-900">{addr.label}</span>
                            {addr.isDefault && (
                              <span className="rounded-full bg-zinc-900 px-2 py-0.5 text-[10px] font-medium text-white">Utama</span>
                            )}
                          </div>
                          <p className="text-xs text-zinc-500">{addr.name} • {addr.phone}</p>
                        </div>
                      </div>
                      <p className="text-sm text-zinc-600 line-clamp-2">{addr.address}, {addr.village}, {addr.district}, {addr.city}, {addr.province}</p>
                      <div className="flex items-center justify-between">
                        {!addr.isDefault ? (
                          <button onClick={() => handleSetDefault(addr.id)} className="text-xs font-medium text-zinc-500 hover:text-zinc-900">Jadikan Utama</button>
                        ) : <span />}
                        <div className="flex items-center gap-1">
                          <button onClick={() => window.location.href = `/alamat/${addr.id}/edit`} className="rounded-md p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600">
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button onClick={() => setDeleteId(addr.id)} className="rounded-md p-1.5 text-zinc-400 hover:bg-red-50 hover:text-red-600">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
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
              {filteredAddresses.length === 0
                ? "0 alamat"
                : `${startIndex + 1}-${Math.min(startIndex + ITEMS_PER_PAGE, filteredAddresses.length)} dari ${filteredAddresses.length} alamat`}
            </p>
            <div className="flex items-center gap-1">
              <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 text-zinc-600 hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed">
                <ChevronLeft className="h-4 w-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button key={page} onClick={() => setCurrentPage(page)} className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-medium ${currentPage === page ? "bg-zinc-900 text-white" : "border border-zinc-200 text-zinc-600 hover:bg-zinc-50"}`}>
                  {page}
                </button>
              ))}
              <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 text-zinc-600 hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <Trash2 className="h-6 w-6 text-red-600" />
            </div>
            <h2 className="mt-4 text-base font-semibold">Hapus Alamat?</h2>
            <p className="mt-2 text-sm text-zinc-500">Alamat yang dihapus tidak dapat dikembalikan.</p>
            <div className="mt-5 flex gap-3">
              <Button variant="outline" className="flex-1 h-10 text-sm" onClick={() => setDeleteId(null)}>Batal</Button>
              <Button className="flex-1 h-10 bg-red-600 hover:bg-red-700 text-sm" onClick={handleDelete} disabled={deleting}>
                {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Hapus"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
