"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function UpgradeToProModal({ isOpen, onClose, profile }) {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [qrUrl, setQrUrl] = useState(null);
  const [checkoutUrl, setCheckoutUrl] = useState(null);
  const [amount, setAmount] = useState(null);

  if (!isOpen) return null;

  // 🔹 Fungsi upgrade ke Tripay (tanpa insert DB)
  const handleUpgrade = async (type = "monthly") => {
    try {
      setLoading(true);
      setErrorMsg(null);

      const amountValue = type === "yearly" ? 900000 : 90000;
      const orderId = `PRO-${type}-${Date.now()}`;

      const response = await fetch(`http://localhost:8787/api/tripay/createRL`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          method: "QRIS",
          amount: amountValue,
          name: profile?.users?.display_name || "RedLink User",
          email: profile?.users?.email || "user@redlynk.id",
          phone: profile?.phone || "08123456789",
          orderId,
          user_id: profile?.id,
        }),
      });

      const data = await response.json();
      console.log("📦 Response API Ditokoku:", data);

      if (data?.qr_url) {
        setQrUrl(data.qr_url);
        setCheckoutUrl(data.checkout_url);
        setAmount(amountValue);
      } else {
        setErrorMsg("Gagal mendapatkan QRIS dari Tripay.");
      }
    } catch (error) {
      console.error("❌ Error upgrade:", error);
      setErrorMsg("Terjadi kesalahan saat membuat transaksi.");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Fungsi cek status manual
  const handleCheckPayment = async () => {
    alert("🔎 Kami akan memverifikasi pembayaran Anda...");
    await supabase
      .from("profiles")
      .update({ plan: "Pro" })
      .eq("id", profile?.id);
    alert("✅ Pembayaran dikonfirmasi! Akun Anda telah menjadi PRO 🎉");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg relative overflow-y-auto max-h-[90vh]">
        {!qrUrl ? (
          <>
            {/* Header */}
            <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">
              Upgrade to <span className="text-red-600">RedLink PRO 🚀</span>
            </h2>
            <p className="text-center text-gray-500 mb-6">
              Nikmati semua fitur eksklusif, analitik lengkap, dan tampilan profesional.
            </p>

            {/* Feature List */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              {[
                "Analitik Kunjungan",
                "Tautan Tak Terbatas",
                "Kustom Domain",
                "Tanpa Watermark",
                "Dukungan Prioritas",
                "Monetisasi",
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-green-500">✔️</span>
                  <span className="text-gray-700 text-sm">{feature}</span>
                </div>
              ))}
            </div>

            {/* Harga & Tombol */}
            <div className="space-y-3">
              <button
                onClick={() => handleUpgrade("monthly")}
                disabled={loading}
                className="w-full bg-red-600 text-white font-semibold py-3 rounded-xl hover:bg-red-700 transition disabled:opacity-60"
              >
                {loading ? "Memproses..." : "Upgrade Bulanan - Rp90.000"}
              </button>

              <button
                onClick={() => handleUpgrade("yearly")}
                disabled={loading}
                className="w-full bg-gradient-to-r from-red-700 to-red-900 text-white font-semibold py-3 rounded-xl hover:opacity-90 transition disabled:opacity-60"
              >
                {loading ? "Memproses..." : "Upgrade Tahunan - Rp900.000"}
              </button>
            </div>

            {/* Error message */}
            {errorMsg && (
              <p className="text-red-500 text-sm mt-4 text-center">{errorMsg}</p>
            )}

            {/* Close button */}
            <button
              onClick={onClose}
              className="mt-8 w-full border border-gray-300 py-2 rounded-xl text-gray-700 font-medium hover:bg-gray-50"
            >
              Batal
            </button>
          </>
        ) : (
          <>
            {/* QRIS Display */}
            <h2 className="text-2xl font-bold text-gray-800 text-center mb-4">
              Pembayaran <span className="text-red-600">RedLink PRO</span>
            </h2>
            <p className="text-center text-gray-600 mb-6">
              💸 Silakan <strong>scan QRIS berikut</strong> untuk menyelesaikan pembayaran sebesar:
            </p>
            <p className="text-center text-3xl font-bold text-red-700 mb-6">
              Rp{amount?.toLocaleString("id-ID")}
            </p>

            <div className="flex justify-center mb-6">
              <img
                src={qrUrl}
                alt="QRIS Pembayaran"
                className="w-64 h-64 rounded-lg shadow-md border p-2 bg-white"
              />
            </div>

            <p className="text-center text-gray-500 mb-4 text-sm">
              Setelah melakukan pembayaran, klik tombol di bawah ini 👇
            </p>

            <button
              onClick={handleCheckPayment}
              className="w-full bg-green-600 text-white font-semibold py-3 rounded-xl hover:bg-green-700 transition"
            >
              ✅ Saya Sudah Transfer
            </button>

            {/* <a
              href={checkoutUrl}
              target="_blank"
              className="block text-center mt-4 text-sm text-blue-600 underline hover:text-blue-800"
            >
              Atau buka halaman pembayaran Tripay
            </a> */}

            <button
              onClick={onClose}
              className="mt-6 w-full border border-gray-300 py-2 rounded-xl text-gray-700 font-medium hover:bg-gray-50"
            >
              Tutup
            </button>
          </>
        )}
      </div>
    </div>
  );
}
