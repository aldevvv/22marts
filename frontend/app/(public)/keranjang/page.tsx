"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ShoppingCart,
  Minus,
  Plus,
  Trash2,
  ImageIcon,
  Loader2,
  ChevronRight,
  Home,
  Star,
  Phone,
  Mail,
  ShoppingBag,
  ArrowRight,
  Search,
  Truck,
  ShieldCheck,
  Clock,
  Package,
} from "lucide-react";
import { toast } from "sonner";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart-context";
import {
  getCart,
  getProducts,
  updateCartItem,
  removeCartItem,
  clearCart as clearCartApi,
  Cart,
  Product,
} from "@/lib/api";

export default function KeranjangPage() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const { refreshCount } = useCart();

  useEffect(() => {
    loadCart();
  }, []);

  async function loadCart() {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const user = JSON.parse(storedUser);
    const [cartRes, productsRes] = await Promise.all([
      getCart(user.id),
      getProducts(),
    ]);

    if (cartRes.data) setCart(cartRes.data);
    if (productsRes.data) {
      const cartIds = cartRes.data?.items.map((i) => i.productId) || [];
      setRecommendations(
        productsRes.data
          .filter((p) => p.isActive && !cartIds.includes(p.id))
          .slice(0, 4)
      );
    }

    setLoading(false);
  }

  async function handleUpdateQty(itemId: string, quantity: number) {
    const storedUser = localStorage.getItem("user");
    if (!storedUser || !cart) return;

    if (quantity <= 0) {
      await handleRemove(itemId);
      return;
    }

    // Optimistic update
    setCart({
      ...cart,
      items: cart.items.map((item) =>
        item.id === itemId ? { ...item, quantity } : item
      ),
      total: cart.items.reduce(
        (sum, item) =>
          sum + item.product.price * (item.id === itemId ? quantity : item.quantity),
        0
      ),
    });

    const user = JSON.parse(storedUser);
    const result = await updateCartItem(itemId, user.id, quantity);
    if (result.error) {
      toast.error(result.error);
      loadCart(); // revert on error
    }
    refreshCount();
  }

  async function handleRemove(itemId: string) {
    const storedUser = localStorage.getItem("user");
    if (!storedUser || !cart) return;

    // Optimistic update
    const removedItem = cart.items.find((item) => item.id === itemId);
    setCart({
      ...cart,
      items: cart.items.filter((item) => item.id !== itemId),
      total: cart.total - (removedItem ? removedItem.product.price * removedItem.quantity : 0),
      count: cart.count - 1,
    });

    const user = JSON.parse(storedUser);
    const result = await removeCartItem(itemId, user.id);
    if (!result.error) {
      toast.success("Item dihapus dari keranjang");
    } else {
      toast.error(result.error);
      loadCart(); // revert on error
    }
    refreshCount();
    setUpdatingId(null);
  }

  async function handleClearCart() {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) return;

    const user = JSON.parse(storedUser);
    const result = await clearCartApi(user.id);
    if (!result.error) {
      toast.success("Keranjang dikosongkan");
      loadCart();
      refreshCount();
    } else {
      toast.error(result.error);
    }
  }

  function formatPrice(price: number) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  }

  const isLoggedIn = typeof window !== "undefined" && localStorage.getItem("user");

  const filteredItems = cart?.items.filter((item) =>
    item.product.name.toLowerCase().includes(search.toLowerCase())
  ) || [];

  const totalItems = cart?.items.reduce((sum, item) => sum + item.quantity, 0) || 0;

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Navbar />

      <main className="flex-1 bg-zinc-50">
        <div className="p-4 sm:p-6">
          {/* Breadcrumb */}
          <nav className="mb-4 flex items-center gap-2 text-sm text-zinc-500">
            <Link href="/" className="flex items-center gap-1.5 hover:text-zinc-900">
              <Home className="h-3.5 w-3.5" />
              Beranda
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-zinc-900 font-medium">Keranjang</span>
          </nav>

          {/* Search */}
          {cart && cart.items.length > 0 && (
            <div className="relative mb-4">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder="Cari produk di keranjang..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-11 w-full rounded-xl border border-zinc-200 bg-white pl-11 pr-4 text-sm placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
              />
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
            </div>
          ) : !isLoggedIn ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-zinc-200 bg-white py-20">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100">
                <ShoppingCart className="h-8 w-8 text-zinc-400" />
              </div>
              <h2 className="mt-5 text-lg font-semibold">Silakan login terlebih dahulu</h2>
              <p className="mt-1 text-sm text-zinc-500">Login untuk melihat keranjang belanja Anda</p>
              <Button className="mt-5 h-10 gap-2 bg-zinc-900 text-sm" asChild>
                <Link href="/masuk">Masuk ke Akun</Link>
              </Button>
            </div>
          ) : !cart || cart.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-zinc-200 bg-white py-20">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100">
                <ShoppingBag className="h-8 w-8 text-zinc-400" />
              </div>
              <h2 className="mt-5 text-lg font-semibold">Keranjang belanja kosong</h2>
              <p className="mt-1 text-sm text-zinc-500">Yuk, mulai belanja dan temukan produk terbaik</p>
              <Button className="mt-5 h-10 gap-2 bg-zinc-900 text-sm" asChild>
                <Link href="/produk">
                  <ShoppingBag className="h-4 w-4" />
                  Mulai Belanja
                </Link>
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 lg:grid-cols-12">
              <div className="lg:col-span-8">
                {/* Items Table */}
                <div className="rounded-xl border border-zinc-200 bg-white overflow-hidden">
                  {/* Table Header */}
                  <div className="grid grid-cols-12 items-center border-b border-zinc-100 bg-zinc-50/80 px-5 py-3">
                    <div className="col-span-6 text-xs font-semibold uppercase tracking-wider text-zinc-500">Produk</div>
                    <div className="col-span-2 text-center text-xs font-semibold uppercase tracking-wider text-zinc-500">Harga</div>
                    <div className="col-span-2 text-center text-xs font-semibold uppercase tracking-wider text-zinc-500">Jumlah</div>
                    <div className="col-span-2 text-right text-xs font-semibold uppercase tracking-wider text-zinc-500">Subtotal</div>
                  </div>

                  {filteredItems.length === 0 && search ? (
                    <div className="flex flex-col items-center justify-center py-12">
                      <Search className="h-8 w-8 text-zinc-300" />
                      <p className="mt-3 text-sm font-medium text-zinc-900">Produk tidak ditemukan</p>
                      <p className="mt-1 text-xs text-zinc-500">Coba kata kunci lain</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-zinc-100">
                      {filteredItems.map((item) => (
                        <div key={item.id} className="grid grid-cols-12 items-center px-5 py-4 hover:bg-zinc-50/50 transition-colors">
                          {/* Product */}
                          <div className="col-span-6 flex items-center gap-4">
                            <Link href={`/produk/${item.product.slug}`} className="shrink-0">
                              <div className="h-20 w-20 overflow-hidden rounded-xl bg-zinc-100 border border-zinc-100">
                                {item.product.thumbnail ? (
                                  <img src={item.product.thumbnail} alt={item.product.name} className="h-full w-full object-cover" />
                                ) : (
                                  <div className="flex h-full w-full items-center justify-center">
                                    <ImageIcon className="h-6 w-6 text-zinc-300" />
                                  </div>
                                )}
                              </div>
                            </Link>
                            <div className="min-w-0">
                              {item.product.category && (
                                <span className="inline-block rounded bg-zinc-100 px-2 py-0.5 text-[10px] font-medium text-zinc-500">
                                  {item.product.category.name}
                                </span>
                              )}
                              <Link href={`/produk/${item.product.slug}`}>
                                <h3 className="mt-1 text-sm font-medium text-zinc-900 hover:text-zinc-700 line-clamp-2 leading-snug">
                                  {item.product.name}
                                </h3>
                              </Link>
                              <button
                                onClick={() => handleRemove(item.id)}
                                disabled={updatingId === item.id}
                                className="mt-1.5 flex items-center gap-1 text-xs text-zinc-400 hover:text-red-600 transition-colors"
                              >
                                <Trash2 className="h-3 w-3" />
                                Hapus Produk
                              </button>
                            </div>
                          </div>

                          {/* Price */}
                          <div className="col-span-2 text-center text-sm font-medium text-zinc-900">
                            {formatPrice(item.product.price)}
                          </div>

                          {/* Quantity */}
                          <div className="col-span-2 flex justify-center">
                            <div className="flex items-center rounded-lg border border-zinc-200">
                              <button
                                onClick={() => handleUpdateQty(item.id, item.quantity - 1)}
                                disabled={updatingId === item.id}
                                className="flex h-8 w-8 items-center justify-center hover:bg-zinc-50 transition-colors"
                              >
                                <Minus className="h-3.5 w-3.5" />
                              </button>
                              <span className="flex h-8 w-9 items-center justify-center border-x border-zinc-200 text-sm font-medium">
                                {updatingId === item.id ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  item.quantity
                                )}
                              </span>
                              <button
                                onClick={() => handleUpdateQty(item.id, item.quantity + 1)}
                                disabled={updatingId === item.id || item.quantity >= item.product.stock}
                                className="flex h-8 w-8 items-center justify-center hover:bg-zinc-50 transition-colors disabled:opacity-40"
                              >
                                <Plus className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Subtotal */}
                          <div className="col-span-2 text-right text-sm font-bold text-zinc-900">
                            {formatPrice(item.product.price * item.quantity)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Table Footer */}
                  <div className="flex items-center justify-between border-t border-zinc-100 bg-zinc-50/50 px-5 py-3">
                    <button
                      onClick={handleClearCart}
                      className="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Kosongkan Keranjang
                    </button>
                  </div>
                </div>

              </div>

              {/* Summary & Checkout */}
              <div className="lg:col-span-4">
              <div className="sticky top-20 rounded-xl border border-zinc-200 bg-white overflow-hidden">
                {/* Header */}
                <div className="border-b border-zinc-100 bg-zinc-50/80 px-5 py-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Ringkasan Belanja</span>
                </div>
                <div className="p-5 space-y-4">
                {/* Summary */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-zinc-500">Subtotal ({totalItems} item)</span>
                    <span className="font-medium">{formatPrice(cart.total)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-zinc-500">Ongkos Kirim</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs line-through text-zinc-400">Rp 15.000</span>
                      <span className="font-medium text-green-600">Gratis</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-zinc-500">Diskon</span>
                    <span className="text-zinc-400">-</span>
                  </div>
                </div>

                <div className="border-t border-zinc-100" />

                {/* Total */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-zinc-900">Total Pembayaran</span>
                  <span className="text-xl font-bold text-zinc-900">{formatPrice(cart.total)}</span>
                </div>

                <Link href="/checkout">
                  <Button className="h-11 w-full bg-zinc-900 text-sm font-medium">
                    Checkout
                  </Button>
                </Link>

                {/* Trust */}
                <div className="flex items-center justify-center gap-4 pt-2">
                  {[
                    { icon: Truck, text: "Gratis Ongkir" },
                    { icon: ShieldCheck, text: "Aman" },
                    { icon: Clock, text: "Cepat" },
                  ].map((item) => (
                    <div key={item.text} className="flex items-center gap-1.5 text-xs text-zinc-400">
                      <item.icon className="h-3.5 w-3.5" />
                      {item.text}
                    </div>
                  ))}
                </div>
                </div>
              </div>
              </div>
            </div>
          )}

          {/* Recommendations */}
          {recommendations.length > 0 && (
            <div className="mt-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-zinc-500" />
                  <h2 className="text-sm font-semibold text-zinc-900">Mungkin kamu juga suka</h2>
                </div>
                <Link href="/produk" className="flex items-center gap-1 text-sm font-medium text-zinc-600 hover:text-zinc-900">
                  Lihat semua <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {recommendations.map((p) => (
                  <Link
                    key={p.id}
                    href={`/produk/${p.slug}`}
                    className="group overflow-hidden rounded-lg border border-zinc-200 bg-white transition-shadow hover:shadow-md"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden bg-zinc-100">
                      {p.thumbnail ? (
                        <img
                          src={p.thumbnail}
                          alt={p.name}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <ImageIcon className="h-10 w-10 text-zinc-300" />
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      {p.category && (
                        <span className="text-xs text-zinc-500">{p.category.name}</span>
                      )}
                      <h3 className="mt-0.5 text-sm font-medium text-zinc-900 line-clamp-1">{p.name}</h3>
                      <p className="mt-1.5 font-bold text-zinc-900">{formatPrice(p.price)}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-100 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <Link href="/">
                <Image src="/22mart.png" alt="22Mart" width={120} height={40} className="h-9 w-auto" />
              </Link>
              <p className="mt-4 text-sm leading-relaxed text-zinc-500">
                Supermarket online terpercaya dengan produk segar berkualitas.
              </p>
              <div className="mt-4 flex items-center gap-1.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-accent text-accent" />
                ))}
                <span className="ml-1 text-sm text-zinc-500">4.9</span>
              </div>
            </div>
            <div>
              <p className="font-semibold">Belanja</p>
              <ul className="mt-4 space-y-2.5 text-sm text-zinc-500">
                <li><Link href="/produk" className="hover:text-zinc-900">Semua Produk</Link></li>
                <li><Link href="/categories" className="hover:text-zinc-900">Kategori</Link></li>
                <li><Link href="/deals" className="hover:text-zinc-900">Promo</Link></li>
              </ul>
            </div>
            <div>
              <p className="font-semibold">Perusahaan</p>
              <ul className="mt-4 space-y-2.5 text-sm text-zinc-500">
                <li><Link href="/about" className="hover:text-zinc-900">Tentang Kami</Link></li>
                <li><Link href="/careers" className="hover:text-zinc-900">Karir</Link></li>
                <li><Link href="/contact" className="hover:text-zinc-900">Kontak</Link></li>
              </ul>
            </div>
            <div>
              <p className="font-semibold">Hubungi Kami</p>
              <ul className="mt-4 space-y-2.5 text-sm text-zinc-500">
                <li className="flex items-center gap-2"><Phone className="h-4 w-4" /> 0812-3456-7890</li>
                <li className="flex items-center gap-2"><Mail className="h-4 w-4" /> halo@22mart.id</li>
              </ul>
            </div>
          </div>
          <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-zinc-100 pt-8 text-sm text-zinc-400 sm:flex-row">
            <p>&copy; {new Date().getFullYear()} 22Mart. Hak cipta dilindungi.</p>
            <div className="flex gap-6">
              <Link href="/privacy" className="hover:text-zinc-900">Privasi</Link>
              <Link href="/terms" className="hover:text-zinc-900">Ketentuan</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
