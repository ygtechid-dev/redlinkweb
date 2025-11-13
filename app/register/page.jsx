"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { trackReferral, getReferralCodeFromCookie, clearReferralCookie } from "@/lib/referral-utils";

export default function RegisterPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);
  const [referralCode, setReferralCode] = useState(null);

  // ✅ Ambil referral code dari cookie saat component mount
  useEffect(() => {
    const refCode = getReferralCodeFromCookie();
    if (refCode) {
      setReferralCode(refCode);
      console.log("✅ Referral code detected:", refCode);
    }
  }, []);

  const handleRegister = async () => {
    try {
      if (!agree) return alert("Please agree to the Terms of Use");
      if (password !== confirmPassword)
        return alert("Passwords do not match!");
      if (!username || !password || !phone)
        return alert("Please fill all fields!");

      setLoading(true);

      // Validasi username format
      const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
      if (!usernameRegex.test(username)) {
        alert("Username harus 3-20 karakter, hanya huruf, angka, dan underscore");
        setLoading(false);
        return;
      }

      // Cek apakah username sudah digunakan
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("username")
        .eq("username", username)
        .single();

      if (existingProfile) {
        alert("Username sudah digunakan. Pilih username lain.");
        setLoading(false);
        return;
      }

      // Ambil ID user dari localStorage
      const pendingUserID = localStorage.getItem("pendingUserID");
      const email = localStorage.getItem("email");
      const displayName = localStorage.getItem("displayName");

      // Simpan ke tabel profiles dengan balance = 0
      const { error } = await supabase.from("profiles").insert([
        {
          user_id: pendingUserID,
          username,
          phone: phone.startsWith("0") ? "62" + phone.substring(1) : phone, // Format nomor
          full_name: displayName,
          avatar_url: "https://cdn-icons-png.flaticon.com/512/149/149071.png",
          plan: "Free",
          balance: 0, // ✅ Tambahkan kolom balance
        },
      ]);

      if (error) throw error;

      // ✅ Track referral jika ada
      if (referralCode) {
        console.log("🔄 Processing referral tracking...");
        const result = await trackReferral(username, referralCode);
        
        if (result.success) {
          console.log("✅ Referral tracked successfully!");
          console.log(`💰 Referrer ${referralCode} earned commission!`);
          // Clear cookie setelah berhasil digunakan
          clearReferralCookie();
        } else {
          console.warn("⚠️ Failed to track referral:", result.message);
        }
      } else {
        console.log("ℹ️ No referral code found");
      }

      // Simpan ke localStorage
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("username", username);
      localStorage.setItem("user_id", pendingUserID);

      // Tampilkan pesan sukses dengan info referral
      if (referralCode) {
        alert(`🎉 Registration complete! Thanks for joining via @${referralCode}'s referral link!`);
      } else {
        alert("🎉 Registration complete! Redirecting to dashboard...");
      }

      router.push("/dashboard");
    } catch (err) {
      console.error("❌ Registration error:", err);
      alert("Error during registration: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-red-600 to-red-800 relative overflow-hidden p-4">
      <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-red-300/30 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-red-500/30 rounded-full blur-[120px]" />

      <img
        src="/images/redlynk.png"
        alt="RedLink Logo"
        className="w-[220px] h-auto mb-8 drop-shadow-md"
      />

      <div className="bg-white shadow-2xl rounded-2xl w-full max-w-md z-10 overflow-hidden">
        <div className="bg-gradient-to-r from-red-600 to-red-700 py-4 text-center text-white font-semibold">
          Please fill in all the mandatory fields below
        </div>

        <div className="p-8 space-y-5">
          {/* ✅ Referral Badge - Tampilkan jika ada referral code */}
          {referralCode && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl p-4 mb-4 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="bg-green-500 p-2 rounded-full">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-green-800">
                    🎉 Direferensikan oleh
                  </p>
                  <p className="text-lg font-bold text-green-900">
                    @{referralCode}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="block text-base font-semibold text-gray-700 mb-1">
              Username <span className="text-red-600">*</span>
            </label>
            <div className="flex items-center">
              <span className="bg-gray-100 px-3 py-3 rounded-l-lg border border-r-0 border-gray-300 text-gray-600">
                redlink.web.id/
              </span>
              <input
                type="text"
                placeholder="username"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase())}
                className="flex-1 border border-gray-300 rounded-r-lg px-4 py-3 text-gray-700 focus:outline-none focus:border-red-500"
                pattern="[a-zA-Z0-9_]{3,20}"
                title="3-20 karakter, hanya huruf, angka, dan underscore"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              3-20 karakter, hanya huruf, angka, dan underscore (_)
            </p>
          </div>

          <div>
            <label className="block text-base font-semibold text-gray-700 mb-1">
              Password <span className="text-red-600">*</span>
            </label>
            <input
              type="password"
              placeholder="Your Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-red-500"
              minLength={6}
            />
            <p className="text-xs text-gray-500 mt-1">Minimal 6 karakter</p>
          </div>

          <div>
            <label className="block text-base font-semibold text-gray-700 mb-1">
              Confirm Password <span className="text-red-600">*</span>
            </label>
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-red-500"
            />
          </div>

          <div>
            <label className="block text-base font-semibold text-gray-700 mb-1">
              Phone <span className="text-red-600">*</span>
            </label>
            <div className="flex items-center">
              <span className="bg-gray-100 border border-r-0 border-gray-300 px-3 py-3 rounded-l-lg text-gray-600">
                +62
              </span>
              <input
                type="text"
                placeholder="8123456789"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="flex-1 border border-gray-300 rounded-r-lg px-4 py-3 focus:outline-none focus:border-red-500"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Masukkan nomor tanpa 0 di depan (contoh: 8123456789)
            </p>
          </div>

          <div className="flex items-start gap-2">
            <input
              type="checkbox"
              checked={agree}
              onChange={() => setAgree(!agree)}
              className="w-4 h-4 mt-1 accent-red-600"
            />
            <label className="text-sm text-gray-600">
              I agree to the{" "}
              <span className="text-red-600 font-semibold hover:underline cursor-pointer">
                Terms of Use
              </span>
            </label>
          </div>

          <button
            onClick={handleRegister}
            disabled={loading}
            className="w-full mt-4 bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold py-3 rounded-lg hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Registering...
              </span>
            ) : (
              "Confirm"
            )}
          </button>

          {/* ✅ Info Referral Benefit */}
          {referralCode && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
              <p className="text-xs text-blue-800 text-center">
                💡 <strong>Bonus:</strong> Referrer Anda akan mendapatkan komisi dari registrasi ini!
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 text-center text-white/80 text-sm">
        <p>
          Sudah punya akun?{" "}
          <button
            onClick={() => router.push("/login")}
            className="font-semibold hover:underline"
          >
            Login di sini
          </button>
        </p>
      </div>
    </div>
  );
}