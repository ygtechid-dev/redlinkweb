"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cookie, X, Check } from "lucide-react";

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Cek apakah user sudah accept cookie
    const cookieConsent = localStorage.getItem("cookieConsent");
    if (!cookieConsent) {
      // Delay 1 detik sebelum muncul
      setTimeout(() => {
        setShowBanner(true);
      }, 1000);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookieConsent", "accepted");
    setShowBanner(false);
  };

  const handleDecline = () => {
    localStorage.setItem("cookieConsent", "declined");
    setShowBanner(false);
  };

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6"
        >
          <div className="max-w-6xl mx-auto">
            <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
              <div className="p-6 md:p-8">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                  {/* Icon */}
                  <div className="bg-gradient-to-br from-red-600 to-red-700 p-3 rounded-xl flex-shrink-0">
                    <Cookie className="w-6 h-6 text-white" />
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      🍪 Kami Menggunakan Cookies
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      RedLink menggunakan cookies untuk meningkatkan pengalaman Anda, 
                      termasuk untuk <strong>melacak referral link</strong> dan memberikan 
                      fitur yang lebih personal. Dengan melanjutkan, Anda menyetujui penggunaan cookies kami.
                    </p>
                  </div>

                  {/* Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    <button
                      onClick={handleAccept}
                      className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                    >
                      <Check className="w-5 h-5" />
                      Terima Semua
                    </button>
                    <button
                      onClick={handleDecline}
                      className="border-2 border-gray-300 hover:bg-gray-50 text-gray-700 px-6 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                    >
                      <X className="w-5 h-5" />
                      Tolak
                    </button>
                  </div>
                </div>

                {/* Privacy Link */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-500 text-center">
                    Pelajari lebih lanjut tentang bagaimana kami menggunakan data Anda di{" "}
                    <a href="#" className="text-red-600 hover:underline font-semibold">
                      Kebijakan Privasi
                    </a>{" "}
                    kami.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}