"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { auth, googleProvider } from "@/lib/firebase";
import { supabase } from "@/lib/supabase";
import { signInWithPopup } from "firebase/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // 🔹 LOGIN DENGAN GOOGLE
  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const { uid, email, displayName, photoURL } = user;

      // 1️⃣ Simpan user di tabel users (atau update kalau sudah ada)
      const { data: userData, error: userError } = await supabase
        .from("users")
        .upsert(
          {
            firebase_uid: uid,
            email,
            display_name: displayName,
            photo_url: photoURL,
          },
          { onConflict: "firebase_uid" }
        )
        .select("id")
        .single();

      if (userError) throw userError;
      const userId = userData.id;

      // 2️⃣ Cek apakah sudah punya profil
      const { data: profile } = await supabase
        .from("profiles")
        .select("username")
        .eq("user_id", userId)
        .maybeSingle();

      // 3️⃣ Kalau belum ada → arahkan ke register
      if (!profile) {
        localStorage.setItem("pendingUserID", userId);
        localStorage.setItem("email", email);
        localStorage.setItem("displayName", displayName);
        router.push("/register");
      } else {
        // 🔹 Simpan ke localStorage supaya Dashboard bisa baca
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("username", profile.username);
        localStorage.setItem("user_id", userId);
        router.push("/dashboard");
      }
    } catch (err) {
      console.error("❌ Google login failed:", err);
      alert("Google login failed: " + err.message);
    }
  };

  // 🔹 LOGIN DUMMY MANUAL
  const handleDummyLogin = () => {
    if (email === "admin@redlink.id" && password === "123456") {
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("username", "testygtech");
      localStorage.setItem("user_id", "dummy-12345");
      router.push("/dashboard");
    } else {
      alert("Invalid credentials. Use admin@redlink.id / 123456");
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-red-600 to-red-800 relative overflow-hidden">
      <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-red-300/30 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-red-500/30 rounded-full blur-[120px]" />

      <img
        src="/images/redlynk.png"
        alt="RedLink Logo"
        className="w-[220px] h-auto mb-8 drop-shadow-md"
      />

      <div className="bg-white rounded-2xl shadow-2xl p-10 w-[420px] z-10">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Sign in to your account
        </h2>

        <input
          type="text"
          placeholder="Your username or email"
          className="w-full border border-gray-300 rounded-lg px-4 py-3 mb-4"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Your password"
          className="w-full border border-gray-300 rounded-lg px-4 py-3 mb-6"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleDummyLogin}
          className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold py-3 rounded-lg mb-5 hover:opacity-90"
        >
          Sign In
        </button>

        <div className="flex items-center my-5">
          <div className="flex-grow border-t border-gray-200"></div>
          <span className="mx-3 text-gray-400 text-sm">or</span>
          <div className="flex-grow border-t border-gray-200"></div>
        </div>

        <button
          onClick={handleGoogleLogin}
          className="w-full border border-gray-300 py-3 rounded-lg flex items-center justify-center gap-3 hover:bg-gray-50 transition"
        >
          <img
            src="https://www.svgrepo.com/show/355037/google.svg"
            alt="Google"
            className="w-5 h-5"
          />
          <span className="text-gray-700 font-medium">
            Continue with Google
          </span>
        </button>

        <p className="text-center text-sm text-gray-600 mt-6">
          Don't have an account?{" "}
          <button
            onClick={handleGoogleLogin}
            className="text-red-600 font-semibold hover:underline"
          >
            Register
          </button>
        </p>
      </div>
    </div>
  );
}