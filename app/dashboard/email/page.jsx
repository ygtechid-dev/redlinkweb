"use client";
import { useState } from "react";
import dynamic from "next/dynamic";
import { Loader2, SendHorizonal, Mail } from "lucide-react";
import { Resend } from "resend";

// 🧩 Import React-Quill (lazy-load untuk SSR)
const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });
import "react-quill-new/dist/quill.snow.css";


// ⚙️ Inisialisasi Resend API
const resend = new Resend("re_ZfS2WmWb_2apVQRmm4AiUBt8MHWMubxPW");

export default function BroadcastPage() {
  const [subject, setSubject] = useState("");
  const [html, setHtml] = useState("<p>Tulis pesan Anda di sini...</p>");
  const [recipients, setRecipients] = useState("");
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState(null);
  const [preview, setPreview] = useState(false);

  // 📨 Kirim email langsung via Resend
  const handleSend = async () => {
    if (!subject || !recipients || !html) {
      alert("Semua field wajib diisi!");
      return;
    }

    const list = recipients.split(",").map((r) => r.trim()).filter(Boolean);
    if (list.length === 0) {
      alert("Minimal 1 email penerima.");
      return;
    }

    setSending(true);
    setStatus(null);

    try {
      for (const to of list) {
        await resend.emails.send({
          from: "Acme <onboarding@resend.dev>",
          to,
          subject,
          html,
        });
      }

      setStatus(`✅ Email berhasil dikirim ke ${list.length} penerima`);
    } catch (error) {
      console.error(error);
      setStatus(`❌ Gagal kirim email: ${error.message}`);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-red-100/70 py-10 px-6">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Mail className="w-8 h-8 text-red-500" />
          <h1 className="text-2xl font-bold text-gray-800">
            Email Broadcast Sender
          </h1>
        </div>

        {/* Form */}
        <div className="space-y-5">
          {/* Subject */}
          <div>
            <label className="text-sm font-semibold text-gray-700">
              Subject
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Judul email"
              className="w-full border rounded-lg px-4 py-2 mt-1 focus:ring-2 focus:ring-red-400 outline-none"
            />
          </div>

          {/* Recipients */}
          <div>
            <label className="text-sm font-semibold text-gray-700">
              Recipients (pisahkan dengan koma)
            </label>
            <textarea
              value={recipients}
              onChange={(e) => setRecipients(e.target.value)}
              placeholder="contoh: user1@gmail.com, user2@gmail.com"
              className="w-full border rounded-lg px-4 py-2 mt-1 focus:ring-2 focus:ring-red-400 outline-none text-sm"
              rows={3}
            />
          </div>

          {/* HTML Editor */}
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-2 block">
              Isi Email
            </label>
            <ReactQuill
              theme="snow"
              value={html}
              onChange={setHtml}
              className="bg-white rounded-lg border border-gray-300"
              modules={{
                toolbar: [
                  [{ header: [1, 2, 3, false] }],
                  ["bold", "italic", "underline", "strike"],
                  [{ list: "ordered" }, { list: "bullet" }],
                  ["link", "image"],
                  ["clean"],
                ],
              }}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 mt-4">
            <button
              onClick={handleSend}
              disabled={sending}
              className={`flex items-center justify-center gap-2 rounded-lg py-3 px-5 font-semibold text-white transition w-full sm:w-auto ${
                sending
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-red-500 to-rose-600 hover:opacity-90"
              }`}
            >
              {sending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Mengirim...
                </>
              ) : (
                <>
                  <SendHorizonal className="w-5 h-5" /> Kirim Broadcast
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
            <div
              className={`mt-4 text-center font-medium ${
                status.startsWith("✅") ? "text-green-600" : "text-red-600"
              }`}
            >
              {status}
            </div>
          )}

          {/* Preview Area */}
          {preview && (
            <div className="mt-6 border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                📬 Preview Email
              </h3>
              <div
                className="border rounded-lg bg-gray-50 p-6 min-h-[200px] prose max-w-none"
                dangerouslySetInnerHTML={{ __html: html }}
              ></div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <p className="text-center text-gray-400 text-xs mt-10">
        Powered by <strong>RedLink Broadcast</strong> © {new Date().getFullYear()}
      </p>
    </div>
  );
}
