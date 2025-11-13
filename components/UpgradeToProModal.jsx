"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { processProUpgradeReferral } from "@/lib/referral-utils";
import { X, Sparkles, Check, Zap, Crown, Star, Trophy } from "lucide-react";

export default function UpgradeToProModal({ isOpen, onClose, profile }) {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [qrUrl, setQrUrl] = useState(null);
  const [checkoutUrl, setCheckoutUrl] = useState(null);
  const [amount, setAmount] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
  const [orderId, setOrderId] = useState(null);

  if (!isOpen) return null;

  // 🔹 Buat transaksi Tripay
  const handleUpgrade = async (type = "monthly") => {
    try {
      setLoading(true);
      setErrorMsg(null);
      setSelectedType(type);

      const amountValue = type === "yearly" ? 900000 : 90000;
      const orderIdValue = `PRO-${type}-${Date.now()}`;
      setOrderId(orderIdValue);

      const response = await fetch(`https://api.ditokoku.id/api/tripay/createRL`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          method: "QRIS",
          amount: amountValue,
          name: profile?.users?.display_name || "RedLink User",
          email: profile?.users?.email || "user@redlink.web.id",
          phone: profile?.phone || "08123456789",
          orderId: orderIdValue,
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

  // 🔹 Cek status pembayaran dan update ke Supabase + Process Referral
  const handleCheckPayment = async () => {
    try {
      setLoading(true);
      
      // 1. Hitung expiry date
      const now = new Date();
      const expiry = new Date();

      if (selectedType === "yearly") {
        expiry.setFullYear(now.getFullYear() + 1);
      } else {
        expiry.setMonth(now.getMonth() + 1);
      }

      // 2. Update profile ke Pro
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          plan: "Pro",
          pro_valid_until: expiry.toISOString(),
        })
        .eq("id", profile?.id);

      if (updateError) throw updateError;

      // 3. Process referral earnings (50% untuk Pro upgrade)
      const referralResult = await processProUpgradeReferral(
        profile.username,
        amount // Gunakan amount yang sebenarnya dibayar
      );

      if (referralResult.success) {
        console.log(
          `✅ Referral earning processed for ${referralResult.referrer}: Rp${referralResult.amount}`
        );
      } else {
        console.log("ℹ️ No referrer found or already processed");
      }

      // 4. Kirim notifikasi WA (optional)
      const phone = (profile?.phone || "").replace(/^0/, "62");
      if (phone && phone !== "62") {
        try {
          await fetch("https://api.fonnte.com/send", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: "ScSuD6CbrZakniT79zut",
            },
            body: JSON.stringify({
              target: phone,
              message: `🎉 *Selamat ${profile?.users?.display_name || 'User'}!*\n\nAkun RedLink kamu sekarang adalah *PRO MEMBER* 👑\n\nNikmati semua fitur premium:\n✅ Analytics lengkap\n✅ Unlimited links\n✅ Custom domain\n✅ Tanpa watermark\n✅ Priority support\n\nTerima kasih sudah upgrade! 🚀\n\n_Valid until: ${expiry.toLocaleDateString('id-ID')}_`,
            }),
          });
        } catch (waError) {
          console.warn("⚠️ WhatsApp notification failed:", waError);
        }
      }

      alert("✅ Pembayaran dikonfirmasi! Akun Anda telah menjadi PRO 🎉");
      onClose();
      window.location.reload(); // Refresh untuk update UI
    } catch (error) {
      console.error("❌ Error check payment:", error);
      setErrorMsg("Gagal memverifikasi pembayaran. Silakan hubungi support.");
    } finally {
      setLoading(false);
    }
  };

  const proFeatures = [
    { icon: "📊", text: "Analytics Lengkap" },
    { icon: "🔗", text: "Unlimited Links" },
    { icon: "🌐", text: "Custom Domain" },
    { icon: "🎨", text: "Advanced Customization" },
    { icon: "⚡", text: "Priority Support" },
    { icon: "💰", text: "50% Referral Commission" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg relative overflow-hidden max-h-[90vh] overflow-y-auto">
        {!qrUrl ? (
          <>
            {/* Header with gradient */}
            <div className="bg-gradient-to-br from-red-600 via-red-700 to-red-800 p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-yellow-400/10 rounded-full blur-3xl" />
              
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-white/80 hover:text-white transition z-10"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="relative z-10 text-center">
                <div className="bg-yellow-400 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Crown className="w-8 h-8 text-red-700" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-2">
                  Upgrade ke PRO
                </h2>
                <p className="text-white/90 text-sm">
                  Unlock semua fitur premium RedLink
                </p>
              </div>
            </div>

            {/* Content */}
            <div className="p-8">
              {/* Features Grid */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                {proFeatures.map((feature, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 bg-gradient-to-br from-gray-50 to-white p-3 rounded-xl border border-gray-100"
                  >
                    <span className="text-2xl">{feature.icon}</span>
                    <span className="text-sm font-medium text-gray-700">
                      {feature.text}
                    </span>
                  </div>
                ))}
              </div>

              {/* Pricing Options */}
              <div className="space-y-4 mb-6">
                {/* Monthly */}
                <button
                  onClick={() => handleUpgrade("monthly")}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-4 rounded-xl transition-all shadow-lg hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center justify-between px-4">
                    <div className="text-left">
                      <div className="text-lg">Bulanan</div>
                      <div className="text-xs opacity-80">Perpanjangan otomatis</div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl">Rp90.000</div>
                      <div className="text-xs opacity-80">/bulan</div>
                    </div>
                  </div>
                </button>

                {/* Yearly - Popular */}
                <div className="relative">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-yellow-400 to-orange-400 text-black text-xs font-bold px-4 py-1 rounded-full flex items-center gap-1 shadow-lg">
                    <Star className="w-3 h-3" />
                    HEMAT 17%
                  </div>
                  <button
                    onClick={() => handleUpgrade("yearly")}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-red-700 to-red-900 hover:from-red-800 hover:to-black text-white font-bold py-4 rounded-xl transition-all shadow-lg hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed border-2 border-yellow-400"
                  >
                    <div className="flex items-center justify-between px-4">
                      <div className="text-left">
                        <div className="text-lg flex items-center gap-2">
                          Tahunan
                          <Trophy className="w-5 h-5 text-yellow-400" />
                        </div>
                        <div className="text-xs opacity-80">Hemat Rp180.000!</div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl">Rp900.000</div>
                        <div className="text-xs opacity-80 line-through">Rp1.080.000</div>
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {errorMsg && (
                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-3 mb-4">
                  <p className="text-sm text-red-800 text-center">{errorMsg}</p>
                </div>
              )}

              {/* Loading State */}
              {loading && (
                <div className="text-center py-4">
                  <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Membuat transaksi...</p>
                </div>
              )}

              {/* Cancel Button */}
              <button
                onClick={onClose}
                disabled={loading}
                className="w-full border-2 border-gray-300 hover:bg-gray-50 py-3 rounded-xl text-gray-700 font-semibold transition disabled:opacity-60"
              >
                Batal
              </button>

              {/* Info */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-xs text-gray-500 text-center">
                  💳 Pembayaran aman menggunakan QRIS
                </p>
                <p className="text-xs text-gray-500 text-center mt-1">
                  Dengan upgrade, Anda menyetujui{" "}
                  <a href="#" className="text-red-600 hover:underline">
                    Terms & Conditions
                  </a>
                </p>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Payment Screen */}
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-6 text-white text-center">
              <div className="bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                <Zap className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold mb-1">Pembayaran PRO</h2>
              <p className="text-white/90 text-sm">
                Scan QRIS untuk menyelesaikan pembayaran
              </p>
            </div>

            <div className="p-8">
              {/* Amount */}
              <div className="text-center mb-6">
                <p className="text-gray-600 text-sm mb-1">Total Pembayaran</p>
                <p className="text-4xl font-bold text-red-700 mb-1">
                  Rp{amount?.toLocaleString("id-ID")}
                </p>
                <p className="text-xs text-gray-500">
                  {selectedType === "yearly" ? "Paket Tahunan" : "Paket Bulanan"}
                </p>
              </div>

              {/* QR Code */}
              <div className="flex justify-center mb-6">
                <div className="bg-white p-4 rounded-2xl shadow-xl border-4 border-red-100">
                  <img
                    src={qrUrl}
                    alt="QRIS Pembayaran"
                    className="w-64 h-64 rounded-lg"
                  />
                </div>
              </div>

              {/* Instructions */}
              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mb-6">
                <p className="text-sm text-blue-900 font-semibold mb-2">
                  📱 Cara Bayar:
                </p>
                <ol className="text-xs text-blue-800 space-y-1 list-decimal list-inside">
                  <li>Buka aplikasi e-wallet/m-banking</li>
                  <li>Pilih menu Scan QRIS</li>
                  <li>Scan QR code di atas</li>
                  <li>Konfirmasi pembayaran</li>
                  <li>Klik tombol "Saya Sudah Transfer"</li>
                </ol>
              </div>

              {/* Order ID */}
              <div className="bg-gray-50 rounded-xl p-3 mb-6">
                <p className="text-xs text-gray-600 text-center">
                  Order ID: <span className="font-mono font-semibold">{orderId}</span>
                </p>
              </div>

              {/* Confirm Button */}
              <button
                onClick={handleCheckPayment}
                disabled={loading}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Memverifikasi...
                  </>
                ) : (
                  <>
                    <Check className="w-5 h-5" />
                    Saya Sudah Transfer
                  </>
                )}
              </button>

              {/* Error Message */}
              {errorMsg && (
                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-3 mt-4">
                  <p className="text-sm text-red-800 text-center">{errorMsg}</p>
                </div>
              )}

              {/* Cancel */}
              <button
                onClick={onClose}
                disabled={loading}
                className="mt-4 w-full border-2 border-gray-300 hover:bg-gray-50 py-3 rounded-xl text-gray-700 font-semibold transition disabled:opacity-60"
              >
                Batal / Tutup
              </button>

              {/* Warning */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-xs text-gray-500 text-center">
                  ⚠️ Jangan tutup halaman ini sebelum menyelesaikan pembayaran
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}