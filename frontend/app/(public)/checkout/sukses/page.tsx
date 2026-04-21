"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Clock, ShoppingBag, Loader2, Package } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { getPaymentStatus } from "@/lib/api";

export default function CheckoutSuksesPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id");
  const statusParam = searchParams.get("status");

  const [paymentStatus, setPaymentStatus] = useState<string>(statusParam || "checking");
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (orderId) {
      verifyPayment();
    } else {
      setChecking(false);
    }
  }, [orderId]);

  async function verifyPayment() {
    setChecking(true);

    for (let i = 0; i < 10; i++) {
      const result = await getPaymentStatus(orderId!);
      if (result.data) {
        if (result.data.isSuccess) {
          setPaymentStatus("success");
          setChecking(false);
          return;
        }
        if (result.data.found && result.data.status !== "pending") {
          setPaymentStatus(result.data.status);
          setChecking(false);
          return;
        }
      }
      await new Promise((r) => setTimeout(r, 3000));
    }

    setPaymentStatus(statusParam === "pending" ? "pending" : "success");
    setChecking(false);
  }

  const isPending = paymentStatus === "pending";
  const isSuccess = paymentStatus === "success" || paymentStatus === "checking";

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Navbar />

      <main className="flex-1 bg-zinc-50">
        <div className="flex items-center justify-center p-6" style={{ minHeight: "calc(100vh - 64px)" }}>
          <div className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-8 text-center">
            {checking ? (
              <>
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100">
                  <Loader2 className="h-8 w-8 animate-spin text-zinc-500" />
                </div>
                <h1 className="mt-5 text-xl font-bold text-zinc-900">Memverifikasi Pembayaran...</h1>
                <p className="mt-2 text-sm text-zinc-500">Mohon tunggu, kami sedang mengecek status pembayaran Anda</p>
              </>
            ) : isPending ? (
              <>
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
                  <Clock className="h-8 w-8 text-amber-600" />
                </div>
                <h1 className="mt-5 text-xl font-bold text-zinc-900">Menunggu Pembayaran</h1>
                <p className="mt-2 text-sm text-zinc-500 leading-relaxed">
                  Pesanan Anda telah dibuat. Silakan selesaikan pembayaran sesuai instruksi yang diberikan.
                </p>
              </>
            ) : (
              <>
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <h1 className="mt-5 text-xl font-bold text-zinc-900">Pesanan Berhasil!</h1>
                <p className="mt-2 text-sm text-zinc-500 leading-relaxed">
                  Terima kasih telah berbelanja di 22Mart. Pesanan Anda sedang diproses dan akan segera dikirim.
                </p>
              </>
            )}

            {orderId && (
              <div className="mt-6 rounded-lg bg-zinc-50 p-4">
                <p className="text-xs text-zinc-500">Nomor Pesanan</p>
                <p className="mt-1 text-base font-bold text-zinc-900 font-mono">{orderId}</p>
              </div>
            )}

            {!checking && (
              <div className="mt-6 space-y-3">
                <Link href="/produk">
                  <Button className="h-11 w-full gap-2 bg-zinc-900 text-sm font-medium">
                    <ShoppingBag className="h-4 w-4" />
                    Lanjut Belanja
                  </Button>
                </Link>
                <Link href="/riwayat-pesanan">
                  <Button variant="outline" className="h-11 w-full gap-2 text-sm font-medium mt-2">
                    <Package className="h-4 w-4" />
                    Lihat Pesanan Saya
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
