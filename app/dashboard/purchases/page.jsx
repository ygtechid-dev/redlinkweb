"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function MyPurchasesPage() {
  const [purchases, setPurchases] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const username =
    typeof window !== "undefined" ? localStorage.getItem("username") : "";

  // ✅ Fetch data pembelian user
  useEffect(() => {
    const fetchPurchases = async () => {
      if (!username) return;
      const { data, error } = await supabase
        .from("digital_purchases")
        .select("*")
        .eq("username", username)
        .order("created_at", { ascending: false });

      if (error) console.error("Error fetching purchases:", error);
      else setPurchases(data || []);
      setLoading(false);
    };

    fetchPurchases();
  }, [username]);

  if (loading)
    return (
      <div className="min-h-screen flex justify-center items-center text-gray-500">
        Loading purchased contents...
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* LEFT: List of purchases */}
      <div className="w-full md:w-1/2 bg-white border-r border-gray-200 p-6 overflow-y-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          Purchased Contents
        </h1>

        {purchases.length === 0 ? (
          <div className="text-gray-400 text-center py-12">
            Kamu belum membeli konten digital apa pun.
          </div>
        ) : (
          <div className="space-y-3">
            {purchases.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelected(item)}
                className={`p-4 rounded-lg shadow-sm cursor-pointer border transition ${
                  selected?.id === item.id
                    ? "border-red-500 bg-red-50"
                    : "border-gray-200 hover:bg-gray-50"
                }`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-gray-800">
                      {item.product_title}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(item.created_at).toLocaleString("id-ID")}
                    </p>
                  </div>
                  <span
                    className={`text-sm font-semibold ${
                      item.payment_status === "paid"
                        ? "text-green-600"
                        : "text-yellow-600"
                    }`}
                  >
                    {item.payment_status.toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* RIGHT: Detail View */}
      <div className="flex-1 bg-gray-100 p-6">
        {selected ? (
          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              {selected.product_title}
            </h2>
            <p className="text-gray-500 text-sm mb-4">{selected.order_id}</p>

            <p className="text-red-600 font-semibold text-lg mb-4">
              Rp{Number(selected.product_price).toLocaleString("id-ID")}
            </p>

            <div className="space-y-2 text-sm text-gray-700">
              <p>
                <span className="font-semibold">Metode:</span>{" "}
                {selected.payment_method}
              </p>
              <p>
                <span className="font-semibold">Status:</span>{" "}
                {selected.payment_status}
              </p>
              <p>
                <span className="font-semibold">Dikirim ke WA:</span>{" "}
                {selected.wa_sent ? "✅ Ya" : "❌ Belum"}
              </p>
              <p>
                <span className="font-semibold">Tanggal:</span>{" "}
                {new Date(selected.created_at).toLocaleString("id-ID")}
              </p>
            </div>

            {/* Tombol akses produk */}
            {selected.payment_status === "paid" && (
              <div className="mt-6">
                <a
                  href={selected.description || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block bg-gradient-to-r from-red-500 to-rose-600 text-white text-center py-3 rounded-xl font-semibold hover:opacity-90 transition"
                >
                  Akses Produk Digital di WA anda
                </a>
                <p className="text-xs text-gray-500 mt-3 text-center">
                  ⚠️ Link ini bersifat pribadi dan tidak boleh disebarluaskan.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-gray-400 text-center mt-20">
            Pilih salah satu pembelian di kiri untuk lihat detailnya.
          </div>
        )}
      </div>
    </div>
  );
}
