"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ShoppingCart,
  Heart,
  Minus,
  Plus,
  ImageIcon,
  Loader2,
  Truck,
  ShieldCheck,
  Star,
  Phone,
  Mail,
  Package,
  ChevronRight,
  Home,
  ShoppingBag,
  Clock,
  BadgeCheck,
  Share2,
} from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useCart } from "@/lib/cart-context";
import { useFavorite } from "@/lib/favorite-context";
import { getProductBySlug, getProducts, addToCart, checkFavorite, toggleFavorite, Product } from "@/lib/api";

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [favorited, setFavorited] = useState(false);
  const { refreshCount } = useCart();
  const { refreshCount: refreshFavoriteCount } = useFavorite();

  useEffect(() => {
    loadProduct();
  }, [slug]);

  async function loadProduct() {
    setLoading(true);
    setQuantity(1);

    const productRes = await getProductBySlug(slug);
    if (productRes.data) {
      setProduct(productRes.data);

      const productsRes = await getProducts(productRes.data.categoryId);
      if (productsRes.data) {
        setRelatedProducts(
          productsRes.data
            .filter((p) => p.id !== productRes.data!.id && p.isActive)
            .slice(0, 4)
        );
      }

      // Check favorite status
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const user = JSON.parse(storedUser);
        const favRes = await checkFavorite(user.id, productRes.data.id);
        if (favRes.data) setFavorited(favRes.data.favorited);
      }
    }

    setLoading(false);
  }

  async function handleToggleFavorite() {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      toast.error("Silakan login terlebih dahulu");
      return;
    }
    if (!product) return;

    const user = JSON.parse(storedUser);
    const result = await toggleFavorite(user.id, product.id);
    if (result.data) {
      setFavorited(result.data.favorited);
      refreshFavoriteCount();
      toast.success(result.data.favorited ? "Ditambahkan ke favorit" : "Dihapus dari favorit");
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

  async function handleAddToCart() {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      toast.error("Silakan login terlebih dahulu");
      return;
    }

    setAddingToCart(true);
    const user = JSON.parse(storedUser);
    const result = await addToCart(user.id, product!.id, quantity);

    if (result.data) {
      toast.success(`${product!.name} ditambahkan ke keranjang`);
      refreshCount();
      setQuantity(1);
    } else {
      toast.error(result.error);
    }

    setAddingToCart(false);
  }

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-white">
        <Navbar />
        <div className="flex flex-1 items-center justify-center bg-zinc-50">
          <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex min-h-screen flex-col bg-white">
        <Navbar />
        <div className="flex flex-1 flex-col items-center justify-center bg-zinc-50">
          <Package className="h-12 w-12 text-zinc-300" />
          <h2 className="mt-3 text-base font-semibold">Produk tidak ditemukan</h2>
          <p className="mt-1 text-sm text-zinc-500">Produk yang Anda cari tidak tersedia</p>
          <Button className="mt-4 h-9 bg-zinc-900 text-sm" asChild>
            <Link href="/produk">Lihat Semua Produk</Link>
          </Button>
        </div>
      </div>
    );
  }

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
            <Link href="/produk" className="hover:text-zinc-900">Produk</Link>
            {product.category && (
              <>
                <ChevronRight className="h-3.5 w-3.5" />
                <Link href={`/produk?category=${product.categoryId}`} className="hover:text-zinc-900">
                  {product.category.name}
                </Link>
              </>
            )}
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-zinc-900 font-medium line-clamp-1">{product.name}</span>
          </nav>

          {/* Product Detail */}
          <div className="grid gap-4 lg:grid-cols-12">
            {/* Image Section */}
            <div className="lg:col-span-3">
              <div className="sticky top-20 space-y-3">
                <div className="relative overflow-hidden rounded-lg border border-zinc-200 bg-white">
                  <div className="aspect-square bg-zinc-50">
                    {product.thumbnail ? (
                      <img src={product.thumbnail} alt={product.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <ImageIcon className="h-16 w-16 text-zinc-300" />
                      </div>
                    )}
                  </div>
                  {product.stock === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                      <span className="rounded-full bg-white px-4 py-1.5 text-sm font-semibold">Stok Habis</span>
                    </div>
                  )}

                  {/* Wishlist & Share floating */}
                  <div className="absolute right-3 top-3 flex flex-col gap-2">
                    <button
                      onClick={handleToggleFavorite}
                      className={`flex h-9 w-9 items-center justify-center rounded-full shadow-sm backdrop-blur-sm transition-colors ${
                        favorited ? "bg-red-500 text-white hover:bg-red-600" : "bg-white/90 text-zinc-600 hover:bg-white hover:text-red-500"
                      }`}
                    >
                      <Heart className={`h-4 w-4 ${favorited ? "fill-current" : ""}`} />
                    </button>
                    <button className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-zinc-600 shadow-sm backdrop-blur-sm hover:bg-white transition-colors">
                      <Share2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Trust Badges */}
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { icon: Truck, title: "Gratis Ongkir", desc: "Min. Rp100rb" },
                    { icon: ShieldCheck, title: "Pembayaran Aman", desc: "Terverifikasi" },
                    { icon: Clock, title: "Pengiriman Cepat", desc: "Estimasi 1-3 hari" },
                  ].map((f) => (
                    <div key={f.title} className="flex flex-col items-center gap-1 rounded-lg border border-zinc-200 bg-white p-3 text-center">
                      <f.icon className="h-4 w-4 text-zinc-900" />
                      <span className="text-xs font-medium text-zinc-900">{f.title}</span>
                      <span className="text-[10px] text-zinc-500">{f.desc}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Product Info */}
            <div className="lg:col-span-6 space-y-4">
              {/* Main Info Card */}
              <div className="rounded-lg border border-zinc-200 bg-white p-5">
                <div className="flex items-center gap-2 flex-wrap">
                  {product.category && (
                    <Link
                      href={`/produk?category=${product.categoryId}`}
                      className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-600 hover:bg-zinc-200 transition-colors"
                    >
                      {product.category.name}
                    </Link>
                  )}
                  {product.stock > 0 && product.stock <= 10 && (
                    <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
                      Sisa {product.stock}
                    </span>
                  )}
                </div>

                <h1 className="mt-3 text-xl font-bold text-zinc-900 leading-tight">{product.name}</h1>

                {/* Rating placeholder */}
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <span className="text-xs text-zinc-500">4.9 (128 ulasan)</span>
                </div>

                <div className="mt-4 flex items-center gap-3">
                  <p className="text-2xl font-bold text-zinc-900">{formatPrice(product.price)}</p>
                  {product.stock > 0 ? (
                    <span className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700">
                      Tersedia
                    </span>
                  ) : (
                    <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700">
                      Habis
                    </span>
                  )}
                </div>
              </div>

              {/* Description Card */}
              <div className="rounded-lg border border-zinc-200 bg-white p-5">
                <h3 className="text-sm font-semibold text-zinc-900">Deskripsi Produk</h3>
                {product.description ? (
                  <p className="mt-2 text-sm leading-relaxed text-zinc-600">{product.description}</p>
                ) : (
                  <p className="mt-2 text-sm text-zinc-400 italic">Belum ada deskripsi untuk produk ini.</p>
                )}

                {/* Info highlights */}
                <div className="mt-4 space-y-2">
                  {[
                    { icon: BadgeCheck, text: "Produk terjamin keasliannya" },
                    { icon: ShieldCheck, text: "Transaksi aman & terlindungi" },
                    { icon: Clock, text: "Proses pengiriman cepat" },
                  ].map((item) => (
                    <div key={item.text} className="flex items-center gap-2.5">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-50">
                        <item.icon className="h-3.5 w-3.5 text-green-600" />
                      </div>
                      <span className="text-sm text-zinc-600">{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Purchase Card */}
            <div className="lg:col-span-3">
              <div className="sticky top-20 space-y-3">
                <div className="rounded-lg border border-zinc-200 bg-white p-5">
                  <h3 className="text-sm font-semibold text-zinc-900">Atur jumlah</h3>

                  <div className="mt-3 flex items-center gap-3">
                    <div className="flex items-center rounded-lg border border-zinc-200">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="flex h-9 w-9 items-center justify-center hover:bg-zinc-50 transition-colors"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="flex h-9 w-10 items-center justify-center border-x border-zinc-200 text-sm font-medium">
                        {quantity}
                      </span>
                      <button
                        onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                        className="flex h-9 w-9 items-center justify-center hover:bg-zinc-50 transition-colors"
                        disabled={product.stock === 0}
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                    <span className="text-sm text-zinc-500">
                      Stok: <span className="font-medium text-zinc-700">{product.stock}</span>
                    </span>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-zinc-100 pt-4">
                    <span className="text-sm text-zinc-500">Subtotal</span>
                    <span className="text-lg font-bold text-zinc-900">
                      {formatPrice(product.price * quantity)}
                    </span>
                  </div>

                  <div className="mt-4 space-y-2">
                    <Button
                      className="h-10 w-full gap-2 bg-zinc-900 text-sm font-medium"
                      disabled={product.stock === 0 || addingToCart}
                      onClick={handleAddToCart}
                    >
                      {addingToCart ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <ShoppingCart className="h-4 w-4" />
                      )}
                      {addingToCart ? "Menambahkan..." : "Tambah ke Keranjang"}
                    </Button>
                    <Button
                      variant="outline"
                      className="h-10 w-full gap-2 text-sm font-medium"
                      disabled={product.stock === 0}
                    >
                      Beli Langsung
                    </Button>
                  </div>
                </div>

                {/* Delivery Info */}
                <div className="rounded-lg border border-zinc-200 bg-white p-4">
                  <div className="flex items-start gap-3">
                    <Truck className="mt-0.5 h-4 w-4 text-zinc-500 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-zinc-900">Estimasi pengiriman</p>
                      <p className="mt-0.5 text-xs text-zinc-500">Tiba hari ini jika dipesan sebelum jam 14:00</p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-start gap-3">
                    <ShieldCheck className="mt-0.5 h-4 w-4 text-zinc-500 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-zinc-900">Garansi kepuasan</p>
                      <p className="mt-0.5 text-xs text-zinc-500">Uang kembali 100% jika tidak sesuai</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div className="mt-8">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold text-zinc-900">Produk Terkait</h2>
                <Link href={`/produk?category=${product.categoryId}`} className="flex items-center gap-1 text-sm font-medium text-zinc-600 hover:text-zinc-900">
                  Lihat semua <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {relatedProducts.map((p) => (
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
                      <div className="absolute right-2 top-2 flex flex-col gap-1.5 opacity-0 transition-opacity group-hover:opacity-100">
                        <button className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-zinc-700 shadow-md hover:bg-zinc-50">
                          <Heart className="h-3.5 w-3.5" />
                        </button>
                        <button className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-zinc-700 shadow-md hover:bg-zinc-50">
                          <ShoppingBag className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                    <div className="p-3">
                      {p.category && (
                        <span className="text-xs text-zinc-500">{p.category.name}</span>
                      )}
                      <h3 className="mt-0.5 text-sm font-medium text-zinc-900 line-clamp-1">{p.name}</h3>
                      <div className="mt-1 flex items-center gap-1">
                        <div className="flex items-center gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="h-2.5 w-2.5 fill-amber-400 text-amber-400" />
                          ))}
                        </div>
                        <span className="text-[10px] text-zinc-400">4.9</span>
                      </div>
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
