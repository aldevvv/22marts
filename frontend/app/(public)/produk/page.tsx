"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  ShoppingBag,
  ImageIcon,
  Loader2,
  SlidersHorizontal,
  X,
  Star,
  Phone,
  Mail,
  Grid3X3,
  LayoutGrid,
  ChevronRight,
  Heart,
  ArrowUpDown,
  Package,
  Home,
} from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { getProducts, getCategories, Product, Category } from "@/lib/api";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [showMobileFilter, setShowMobileFilter] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    const [productsRes, categoriesRes] = await Promise.all([
      getProducts(),
      getCategories(),
    ]);
    if (productsRes.data) setProducts(productsRes.data.filter((p) => p.isActive));
    if (categoriesRes.data) setCategories(categoriesRes.data.filter((c) => c.isActive));
    setLoading(false);
  }

  function formatPrice(price: number) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  }

  const filteredProducts = products
    .filter((p) => {
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
      const matchCategory = !selectedCategory || p.categoryId === selectedCategory;
      return matchSearch && matchCategory;
    })
    .sort((a, b) => {
      if (sortBy === "price-asc") return a.price - b.price;
      if (sortBy === "price-desc") return b.price - a.price;
      if (sortBy === "name") return a.name.localeCompare(b.name);
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const selectedCategoryName = categories.find((c) => c.id === selectedCategory)?.name;

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Navbar />

      <main className="flex-1 bg-zinc-50">
        <div className="flex min-h-[calc(100vh-64px)]">
            {/* Sidebar - Desktop */}
            <aside className="hidden w-64 shrink-0 border-r border-zinc-200 bg-white lg:block">
              <div className="sticky top-16 h-[calc(100vh-64px)] overflow-y-auto p-5 space-y-6">
                {/* Categories */}
                <div>
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-zinc-900">
                    <LayoutGrid className="h-4 w-4" />
                    Kategori
                  </h3>
                  <div className="mt-2 space-y-0.5">
                    <button
                      onClick={() => setSelectedCategory("")}
                      className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors ${
                        !selectedCategory
                          ? "bg-zinc-900 font-medium text-white"
                          : "text-zinc-600 hover:bg-zinc-100"
                      }`}
                    >
                      <span>Semua Produk</span>
                      <span className={`text-xs ${!selectedCategory ? "text-zinc-400" : "text-zinc-400"}`}>
                        {products.length}
                      </span>
                    </button>
                    {categories.map((cat) => {
                      const count = products.filter((p) => p.categoryId === cat.id).length;
                      return (
                        <button
                          key={cat.id}
                          onClick={() => setSelectedCategory(selectedCategory === cat.id ? "" : cat.id)}
                          className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors ${
                            selectedCategory === cat.id
                              ? "bg-zinc-900 font-medium text-white"
                              : "text-zinc-600 hover:bg-zinc-100"
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            {cat.icon && <span>{cat.icon}</span>}
                            {cat.name}
                          </span>
                          <span className={`text-xs ${selectedCategory === cat.id ? "text-zinc-400" : "text-zinc-400"}`}>
                            {count}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Price Sort */}
                <div>
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-zinc-900">
                    <ArrowUpDown className="h-4 w-4" />
                    Urutkan
                  </h3>
                  <div className="mt-2 space-y-0.5">
                    {[
                      { value: "newest", label: "Terbaru" },
                      { value: "price-asc", label: "Harga Terendah" },
                      { value: "price-desc", label: "Harga Tertinggi" },
                      { value: "name", label: "Nama A-Z" },
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setSortBy(option.value)}
                        className={`flex w-full items-center rounded-lg px-3 py-2 text-sm transition-colors ${
                          sortBy === option.value
                            ? "bg-zinc-100 font-medium text-zinc-900"
                            : "text-zinc-600 hover:bg-zinc-100"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 min-w-0 p-6">
              {/* Breadcrumb */}
              <nav className="mb-4 flex items-center gap-2 text-sm text-zinc-500">
                <Link href="/" className="flex items-center gap-1.5 hover:text-zinc-900">
                  <Home className="h-3.5 w-3.5" />
                  Beranda
                </Link>
                <ChevronRight className="h-3.5 w-3.5" />
                <span className="text-zinc-900 font-medium">Produk</span>
                {selectedCategoryName && (
                  <>
                    <ChevronRight className="h-3.5 w-3.5" />
                    <span className="text-zinc-900 font-medium">{selectedCategoryName}</span>
                  </>
                )}
              </nav>

              {/* Search */}
              <div className="relative mb-4">
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Cari produk berdasarkan nama..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-11 w-full rounded-xl border border-zinc-200 bg-white pl-11 pr-4 text-sm placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                />
              </div>

              {/* Toolbar */}
              <div className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white px-4 py-3">
                <div className="flex items-center gap-3">
                  {/* Mobile Filter Toggle */}
                  <button
                    onClick={() => setShowMobileFilter(true)}
                    className="flex items-center gap-2 rounded-lg border border-zinc-200 px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 lg:hidden"
                  >
                    <SlidersHorizontal className="h-4 w-4" />
                    Filter
                  </button>

                  <p className="text-sm text-zinc-500">
                    <span className="font-medium text-zinc-900">{filteredProducts.length}</span> produk ditemukan
                  </p>
                </div>

                {/* Mobile Search */}
                <div className="relative flex-1 mx-4 lg:hidden">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="text"
                    placeholder="Cari..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="h-9 w-full rounded-lg border border-zinc-200 bg-white pl-9 pr-3 text-sm focus:border-zinc-900 focus:outline-none"
                  />
                </div>

                {/* Sort - Desktop */}
                <div className="hidden items-center gap-2 lg:flex">
                  <ArrowUpDown className="h-4 w-4 text-zinc-400" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="h-9 rounded-lg border border-zinc-200 bg-white px-3 text-sm focus:border-zinc-900 focus:outline-none"
                  >
                    <option value="newest">Terbaru</option>
                    <option value="price-asc">Harga: Rendah ke Tinggi</option>
                    <option value="price-desc">Harga: Tinggi ke Rendah</option>
                    <option value="name">Nama: A-Z</option>
                  </select>
                </div>
              </div>

              {/* Active Filters */}
              {(selectedCategory || search) && (
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {selectedCategory && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-900 px-3 py-1 text-xs font-medium text-white">
                      {selectedCategoryName}
                      <button onClick={() => setSelectedCategory("")}>
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )}
                  {search && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-900 px-3 py-1 text-xs font-medium text-white">
                      &quot;{search}&quot;
                      <button onClick={() => setSearch("")}>
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )}
                  <button
                    onClick={() => { setSearch(""); setSelectedCategory(""); }}
                    className="text-xs font-medium text-zinc-500 hover:text-zinc-900"
                  >
                    Hapus semua
                  </button>
                </div>
              )}

              {/* Products Grid */}
              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="mt-4 flex flex-col items-center justify-center rounded-xl border border-zinc-200 bg-white py-20">
                  <Package className="h-16 w-16 text-zinc-200" />
                  <p className="mt-4 text-lg font-semibold text-zinc-900">Produk tidak ditemukan</p>
                  <p className="mt-1 text-sm text-zinc-500">Coba ubah kata kunci atau filter pencarian</p>
                  <Button
                    variant="outline"
                    className="mt-4 rounded-full"
                    onClick={() => { setSearch(""); setSelectedCategory(""); }}
                  >
                    Reset Filter
                  </Button>
                </div>
              ) : (
                <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
                  {filteredProducts.map((product) => (
                    <Link
                      key={product.id}
                      href={`/produk/${product.slug}`}
                      className="group overflow-hidden rounded-xl border border-zinc-200 bg-white transition-shadow hover:shadow-md"
                    >
                      {/* Image */}
                      <div className="relative aspect-[4/3] overflow-hidden bg-zinc-100">
                        {product.thumbnail ? (
                          <img
                            src={product.thumbnail}
                            alt={product.name}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <ImageIcon className="h-12 w-12 text-zinc-300" />
                          </div>
                        )}

                        {product.stock === 0 && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                            <span className="rounded-full bg-white px-4 py-1.5 text-sm font-semibold text-zinc-900">
                              Stok Habis
                            </span>
                          </div>
                        )}

                        {/* Quick Actions */}
                        <div className="absolute right-3 top-3 flex flex-col gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                          <button className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-zinc-700 shadow-md hover:bg-zinc-50">
                            <Heart className="h-4 w-4" />
                          </button>
                          <button className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-zinc-700 shadow-md hover:bg-zinc-50">
                            <ShoppingBag className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      {/* Info */}
                      <div className="p-4">
                        {product.category && (
                          <span className="text-xs font-medium text-zinc-500">{product.category.name}</span>
                        )}
                        <h3 className="mt-1 font-medium text-zinc-900 line-clamp-1 group-hover:text-zinc-700">
                          {product.name}
                        </h3>
                        {product.description && (
                          <p className="mt-1 text-sm text-zinc-500 line-clamp-2">{product.description}</p>
                        )}
                        <div className="mt-3 flex items-center justify-between">
                          <p className="text-lg font-bold text-zinc-900">{formatPrice(product.price)}</p>
                          {product.stock > 0 && product.stock <= 10 && (
                            <span className="text-xs text-amber-600 font-medium">Sisa {product.stock}</span>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
      </main>

      {/* Mobile Filter Drawer */}
      {showMobileFilter && (
        <>
          <div className="fixed inset-0 z-50 bg-black/50 lg:hidden" onClick={() => setShowMobileFilter(false)} />
          <div className="fixed inset-y-0 left-0 z-50 w-72 overflow-y-auto bg-white p-5 shadow-xl lg:hidden">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold">Filter</h2>
              <button onClick={() => setShowMobileFilter(false)} className="rounded-lg p-1.5 hover:bg-zinc-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Mobile Search */}
            <div className="mt-5">
              <h3 className="text-sm font-semibold text-zinc-900">Cari</h3>
              <div className="relative mt-2">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Ketik nama produk..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-10 w-full rounded-lg border border-zinc-200 bg-white pl-9 pr-3 text-sm focus:border-zinc-900 focus:outline-none"
                />
              </div>
            </div>

            {/* Mobile Categories */}
            <div className="mt-5">
              <h3 className="text-sm font-semibold text-zinc-900">Kategori</h3>
              <div className="mt-2 space-y-0.5">
                <button
                  onClick={() => { setSelectedCategory(""); setShowMobileFilter(false); }}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm ${
                    !selectedCategory ? "bg-zinc-900 font-medium text-white" : "text-zinc-600 hover:bg-zinc-100"
                  }`}
                >
                  <span>Semua</span>
                  <span className="text-xs">{products.length}</span>
                </button>
                {categories.map((cat) => {
                  const count = products.filter((p) => p.categoryId === cat.id).length;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => { setSelectedCategory(cat.id); setShowMobileFilter(false); }}
                      className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm ${
                        selectedCategory === cat.id ? "bg-zinc-900 font-medium text-white" : "text-zinc-600 hover:bg-zinc-100"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        {cat.icon && <span>{cat.icon}</span>}
                        {cat.name}
                      </span>
                      <span className="text-xs">{count}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Mobile Sort */}
            <div className="mt-5">
              <h3 className="text-sm font-semibold text-zinc-900">Urutkan</h3>
              <div className="mt-2 space-y-0.5">
                {[
                  { value: "newest", label: "Terbaru" },
                  { value: "price-asc", label: "Harga Terendah" },
                  { value: "price-desc", label: "Harga Tertinggi" },
                  { value: "name", label: "Nama A-Z" },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => { setSortBy(option.value); setShowMobileFilter(false); }}
                    className={`flex w-full items-center rounded-lg px-3 py-2 text-sm ${
                      sortBy === option.value ? "bg-zinc-100 font-medium text-zinc-900" : "text-zinc-600 hover:bg-zinc-100"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

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
