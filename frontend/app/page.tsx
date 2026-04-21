import Link from "next/link";
import Image from "next/image";
import {
  Truck,
  ShieldCheck,
  Clock,
  ArrowRight,
  ShoppingBag,
  Star,
  Phone,
  Mail,
  ChevronRight,
} from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";

const categories = [
  {
    name: "Sayur & Buah",
    count: "120+ produk",
    href: "/categories/fresh-produce",
    image: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&h=600&fit=crop",
  },
  {
    name: "Daging & Seafood",
    count: "80+ produk",
    href: "/categories/meat-seafood",
    image: "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=800&h=600&fit=crop",
  },
  {
    name: "Susu & Olahan",
    count: "95+ produk",
    href: "/categories/dairy",
    image: "https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=800&h=600&fit=crop",
  },
  {
    name: "Roti & Kue",
    count: "60+ produk",
    href: "/categories/bakery",
    image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&h=600&fit=crop",
  },
];

const products = [
  {
    name: "Apel Fuji Premium",
    price: "Rp 45.000",
    unit: "/kg",
    image: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400&h=400&fit=crop",
    badge: "Terlaris",
  },
  {
    name: "Susu Segar Organik",
    price: "Rp 28.000",
    unit: "/liter",
    image: "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&h=400&fit=crop",
    badge: null,
  },
  {
    name: "Roti Gandum Utuh",
    price: "Rp 32.000",
    unit: "/pack",
    image: "https://images.unsplash.com/photo-1598373182133-52452f7691ef?w=400&h=400&fit=crop",
    badge: "Baru",
  },
  {
    name: "Telur Ayam Kampung",
    price: "Rp 38.000",
    unit: "/10 butir",
    image: "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=400&h=400&fit=crop",
    badge: null,
  },
];

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Navbar />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid min-h-[80vh] items-center gap-8 py-12 lg:grid-cols-2 lg:gap-16 lg:py-0">
              <div className="order-2 lg:order-1">
                <span className="inline-flex items-center gap-2 rounded-full bg-accent/20 px-3 py-1 text-sm font-medium">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                  Pengiriman hari ini
                </span>

                <h1 className="mt-6 text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
                  Belanja segar,
                  <br />
                  <span className="text-zinc-400">tanpa ribet.</span>
                </h1>

                <p className="mt-6 max-w-md text-base leading-relaxed text-zinc-600 sm:text-lg">
                  Produk berkualitas dari petani lokal, diantar langsung ke rumah Anda dalam hitungan jam.
                </p>

                <div className="mt-8 flex flex-wrap items-center gap-3">
                  <Button size="lg" className="h-12 gap-2 rounded-full bg-black px-6 text-white hover:bg-zinc-800" asChild>
                    <Link href="/produk">
                      Belanja Sekarang
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" className="h-12 rounded-full px-6" asChild>
                    <Link href="/about">Pelajari Lebih</Link>
                  </Button>
                </div>

                <div className="mt-12 flex items-center gap-6 border-t border-zinc-100 pt-8 sm:gap-10">
                  <div>
                    <p className="text-2xl font-bold sm:text-3xl">10K+</p>
                    <p className="text-sm text-zinc-500">Pelanggan</p>
                  </div>
                  <div className="h-10 w-px bg-zinc-200" />
                  <div>
                    <p className="text-2xl font-bold sm:text-3xl">4.9</p>
                    <p className="text-sm text-zinc-500">Rating</p>
                  </div>
                  <div className="h-10 w-px bg-zinc-200" />
                  <div>
                    <p className="text-2xl font-bold sm:text-3xl">30m</p>
                    <p className="text-sm text-zinc-500">Pengiriman</p>
                  </div>
                </div>
              </div>

              <div className="relative order-1 lg:order-2">
                <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[2rem] lg:aspect-square">
                  <Image
                    src="https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=800&h=1000&fit=crop"
                    alt="Fresh groceries"
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover"
                    priority
                  />
                </div>
                <div className="absolute -bottom-4 left-4 rounded-2xl bg-white p-4 shadow-xl ring-1 ring-zinc-100 sm:bottom-8 sm:left-8">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent">
                      <Truck className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold">Gratis Ongkir</p>
                      <p className="text-sm text-zinc-500">Min. Rp100rb</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="border-t border-zinc-100 bg-zinc-50 py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-widest text-zinc-400">Kategori</p>
                <h2 className="mt-1 text-2xl font-bold sm:text-3xl">Jelajahi Produk</h2>
              </div>
              <Link href="/categories" className="group hidden items-center gap-1 text-sm font-medium sm:flex">
                Semua <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>

            <div className="mt-8 grid gap-4 sm:mt-10 sm:grid-cols-2 lg:grid-cols-4">
              {categories.map((category, i) => (
                <Link
                  key={category.name}
                  href={category.href}
                  className={`group relative overflow-hidden rounded-2xl ${i === 0 ? "sm:col-span-2 sm:row-span-2" : ""}`}
                >
                  <div className={`relative w-full ${i === 0 ? "aspect-square" : "aspect-[4/3]"}`}>
                    <Image src={category.image} alt={category.name} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                  </div>
                  <div className="absolute bottom-0 left-0 p-5 sm:p-6">
                    <h3 className={`font-semibold text-white ${i === 0 ? "text-xl sm:text-2xl" : "text-lg"}`}>{category.name}</h3>
                    <p className="mt-1 text-sm text-white/70">{category.count}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Products */}
        <section className="py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-widest text-zinc-400">Pilihan Minggu Ini</p>
                <h2 className="mt-1 text-2xl font-bold sm:text-3xl">Produk Populer</h2>
              </div>
              <Link href="/produk" className="group hidden items-center gap-1 text-sm font-medium sm:flex">
                Lihat semua <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>

            <div className="mt-8 grid gap-5 sm:mt-10 sm:grid-cols-2 lg:grid-cols-4">
              {products.map((product) => (
                <div key={product.name} className="group">
                  <div className="relative aspect-square overflow-hidden rounded-2xl bg-zinc-100">
                    <Image src={product.image} alt={product.name} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" className="object-cover transition-transform duration-300 group-hover:scale-105" />
                    {product.badge && (
                      <span className="absolute left-3 top-3 rounded-full bg-accent px-2.5 py-1 text-xs font-semibold">{product.badge}</span>
                    )}
                    <button className="absolute bottom-3 right-3 flex h-10 w-10 items-center justify-center rounded-full bg-white text-zinc-900 opacity-0 shadow-lg transition-all group-hover:opacity-100 hover:bg-zinc-50">
                      <ShoppingBag className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="mt-3">
                    <h3 className="font-medium">{product.name}</h3>
                    <p className="mt-0.5 text-zinc-500">
                      <span className="font-semibold text-zinc-900">{product.price}</span>
                      <span className="text-sm">{product.unit}</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="border-y border-zinc-100 bg-zinc-900 py-16 text-white sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-10 sm:grid-cols-3">
              {[
                { icon: Truck, title: "Pengiriman Cepat", desc: "Pesan sebelum jam 2 siang, sampai hari yang sama." },
                { icon: ShieldCheck, title: "Jaminan Kualitas", desc: "Tidak puas? Uang kembali 100%, tanpa ribet." },
                { icon: Clock, title: "Selalu Segar", desc: "Stok diperbarui setiap hari dari petani lokal." },
              ].map((f) => (
                <div key={f.title} className="flex gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent">
                    <f.icon className="h-5 w-5 text-zinc-900" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{f.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-zinc-400">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="overflow-hidden rounded-3xl bg-accent">
              <div className="px-6 py-14 text-center sm:px-12 sm:py-20">
                <h2 className="text-2xl font-bold sm:text-3xl lg:text-4xl">
                  Belanja pertama?<br />Dapat diskon 20%.
                </h2>
                <p className="mx-auto mt-3 max-w-md text-zinc-700">
                  Daftar sekarang dan nikmati potongan harga untuk pembelian pertama Anda.
                </p>
                <div className="mx-auto mt-8 flex max-w-sm flex-col gap-3 sm:flex-row">
                  <input
                    type="email"
                    placeholder="Alamat email"
                    className="h-12 flex-1 rounded-full border-0 bg-white px-5 text-sm shadow-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900"
                  />
                  <Button size="lg" className="h-12 rounded-full bg-zinc-900 px-8 text-white hover:bg-zinc-800">
                    Daftar
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-100 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <Link href="/">
                <Image
                  src="/22mart.png"
                  alt="22Mart"
                  width={120}
                  height={40}
                  className="h-9 w-auto"
                />
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
