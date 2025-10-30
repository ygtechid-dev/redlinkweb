"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const username = typeof window !== "undefined" ? localStorage.getItem("username") : "";

  useEffect(() => {
    const fetchOrders = async () => {
      const { data, error } = await supabase
        .from("digital_purchases")
        .select("*")
        .eq("username", username)
        .order("created_at", { ascending: false });

      if (error) console.error(error);
      else setOrders(data || []);
      setLoading(false);
    };
    if (username) fetchOrders();
  }, [username]);

  if (loading)
    return <div className="min-h-screen flex items-center justify-center text-gray-500">Loading Orders...</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* LEFT LIST */}
      <div className="w-full md:w-1/2 border-r border-gray-200 bg-white p-6 overflow-y-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Orders</h1>

        {orders.length === 0 ? (
          <p className="text-gray-500">Belum ada transaksi produk digital.</p>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <div
                key={order.id}
                onClick={() => setSelected(order)}
                className={`p-4 rounded-lg shadow-sm cursor-pointer transition border ${
                  selected?.id === order.id ? "border-red-500 bg-red-50" : "border-gray-200 hover:bg-gray-50"
                }`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-gray-800">{order.product_title}</p>
                    <p className="text-sm text-gray-500">{order.order_id}</p>
                  </div>
                  <p
                    className={`text-sm font-medium ${
                      order.payment_status === "paid" ? "text-green-600" : "text-yellow-600"
                    }`}
                  >
                    {order.payment_status.toUpperCase()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* RIGHT DETAIL */}
      <div className="flex-1 bg-gray-100 p-6">
        {selected ? (
          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-2">{selected.product_title}</h2>
            <p className="text-sm text-gray-500 mb-4">{selected.order_id}</p>

            <p className="font-semibold text-red-600 text-lg mb-2">
              Rp{Number(selected.product_price).toLocaleString("id-ID")}
            </p>

            <div className="text-sm text-gray-600 space-y-1">
              <p>Metode: {selected.payment_method}</p>
              <p>Status: {selected.payment_status}</p>
              <p>Dikirim WA: {selected.wa_sent ? "✅ Ya" : "❌ Belum"}</p>
              <p className="text-xs mt-3">
                Dibuat: {new Date(selected.created_at).toLocaleString("id-ID")}
              </p>
            </div>
          </div>
        ) : (
          <div className="text-gray-400 text-center mt-20">Klik order di kiri untuk lihat detailnya.</div>
        )}
      </div>
    </div>
  );
}
