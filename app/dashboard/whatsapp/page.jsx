"use client";
import { useState } from "react";
import { Loader2, Send, MessageSquare } from "lucide-react";

export default function WhatsAppBroadcastPage() {
  const [numbers, setNumbers] = useState("");
  const [message, setMessage] = useState("Halo! Ini pesan broadcast dari RedLink 🚀");
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState(null);
  const [preview, setPreview] = useState(false);

  // ✅ Fungsi kirim broadcast ke Fonnte
  const handleSend = async () => {
    const token = "ScSuD6CbrZakniT79zut";
    if (!numbers || !message) {
      alert("Nomor dan pesan wajib diisi!");
      return;
    }

    const list = numbers
      .split(",")
      .map((num) => num.trim().replace(/^0/, "62"))
      .filter((n) => n);

    if (list.length === 0) {
      alert("Masukkan minimal satu nomor WhatsApp!");
      return;
    }

    setSending(true);
    setStatus(null);

    try {
      const response = await fetch("https://api.fonnte.com/send", {
        method: "POST",
        headers: {
          Authorization: token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          target: list.join(","), // Bisa multiple numbers
          message,
        }),
      });

      const result = await response.json();
      console.log("📤 Fonnte Result:", result);

      if (result?.status === true || result?.status === "true") {
        setStatus(`✅ Broadcast berhasil dikirim ke ${list.length} nomor`);
      } else {
        setStatus(`⚠️ Gagal: ${result?.reason || "Unknown error"}`);
      }
    } catch (err) {
      console.error("❌ Error Fonnte:", err);
      setStatus("❌ Gagal mengirim broadcast WA");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 py-10 px-6">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <MessageSquare className="w-8 h-8 text-green-600" />
          <h1 className="text-2xl font-bold text-gray-800">
            WhatsApp Broadcast (Fonnte)
          </h1>
        </div>

        <div className="space-y-4">
          {/* Numbers */}
          <div>
            <label className="text-sm font-semibold text-gray-700">
              Nomor WhatsApp (pisahkan dengan koma)
            </label>
            <textarea
              value={numbers}
              onChange={(e) => setNumbers(e.target.value)}
              placeholder="contoh: 08123456789, 6281234567890"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 mt-1 focus:ring-2 focus:ring-green-400 outline-none text-sm"
              rows={3}
            />
            <p className="text-xs text-gray-500 mt-1">
              Nomor otomatis dikonversi ke format internasional (62).
            </p>
          </div>

          {/* Message */}
          <div>
            <label className="text-sm font-semibold text-gray-700">Pesan</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tulis pesan broadcast Anda..."
              className="w-full border border-gray-300 rounded-lg px-4 py-2 mt-1 focus:ring-2 focus:ring-green-400 outline-none text-sm"
              rows={6}
            />
            <p className="text-xs text-gray-500 mt-1">
              Bisa pakai format teks, emoji 🎉, dan tag dinamis seperti nama user.
            </p>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 mt-4">
            <button
              onClick={handleSend}
              disabled={sending}
              className={`flex items-center justify-center gap-2 rounded-lg py-3 px-5 font-semibold text-white transition w-full sm:w-auto ${
                sending
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-green-500 to-emerald-600 hover:opacity-90"
              }`}
            >
              {sending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Mengirim...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" /> Kirim Broadcast
                </>
              )}
            </button>

            <button
              onClick={() => setPreview(!preview)}
              className="rounded-lg border border-gray-300 px-5 py-3 font-medium text-gray-700 hover:bg-gray-50 transition w-full sm:w-auto"
            >
              {preview ? "Tutup Preview" : "Lihat Preview"}
            </button>
          </div>

          {/* Status */}
          {status && (
            <p
              className={`mt-4 text-center font-medium ${
                status.startsWith("✅")
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {status}
            </p>
          )}

          {/* Preview */}
          {preview && (
            <div className="mt-6 border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                📱 Preview Pesan
              </h3>
              <div className="border rounded-lg bg-gray-50 p-4 text-sm text-gray-800 whitespace-pre-line">
                {message}
              </div>
            </div>
          )}
        </div>
      </div>

      <p className="text-center text-gray-400 text-xs mt-10">
        Powered by <strong>Fonnte</strong> | RedLink © {new Date().getFullYear()}
      </p>
    </div>
  );
}
