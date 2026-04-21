"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  LayoutDashboard,
  ClipboardList,
  Heart,
  MapPin,
  Settings,
  LogOut,
  ChevronDown,
  Menu,
  X,
  Users,
  Package,
  ShoppingCart,
  BarChart3,
  Search,
  Bell,
  CreditCard,
  HelpCircle,
  MessageSquare,
  Tag,
} from "lucide-react";
import { toast } from "sonner";

const userLinks = [
  {
    label: "Menu Utama",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/pesanan", label: "Pesanan Saya", icon: ShoppingCart },
      { href: "/wishlist", label: "Favorit", icon: Heart },
    ],
  },
  {
    label: "Lainnya",
    items: [
      { href: "/alamat", label: "Alamat Pengiriman", icon: MapPin },
      { href: "/promo", label: "Promo & Voucher", icon: Tag },
    ],
  },
];

const adminLinks = [
  {
    label: "Menu Utama",
    items: [
      { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/admin/pesanan", label: "Kelola Pesanan", icon: ShoppingCart },
    ],
  },
  {
    label: "Katalog",
    items: [
      { href: "/admin/produk", label: "Kelola Produk", icon: Package },
      { href: "/admin/kategori", label: "Kelola Kategori", icon: Tag },
    ],
  },
  {
    label: "Manajemen",
    items: [
      { href: "/admin/pengguna", label: "Kelola User", icon: Users },
      { href: "/admin/promo", label: "Kelola Promo", icon: CreditCard },
    ],
  },
];

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchIndex, setSearchIndex] = useState(0);

  const isAdmin = user?.role === "ADMIN";
  const sidebarSections = isAdmin ? adminLinks : userLinks;

  const allMenuItems = sidebarSections.flatMap((section) => section.items);
  const filteredMenuItems = searchQuery
    ? allMenuItems.filter((item) => item.label.toLowerCase().includes(searchQuery.toLowerCase()))
    : allMenuItems;

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (!token || !storedUser) {
      router.push("/masuk");
      return;
    }

    setUser(JSON.parse(storedUser));
  }, [router]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === "f") {
        e.preventDefault();
        setSearchOpen(true);
        setSearchQuery("");
        setSearchIndex(0);
      }
      if (e.key === "Escape") {
        setSearchOpen(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    toast.success("Berhasil keluar");
    router.push("/masuk");
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-200 border-t-zinc-900" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-zinc-50">
      {/* Sidebar - Desktop */}
      <aside className="hidden w-56 shrink-0 flex-col border-r border-zinc-200 bg-white lg:flex sticky top-0 h-screen">
        {/* Search */}
        <div className="flex h-14 items-center border-b border-zinc-200 px-3">
          <button
            onClick={() => { setSearchOpen(true); setSearchQuery(""); }}
            className="flex h-9 w-full items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-3 text-sm text-zinc-500 hover:bg-zinc-100"
          >
            <Search className="h-4 w-4" />
            <span className="flex-1 text-left">Cari...</span>
            <kbd className="hidden rounded bg-zinc-200 px-1.5 py-0.5 text-[10px] font-medium text-zinc-500 sm:inline">
              ⌘F
            </kbd>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-3">
          {sidebarSections.map((section) => (
            <div key={section.label} className="mb-4">
              <p className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                {section.label}
              </p>
              <div className="space-y-0.5">
                {section.items.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-zinc-900 text-white"
                          : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                      }`}
                    >
                      <link.icon className="h-4 w-4" />
                      {link.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Logout */}
        <div className="border-t border-zinc-200 p-3">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50"
          >
            <LogOut className="h-4 w-4" />
            Keluar
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Mobile */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-56 transform bg-white transition-transform lg:hidden ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-14 items-center justify-between border-b border-zinc-200 px-3">
          <Link href="/">
            <Image src="/22mart.png" alt="22Mart" width={100} height={32} className="h-6 w-auto" />
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="p-1">
            <X className="h-5 w-5 text-zinc-500" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3">
          {sidebarSections.map((section) => (
            <div key={section.label} className="mb-4">
              <p className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                {section.label}
              </p>
              <div className="space-y-0.5">
                {section.items.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-zinc-900 text-white"
                          : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                      }`}
                    >
                      <link.icon className="h-4 w-4" />
                      {link.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="border-t border-zinc-200 p-3">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50"
          >
            <LogOut className="h-4 w-4" />
            Keluar
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col">
        {/* Header */}
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-zinc-200 bg-white px-3 lg:px-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-md p-1.5 text-zinc-600 hover:bg-zinc-100 lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="hidden lg:block" />

          {/* User Dropdown */}
          <div className="relative ml-auto">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 rounded-md p-1.5 hover:bg-zinc-100"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-900 text-xs font-medium text-white">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="hidden text-left sm:block">
                <p className="text-xs font-medium leading-tight">{user.name}</p>
                <p className="text-[10px] text-zinc-500 leading-tight">{user.email}</p>
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-zinc-400" />
            </button>

            {dropdownOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
                <div className="absolute right-0 top-full z-50 mt-1 w-48 rounded-lg border border-zinc-200 bg-white py-1 shadow-lg">
                  <Link
                    href="/pengaturan-akun"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50"
                  >
                    <Settings className="h-4 w-4" />
                    Pengaturan Akun
                  </Link>
                  <hr className="my-1 border-zinc-100" />
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4" />
                    Keluar
                  </button>
                </div>
              </>
            )}
          </div>
        </header>

        <main className="flex-1 p-3 lg:p-4">{children}</main>
      </div>

      {/* Search Popup */}
      {searchOpen && (
        <>
          <div className="fixed inset-0 z-50 bg-black/50" onClick={() => setSearchOpen(false)} />
          <div className="fixed left-1/2 top-[20%] z-50 w-full max-w-md -translate-x-1/2 rounded-xl border border-zinc-200 bg-white shadow-2xl overflow-hidden">
            <div className="flex items-center gap-3 border-b border-zinc-100 px-4 py-3">
              <Search className="h-4 w-4 text-zinc-400 shrink-0" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setSearchIndex(0); }}
                onKeyDown={(e) => {
                  if (e.key === "ArrowDown") {
                    e.preventDefault();
                    setSearchIndex((i) => Math.min(i + 1, filteredMenuItems.length - 1));
                  } else if (e.key === "ArrowUp") {
                    e.preventDefault();
                    setSearchIndex((i) => Math.max(i - 1, 0));
                  } else if (e.key === "Enter" && filteredMenuItems[searchIndex]) {
                    e.preventDefault();
                    setSearchOpen(false);
                    router.push(filteredMenuItems[searchIndex].href);
                  }
                }}
                placeholder="Cari menu..."
                className="flex-1 text-sm outline-none placeholder:text-zinc-400"
              />
              <kbd className="rounded bg-zinc-100 px-1.5 py-0.5 text-[10px] font-medium text-zinc-500">ESC</kbd>
            </div>
            <div className="max-h-64 overflow-y-auto p-2">
              {filteredMenuItems.length === 0 ? (
                <p className="px-3 py-4 text-center text-sm text-zinc-400">Tidak ada hasil</p>
              ) : (
                filteredMenuItems.map((item, i) => (
                  <button
                    key={item.href}
                    ref={(el) => { if (i === searchIndex && el) el.scrollIntoView({ block: "nearest" }); }}
                    onClick={() => { setSearchOpen(false); router.push(item.href); }}
                    onMouseEnter={() => setSearchIndex(i)}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                      i === searchIndex ? "bg-zinc-900 text-white" : "text-zinc-600 hover:bg-zinc-100"
                    }`}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </button>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
