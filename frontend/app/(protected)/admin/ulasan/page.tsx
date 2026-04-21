"use client";

import { Star, MoreHorizontal } from "lucide-react";

const reviews = [
  { id: 1, customer: "Budi S.", product: "Apel Fuji Premium", rating: 5, comment: "Buahnya segar dan manis, pengiriman cepat!", date: "16 Apr 2026" },
  { id: 2, customer: "Ani W.", product: "Daging Sapi", rating: 4, comment: "Kualitas bagus, tapi bisa lebih cepat pengirimannya.", date: "15 Apr 2026" },
  { id: 3, customer: "Dian P.", product: "Susu Segar", rating: 5, comment: "Produk selalu fresh, recommended!", date: "14 Apr 2026" },
  { id: 4, customer: "Eko P.", product: "Roti Gandum", rating: 3, comment: "Rotinya agak keras, mungkin sudah lama.", date: "13 Apr 2026" },
];

export default function KelolaUlasanPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-semibold">Kelola Ulasan</h1>
        <p className="text-sm text-zinc-500">{reviews.length} ulasan</p>
      </div>

      <div className="space-y-3">
        {reviews.map((review) => (
          <div key={review.id} className="rounded-lg border border-zinc-200 bg-white p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-900 text-xs font-medium text-white">
                  {review.customer.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-medium">{review.customer}</p>
                  <p className="text-xs text-zinc-500">{review.product}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`h-3.5 w-3.5 ${i < review.rating ? "fill-amber-400 text-amber-400" : "text-zinc-200"}`} />
                  ))}
                </div>
                <button className="rounded-md p-1 hover:bg-zinc-100">
                  <MoreHorizontal className="h-4 w-4 text-zinc-500" />
                </button>
              </div>
            </div>
            <p className="mt-3 text-sm text-zinc-600">{review.comment}</p>
            <p className="mt-2 text-xs text-zinc-400">{review.date}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
