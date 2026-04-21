"use client";

import { useState, useEffect } from "react";
import {
  Settings,
  Loader2,
  Eye,
  EyeOff,
  User,
  Lock,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { updateProfile, changePassword } from "@/lib/api";

interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt?: string;
}

export default function PengaturanAkunPage() {
  const [user, setUser] = useState<UserData | null>(null);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const u = JSON.parse(storedUser);
      setUser(u);
      setName(u.name);
    }
  }, []);

  function formatDate(dateString: string) {
    const d = new Date(dateString);
    const date = d.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
    const time = d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", hour12: false });
    return `${date} at ${time}`;
  }

  async function handleSave() {
    if (!user || !name.trim()) return;

    setSaving(true);

    const profileResult = await updateProfile(user.id, name.trim());
    if (profileResult.data) {
      const updated = profileResult.data.user;
      setUser(updated);
      localStorage.setItem("user", JSON.stringify(updated));
    } else {
      toast.error(profileResult.error);
      setSaving(false);
      return;
    }

    if (oldPassword && newPassword) {
      if (newPassword.length < 6) {
        toast.error("Password baru minimal 6 karakter");
        setSaving(false);
        return;
      }
      if (newPassword !== confirmPassword) {
        toast.error("Konfirmasi password tidak cocok");
        setSaving(false);
        return;
      }

      const pwResult = await changePassword(user.id, oldPassword, newPassword);
      if (pwResult.data) {
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        toast.error(pwResult.error);
        setSaving(false);
        return;
      }
    }

    toast.success("Perubahan berhasil disimpan");
    setSaving(false);
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-900">
          <Settings className="h-4 w-4 text-white" />
        </div>
        <div>
          <h1 className="text-base font-semibold">Pengaturan Akun</h1>
          <p className="text-sm text-zinc-500 hidden sm:block">Kelola profil dan keamanan akun Anda</p>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Left - Profile */}
        <div className="rounded-lg border border-zinc-200 bg-white overflow-hidden">
          <div className="border-b border-zinc-100 bg-zinc-50/80 px-4 py-3 flex items-center gap-2">
            <User className="h-4 w-4 text-zinc-500" />
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Informasi Profil</span>
          </div>
          <div className="p-5 space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium">Nama Lengkap</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-10 w-full rounded-lg border border-zinc-200 px-3 text-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Email</label>
              <input
                type="email"
                value={user?.email || ""}
                disabled
                className="h-10 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 text-sm text-zinc-500"
              />

            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Bergabung Sejak</label>
              <input
                type="text"
                value={user?.createdAt ? formatDate(user.createdAt) : "—"}
                disabled
                className="h-10 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 text-sm text-zinc-500"
              />
            </div>
            <Button className="h-9 w-full bg-zinc-900 text-sm" onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Simpan Profil"}
            </Button>
          </div>
        </div>

        {/* Right - Password */}
        <div className="rounded-lg border border-zinc-200 bg-white overflow-hidden">
          <div className="border-b border-zinc-100 bg-zinc-50/80 px-4 py-3 flex items-center gap-2">
            <Lock className="h-4 w-4 text-zinc-500" />
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Ubah Password</span>
          </div>
          <div className="p-5 space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium">Password Lama</label>
              <div className="relative">
                <input
                  type={showOld ? "text" : "password"}
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="h-10 w-full rounded-lg border border-zinc-200 px-3 pr-10 text-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                  placeholder="Masukkan password lama"
                />
                <button type="button" onClick={() => setShowOld(!showOld)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600">
                  {showOld ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Password Baru</label>
              <div className="relative">
                <input
                  type={showNew ? "text" : "password"}
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="h-10 w-full rounded-lg border border-zinc-200 px-3 pr-10 text-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                  placeholder="Minimal 6 karakter"
                />
                <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600">
                  {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Konfirmasi Password Baru</label>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="h-10 w-full rounded-lg border border-zinc-200 px-3 pr-10 text-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                  placeholder="Ulangi password baru"
                />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600">
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <Button className="h-9 w-full bg-zinc-900 text-sm" onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Ubah Password"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
