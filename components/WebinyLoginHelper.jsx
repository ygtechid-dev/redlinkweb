"use client";
import { useState } from "react";
import { X, Copy, CheckCircle, Eye, EyeOff } from "lucide-react";

export default function WebinyLoginHelper({ onClose }) {
  const [copied, setCopied] = useState({ email: false, password: false });
  const [showPassword, setShowPassword] = useState(false);

  const copyToClipboard = async (text, field) => {
    await navigator.clipboard.writeText(text);
    setCopied({ ...copied, [field]: true });
    setTimeout(() => setCopied({ ...copied, [field]: false }), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-800">
            🔐 Kredensial Login Webiny
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-sm text-gray-600 mb-4">
          Copy kredensial untuk login ke Webiny:
        </p>

        <div className="space-y-3">
          {/* Email - Hidden by default */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <div className="flex gap-2">
              <input
                readOnly
                value="ygwork.only@yahoo.com"
                type="password"
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm bg-gray-50 font-mono"
              />
              <button
                onClick={() => copyToClipboard("ygwork.only@yahoo.com", "email")}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-1 whitespace-nowrap"
              >
                {copied.email ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <input
                  readOnly
                  value="ogiwaelah13"
                  type={showPassword ? "text" : "password"}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 text-sm bg-gray-50 font-mono"
                />
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              <button
                onClick={() => copyToClipboard("ogiwaelah13", "password")}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-1 whitespace-nowrap"
              >
                {copied.password ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-4 bg-blue-50 border border-blue-200 p-4 rounded-lg">
          <p className="text-sm text-blue-800 font-semibold mb-2">
            📋 Cara Login:
          </p>
          <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
            <li>Copy Email dengan klik tombol "Copy"</li>
            <li>Copy Password dengan klik tombol "Copy"</li>
            <li>Paste di halaman login Webiny</li>
            <li>Setelah login, kembali ke tab ini</li>
          </ol>
        </div>

        <div className="mt-4 bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
          <p className="text-sm text-yellow-800">
            💡 <strong>Tips:</strong> Setelah login pertama kali di Webiny, 
            browser akan menyimpan session. Editor berikutnya akan otomatis login!
          </p>
        </div>

        <button
          onClick={onClose}
          className="mt-4 w-full bg-gray-800 text-white py-3 rounded-lg font-semibold hover:bg-gray-700 transition"
        >
          Mengerti!
        </button>
      </div>
    </div>
  );
}