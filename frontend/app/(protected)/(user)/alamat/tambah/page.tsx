"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  MapPin,
  Home,
  Building2,
  Briefcase,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { createAddress } from "@/lib/api";
import {
  getProvinces,
  getCities,
  getDistricts,
  getVillages,
  toTitleCase,
  Province,
  City,
  District,
  Village,
} from "@/lib/indonesia-regions";

const LABELS = [
  { value: "Rumah", icon: Home },
  { value: "Kantor", icon: Briefcase },
  { value: "Apartemen", icon: Building2 },
  { value: "Lainnya", icon: MapPin },
];

export default function TambahAlamatPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const [provinces, setProvinces] = useState<Province[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [villages, setVillages] = useState<Village[]>([]);
  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingVillages, setLoadingVillages] = useState(false);

  const [form, setForm] = useState({
    label: "Rumah",
    name: "",
    phone: "",
    address: "",
    provinceId: "",
    province: "",
    cityId: "",
    city: "",
    districtId: "",
    district: "",
    villageId: "",
    village: "",
    postalCode: "",
    notes: "",
    isDefault: false,
  });

  useEffect(() => {
    getProvinces().then(setProvinces);
  }, []);

  async function handleProvinceChange(provinceId: string) {
    const prov = provinces.find((p) => p.id === provinceId);
    setForm({ ...form, provinceId, province: prov ? toTitleCase(prov.name) : "", cityId: "", city: "", districtId: "", district: "", villageId: "", village: "" });
    setCities([]);
    setDistricts([]);
    setVillages([]);

    if (provinceId) {
      setLoadingCities(true);
      const data = await getCities(provinceId);
      setCities(data);
      setLoadingCities(false);
    }
  }

  async function handleCityChange(cityId: string) {
    const c = cities.find((c) => c.id === cityId);
    setForm({ ...form, cityId, city: c ? toTitleCase(c.name) : "", districtId: "", district: "", villageId: "", village: "" });
    setDistricts([]);
    setVillages([]);

    if (cityId) {
      setLoadingDistricts(true);
      const data = await getDistricts(cityId);
      setDistricts(data);
      setLoadingDistricts(false);
    }
  }

  async function handleDistrictChange(districtId: string) {
    const d = districts.find((d) => d.id === districtId);
    setForm({ ...form, districtId, district: d ? toTitleCase(d.name) : "", villageId: "", village: "" });
    setVillages([]);

    if (districtId) {
      setLoadingVillages(true);
      const data = await getVillages(districtId);
      setVillages(data);
      setLoadingVillages(false);
    }
  }

  function handleVillageChange(villageId: string) {
    const v = villages.find((v) => v.id === villageId);
    setForm({ ...form, villageId, village: v ? toTitleCase(v.name) : "" });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!form.provinceId || !form.cityId || !form.districtId || !form.villageId) {
      toast.error("Lengkapi provinsi, kota, kecamatan, dan kelurahan");
      return;
    }

    const storedUser = localStorage.getItem("user");
    if (!storedUser) return;

    setSubmitting(true);
    const user = JSON.parse(storedUser);
    const result = await createAddress({ userId: user.id, ...form });

    if (result.data) {
      toast.success("Alamat berhasil ditambahkan");
      router.push("/alamat");
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
            <MapPin className="h-4 w-4 text-white" />
          </div>
          <div>
            <h1 className="text-base font-semibold">Tambah Alamat</h1>
            <p className="text-sm text-zinc-500 hidden sm:block">Tambahkan alamat pengiriman baru</p>
          </div>
        </div>
        <Button className="h-9 bg-zinc-900 text-sm" onClick={() => window.location.href = "/alamat"}>Kembali</Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="rounded-lg border border-zinc-200 bg-white p-5 space-y-5">
          <h2 className="font-medium">Label Alamat</h2>
          <div className="flex flex-wrap gap-2">
            {LABELS.map((l) => (
              <button
                key={l.value}
                type="button"
                onClick={() => setForm({ ...form, label: l.value })}
                className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors ${
                  form.label === l.value
                    ? "border-zinc-900 bg-zinc-900 text-white"
                    : "border-zinc-200 text-zinc-600 hover:border-zinc-300"
                }`}
              >
                <l.icon className="h-4 w-4" />
                {l.value}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-zinc-200 bg-white p-5 space-y-5">
          <h2 className="font-medium">Informasi Penerima</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium">Nama Penerima</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="h-10 w-full rounded-lg border border-zinc-200 px-3 text-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                placeholder="Nama lengkap"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Nomor Telepon</label>
              <input
                type="tel"
                required
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="h-10 w-full rounded-lg border border-zinc-200 px-3 text-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                placeholder="08xxxxxxxxxx"
              />
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-zinc-200 bg-white p-5 space-y-5">
          <h2 className="font-medium">Detail Alamat</h2>

          <div>
            <label className="mb-2 block text-sm font-medium">Alamat Lengkap</label>
            <textarea
              required
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              rows={3}
              className="w-full rounded-lg border border-zinc-200 px-3 py-2.5 text-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
              placeholder="Jalan, nomor rumah, RT/RW"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium">Provinsi</label>
              <select
                required
                value={form.provinceId}
                onChange={(e) => handleProvinceChange(e.target.value)}
                className="h-10 w-full rounded-lg border border-zinc-200 px-3 text-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
              >
                <option value="">Pilih Provinsi</option>
                {provinces.map((p) => (
                  <option key={p.id} value={p.id}>{toTitleCase(p.name)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Kota / Kabupaten</label>
              <select
                required
                value={form.cityId}
                onChange={(e) => handleCityChange(e.target.value)}
                disabled={!form.provinceId || loadingCities}
                className="h-10 w-full rounded-lg border border-zinc-200 px-3 text-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 disabled:bg-zinc-50 disabled:text-zinc-400"
              >
                <option value="">{loadingCities ? "Memuat..." : "Pilih Kota"}</option>
                {cities.map((c) => (
                  <option key={c.id} value={c.id}>{toTitleCase(c.name)}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium">Kecamatan</label>
              <select
                required
                value={form.districtId}
                onChange={(e) => handleDistrictChange(e.target.value)}
                disabled={!form.cityId || loadingDistricts}
                className="h-10 w-full rounded-lg border border-zinc-200 px-3 text-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 disabled:bg-zinc-50 disabled:text-zinc-400"
              >
                <option value="">{loadingDistricts ? "Memuat..." : "Pilih Kecamatan"}</option>
                {districts.map((d) => (
                  <option key={d.id} value={d.id}>{toTitleCase(d.name)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Kelurahan</label>
              <select
                required
                value={form.villageId}
                onChange={(e) => handleVillageChange(e.target.value)}
                disabled={!form.districtId || loadingVillages}
                className="h-10 w-full rounded-lg border border-zinc-200 px-3 text-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 disabled:bg-zinc-50 disabled:text-zinc-400"
              >
                <option value="">{loadingVillages ? "Memuat..." : "Pilih Kelurahan"}</option>
                {villages.map((v) => (
                  <option key={v.id} value={v.id}>{toTitleCase(v.name)}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Kode Pos</label>
            <input
              type="text"
              required
              value={form.postalCode}
              onChange={(e) => setForm({ ...form, postalCode: e.target.value })}
              className="h-10 w-full rounded-lg border border-zinc-200 px-3 text-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
              placeholder="Kode pos"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Catatan <span className="text-zinc-400 font-normal">(opsional)</span></label>
            <input
              type="text"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="h-10 w-full rounded-lg border border-zinc-200 px-3 text-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
              placeholder="Contoh: Rumah cat putih, pagar hitam"
            />
          </div>
        </div>

        <div className="rounded-lg border border-zinc-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Jadikan Alamat Utama</p>
              <p className="text-xs text-zinc-500">Alamat ini akan digunakan sebagai default</p>
            </div>
            <label className="relative inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                checked={form.isDefault}
                onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
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
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Simpan Alamat"}
          </Button>
        </div>
      </form>
    </div>
  );
}
