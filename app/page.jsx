"use client";
import { useEffect, useState } from "react";
import {
  Share2,
  BarChart2,
  Layers,
  ShoppingBag,
  Users,
  Star,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { createClient } from "@supabase/supabase-js";
import UpgradeToProModal from "../../components/UpgradeToProModal";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function DashboardHome() {
  const [data, setData] = useState([]);
  const [profile, setProfile] = useState(null);
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Tarik Dana
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawForm, setWithdrawForm] = useState({
    name: "",
    bank: "",
    accountNumber: "",
  });
  const [sending, setSending] = useState(false);

  const formatIDR = (num) => {
    if (num == null) return "IDR 0";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(num);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const username = localStorage.getItem("username");
        if (!username) {
          console.warn("⚠️ No username found in localStorage");
          setLoading(false);
          return;
        }

        const { data: profileData } = await supabase
          .from("profiles")
          .select(`
            id,
            username,
            phone,
            bio,
            plan,
            avatar_url,
            users:users!profiles_user_id_fkey (
              id,
              display_name,
              email,
              photo_url
            )
          `)
          .eq("username", username)
          .maybeSingle();

        setProfile(profileData);
        setBalance(250000); // dummy saldo

        const dummy = Array.from({ length: 14 }, (_, i) => ({
          date: `${23 + i} Sep`,
          views: Math.floor(Math.random() * 100),
          clicks: Math.floor(Math.random() * 40),
        }));
        setData(dummy);
      } catch (err) {
        console.error("❌ Fetching error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // ✅ Handle Tarik Dana
  const handleWithdraw = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      const { name, bank, accountNumber } = withdrawForm;
      if (!name || !bank || !accountNumber) {
        alert("⚠️ Lengkapi semua data penarikan!");
        setSending(false);
        return;
      }

      const phone = (profile?.phone || "08123456789").replace(/^0/, "62");
      const message = `
💸 *Permintaan Tarik Dana Diterima!*

Halo ${name},

Permintaan penarikan dana kamu ke:
🏦 *${bank}*
💳 *${accountNumber}*
a.n. *${name}*

Sedang diproses dan akan dikirim maksimal *1 hari kerja.*

Terima kasih telah menggunakan *RedLink Affiliate*. 🚀
      `.trim();

      const res = await fetch("https://api.fonnte.com/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "ScSuD6CbrZakniT79zut",
        },
        body: JSON.stringify({ target: phone, message }),
      });

      const result = await res.json();
      console.log("📤 Fonnte result:", result);
      alert("✅ Permintaan penarikan dikirim! Dana akan masuk 1 hari kerja.");
      setShowWithdrawModal(false);
      setWithdrawForm({ name: "", bank: "", accountNumber: "" });
    } catch (err) {
      console.error("❌ Gagal kirim WA:", err);
      alert("Gagal mengirim notifikasi via WhatsApp.");
    } finally {
      setSending(false);
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-500">
        Loading dashboard...
      </div>
    );

  const isPro = profile?.plan?.toLowerCase() === "pro";

  return (
    <div
      className={`min-h-screen ${
        isPro
          ? "bg-gradient-to-br from-red-700 via-red-800 to-black"
          : "bg-[#fff5f5]"
      } text-gray-800 p-4 sm:p-6 lg:p-8 transition-all`}
    >
      <h1
        className={`text-2xl font-bold mb-6 ${
          isPro ? "text-white drop-shadow-lg" : ""
        }`}
      >
        {isPro ? "Welcome back, PRO Member 🎉" : "Home"}
      </h1>

      {/* Top Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Account Card */}
        <div
          className={`lg:col-span-2 ${
            isPro
              ? "bg-gradient-to-br from-red-800 to-red-900 text-white"
              : "bg-white text-gray-800"
          } p-6 rounded-2xl shadow-md flex flex-col justify-between transition-all`}
        >
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4">
            <div className="flex items-center gap-3">
              <img
                src={
                  profile?.avatar_url ||
                  profile?.users?.photo_url ||
                  "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                }
                width={60}
                height={60}
                alt="Avatar"
                className="rounded-full border shadow-sm object-cover"
              />
              <div>
                <div className="flex items-center gap-2">
                  <p
                    className={`font-semibold text-lg uppercase truncate ${
                      isPro ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {profile?.users?.display_name || "RedLink User"}
                  </p>
                  {isPro && (
                    <span className="flex items-center gap-1 bg-yellow-400 text-black text-xs font-semibold px-2 py-0.5 rounded-full shadow">
                      <Star size={12} /> PRO
                    </span>
                  )}
                </div>

                <a
                  href={`https://redlynk.id/${profile?.username || "#"}`}
                  target="_blank"
                  className={`text-sm ${
                    isPro ? "text-yellow-300" : "text-red-600"
                  } hover:underline break-all`}
                >
                  {`https://redlynk.id/${profile?.username || "username"}`}
                </a>
              </div>
            </div>

            {!isPro && (
              <button
                onClick={() => setShowUpgradeModal(true)}
                className="border border-red-600 text-red-600 rounded-full px-4 py-2 text-sm font-semibold hover:bg-red-50 transition w-fit"
              >
                Upgrade to PRO
              </button>
            )}
          </div>
        </div>

        {/* Earnings Card */}
        <div
          className={`${
            isPro
              ? "bg-gradient-to-br from-yellow-400 to-yellow-600 text-black"
              : "bg-gradient-to-br from-red-600 to-red-700 text-white"
          } p-6 rounded-2xl shadow-md relative overflow-hidden`}
        >
          <div
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{
              backgroundImage:
                "radial-gradient(circle at 20% 30%, white 2%, transparent 2%), radial-gradient(circle at 70% 70%, white 2%, transparent 2%)",
              backgroundSize: "100px 100px",
            }}
          />
          <h2 className="text-lg font-semibold mb-2">
            {isPro ? "Your PRO Earnings" : "Your Earnings"}
          </h2>
          <p className="text-xl font-bold mb-2">
            {balance !== null ? formatIDR(balance) : "IDR — — —"}
          </p>
          <p className="text-xs opacity-80 mb-4">
            {balance !== null ? "Updated just now" : "Payout Setting Page"}
          </p>

          {/* 🔹 Tombol Tarik Dana */}
          <button
            onClick={() => setShowWithdrawModal(true)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
              isPro
                ? "bg-black text-yellow-300 hover:bg-gray-900"
                : "bg-white text-red-600 hover:bg-gray-100"
            }`}
          >
            Tarik Dana
          </button>
        </div>
      </div>

      {/* Chart Section (unchanged) */}
      <div
        className={`mt-6 p-4 sm:p-6 rounded-2xl shadow-md overflow-x-auto ${
          isPro ? "bg-white/90 backdrop-blur-lg" : "bg-white"
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-3">
          <h3 className="font-semibold text-gray-800">
            {isPro ? "PRO Analytics — Views & Clicks" : "Total Views & Clicks"}
          </h3>
        </div>

        <div className="w-full h-64 sm:h-72">
          <ResponsiveContainer>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="views"
                stroke={isPro ? "#eab308" : "#f87171"}
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="clicks"
                stroke={isPro ? "#b45309" : "#b91c1c"}
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Withdraw Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-[90%] max-w-md p-6">
            <h2 className="text-lg font-bold mb-4">Tarik Dana</h2>
            <form onSubmit={handleWithdraw} className="space-y-3">
              <input
                type="text"
                placeholder="Nama Pemilik Rekening"
                className="w-full border rounded-lg px-3 py-2 text-sm"
                value={withdrawForm.name}
                onChange={(e) =>
                  setWithdrawForm({ ...withdrawForm, name: e.target.value })
                }
              />
              <input
                type="text"
                placeholder="Nama Bank (misal: BCA)"
                className="w-full border rounded-lg px-3 py-2 text-sm"
                value={withdrawForm.bank}
                onChange={(e) =>
                  setWithdrawForm({ ...withdrawForm, bank: e.target.value })
                }
              />
              <input
                type="text"
                placeholder="Nomor Rekening"
                className="w-full border rounded-lg px-3 py-2 text-sm"
                value={withdrawForm.accountNumber}
                onChange={(e) =>
                  setWithdrawForm({
                    ...withdrawForm,
                    accountNumber: e.target.value,
                  })
                }
              />
              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowWithdrawModal(false)}
                  className="px-4 py-2 rounded-lg border text-gray-700 hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={sending}
                  className={`px-4 py-2 rounded-lg text-white font-semibold ${
                    sending
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-red-500 to-red-600 hover:opacity-90"
                  }`}
                >
                  {sending ? "Mengirim..." : "Kirim Permintaan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Upgrade */}
      <UpgradeToProModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        profile={profile}
      />
    </div>
  );
}
