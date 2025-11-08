"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function RedlinkWebBuilderLanding() {
  const [username, setUsername] = useState(null);
  const [builders, setBuilders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [projectName, setProjectName] = useState("");

  const API_BASE = "https://api.redlink.web.id";

  useEffect(() => {
    const u = localStorage.getItem("username");
    if (!u) {
      setLoading(false);
      return;
    }
    setUsername(u);
    fetchBuilders(u);
  }, []);

  // ✅ Ambil semua builder milik user
  const fetchBuilders = async (u) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("builders")
        .select("*")
        .eq("username", u)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setBuilders(data || []);
    } catch (err) {
      console.error("❌ Gagal ambil data builder:", err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Buat builder baru
  const createBuilderInstance = async () => {
    if (!username) return alert("Username belum ditemukan.");
    if (!projectName.trim()) return alert("Isi nama project dulu.");

    setCreating(true);
    try {
      const randomPort = 6800 + Math.floor(Math.random() * 200);
      const newUrl = `http://84.247.151.106:${randomPort}`;

      // Simpan ke Supabase
      const { data, error } = await supabase
        .from("builders")
        .insert([
          {
            username,
            project_name: projectName.trim(),
            builder_port: randomPort,
            builder_url: newUrl,
            status: "creating",
          },
        ])
        .select()
        .single();

      if (error) throw error;

      // Jalankan Docker container via API backend
      await fetch(`${API_BASE}/api/builder/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, port: randomPort }),
      });

      setBuilders((prev) => [data, ...prev]);
      setProjectName("");
      alert(`✅ Builder '${projectName}' berhasil dibuat!`);
    } catch (err) {
      console.error("❌ Gagal membuat builder:", err);
      alert("Gagal membuat builder baru. Hubungi admin.");
    } finally {
      setCreating(false);
    }
  };

  // ✅ URL hasil publish
  const getPublishedUrl = (b) =>
    `https://sites.redlink.web.id/sites/${b.username}/${b.unique_id || b.id}/index.html`;
  
  // ✅ Saat klik “Lihat Website”
  const handleViewWebsite = async (b) => {
    const publicUrl = getPublishedUrl(b);

    try {
      // 1️⃣ Cek dulu apakah file sudah ada di server
      const check = await fetch(publicUrl, { method: "HEAD" });

      if (check.ok) {
        console.log("✅ Website sudah ada, langsung buka.");
        return window.open(publicUrl, "_blank");
      }

      // 2️⃣ Kalau belum ada → publish dulu
      const confirmPublish = confirm(
        `Website untuk ${b.project_name} belum dipublish.\nIngin publish sekarang?`
      );
      if (!confirmPublish) return;

      const publishRes = await fetch(`${API_BASE}/api/builder/publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: b.username,
          builder_id: b.unique_id || b.id,
        }),
      });

      const result = await publishRes.json();

      if (result.success) {
        alert("✅ Website berhasil dipublish! Membuka halaman...");
        window.open(result.public_url, "_blank");
      } else {
        console.error("❌ Publish gagal:", result);
        alert("Gagal mempublish website. Lihat log backend untuk detailnya.");
      }
    } catch (err) {
      console.error("🔥 Error saat cek/publish:", err);
      alert("Gagal memeriksa atau mempublish website.");
    }
  };

  // ========================== UI ==========================

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loading...
      </div>
    );

  if (!username)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-700">
          ❌ Tidak ada username di localStorage
        </p>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-3xl font-bold text-red-600 text-center mb-6">
        Hi, {username} 👋
      </h1>

      {/* Form Buat Builder Baru */}
      <div className="bg-white p-6 rounded-2xl shadow-md max-w-md mx-auto mb-8">
        <h2 className="text-lg font-semibold mb-3 text-center">
          🧱 Buat Web Builder Baru
        </h2>
        <input
          type="text"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          placeholder="Masukkan nama project (contoh: KopiSantai)"
          className="w-full border rounded-lg px-3 py-2 mb-4 text-sm"
        />
        <button
          onClick={createBuilderInstance}
          disabled={creating}
          className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white py-3 rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-60"
        >
          {creating ? "Membuat..." : "🚀 Buat Builder"}
        </button>
      </div>

      {/* Daftar Builder */}
      <div className="max-w-3xl mx-auto space-y-4">
        {builders.length === 0 ? (
          <p className="text-center text-gray-600">
            Belum ada builder dibuat.
          </p>
        ) : (
          builders.map((b) => (
            <div
              key={b.id}
              className="bg-white p-5 rounded-xl shadow-md flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3"
            >
              <div>
                <p className="font-semibold text-gray-800 text-lg">
                  {b.project_name || "Tanpa Nama"}
                </p>
                <p className="text-gray-500 text-sm">
                  Status:{" "}
                  <span
                    className={`${
                      b.status === "running"
                        ? "text-green-600"
                        : "text-yellow-600"
                    }`}
                  >
                    {b.status}
                  </span>
                </p>
                <p className="text-xs text-gray-400">
                  Port: {b.builder_port} | ID: {b.unique_id || b.id}
                </p>
              </div>

              <div className="flex gap-2">
                <a
                  href={b.builder_url}
                  target="_blank"
                  className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90"
                >
                  ✏️ Buka Builder
                </a>
                <button
                  onClick={() => handleViewWebsite(b)}
                  className="bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700"
                >
                  🌍 Lihat Website
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
