"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function RegisterPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    try {
      if (!agree) return alert("Please agree to the Terms of Use");
      if (password !== confirmPassword)
        return alert("Passwords do not match!");
      if (!username || !password || !phone)
        return alert("Please fill all fields!");

      setLoading(true);

      // Ambil ID user dari localStorage
      const pendingUserID = localStorage.getItem("pendingUserID");
      const email = localStorage.getItem("email");
      const displayName = localStorage.getItem("displayName");

      // Simpan ke tabel profiles
      const { error } = await supabase.from("profiles").insert([
        {
          user_id: pendingUserID,
          username,
          phone,
          full_name: displayName,
          avatar_url: "https://cdn-icons-png.flaticon.com/512/149/149071.png",
        },
      ]);
      if (error) throw error;

      // Simpan ke localStorage
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("username", username);
      localStorage.setItem("user_id", pendingUserID);

      alert("Registration complete! Redirecting to dashboard...");
      router.push("/dashboard");
    } catch (err) {
      console.error(err);
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
          <div>
            <label className="block text-base font-semibold text-gray-700 mb-1">
              Username
            </label>
            <div className="flex items-center">
              <span className="bg-gray-100 px-3 py-3 rounded-l-lg border border-r-0 border-gray-300 text-gray-600">
                redlink.id/
              </span>
              <input
                type="text"
                placeholder="Your Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="flex-1 border border-gray-300 rounded-r-lg px-4 py-3 text-gray-700 focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-base font-semibold text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              placeholder="Your Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-red-500"
            />
          </div>

          <div>
            <label className="block text-base font-semibold text-gray-700 mb-1">
              Confirm Password
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
              Phone
            </label>
            <div className="flex items-center">
              <span className="bg-gray-100 border border-r-0 border-gray-300 px-3 py-3 rounded-l-lg text-gray-600">
                +62
              </span>
              <input
                type="text"
                placeholder="Your Phone Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="flex-1 border border-gray-300 rounded-r-lg px-4 py-3 focus:outline-none focus:border-red-500"
              />
            </div>
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
              <span className="text-red-600 font-semibold hover:underline">
                Terms of Use
              </span>
            </label>
          </div>

          <button
            onClick={handleRegister}
            disabled={loading}
            className="w-full mt-4 bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold py-3 rounded-lg hover:opacity-90 transition"
          >
            {loading ? "Registering..." : "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
}