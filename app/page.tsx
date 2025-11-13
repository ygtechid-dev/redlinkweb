"use client";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  Sparkles, 
  Zap, 
  Globe, 
  Share2, 
  TrendingUp, 
  Users,
  CheckCircle,
  ArrowRight
} from "lucide-react";
import CookieConsent from "@/components/CookieConsent"; // ✅ Import Cookie Consent

export default function LandingPage() {
  const router = useRouter();

  const features = [
    {
      icon: <Globe className="w-6 h-6" />,
      title: "Satu Link, Semua Platform",
      description: "Kumpulkan semua link sosial media dan website kamu dalam satu tempat"
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Analytics Real-time",
      description: "Pantau performa link kamu dengan statistik lengkap dan detail"
    },
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: "Desain Menarik",
      description: "Customize tampilan profil sesuai brand dan kepribadian kamu"
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Mudah Dibagikan",
      description: "Share profil kamu dengan mudah ke semua platform"
    }
  ];

  const benefits = [
    "Unlimited links untuk semua platform",
    "Analytics dan statistik lengkap",
    "Customizable design dan tema",
    "Mobile responsive & cepat",
    "SEO friendly untuk Google",
    "Support 24/7"
  ];

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 text-gray-900 overflow-hidden relative">
        {/* --- Enhanced Background Effects --- */}
        <div className="absolute top-[-300px] left-[-300px] w-[600px] h-[600px] bg-gradient-to-br from-red-200/40 to-orange-200/40 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-300px] right-[-300px] w-[600px] h-[600px] bg-gradient-to-br from-red-300/30 to-pink-300/30 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 w-[400px] h-[400px] bg-gradient-to-br from-orange-200/20 to-red-200/20 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }} />

        {/* --- Modern Navbar --- */}
        <nav className="w-full flex items-center justify-between px-6 md:px-12 lg:px-20 py-5 z-20 relative bg-white/70 backdrop-blur-xl border-b border-red-100/50">
          <motion.div 
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-2xl font-bold bg-gradient-to-r from-red-700 to-red-600 bg-clip-text text-transparent">
              RedLink
            </h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-4"
          >
            <button
              onClick={() => router.push("/login")}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200 flex items-center gap-2"
            >
              Masuk
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        </nav>

        {/* --- Hero Section --- */}
        <main className="relative z-10 px-6 md:px-12 lg:px-20">
          <div className="max-w-7xl mx-auto pt-16 md:pt-24 pb-20">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left Content */}
              <div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="inline-flex items-center gap-2 bg-red-100 text-red-700 px-4 py-2 rounded-full text-sm font-semibold mb-6"
                >
                  <Sparkles className="w-4 h-4" />
                  Platform Link-in-Bio Terbaik di Indonesia
                </motion.div>

                <motion.h2
                  className="text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight mb-6"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.1 }}
                >
                  Semua Linkmu.
                  <br />
                  <span className="bg-gradient-to-r from-red-600 via-red-700 to-orange-600 bg-clip-text text-transparent">
                    Dalam Satu Halamans
                  </span>
                </motion.h2>

                <motion.p
                  className="text-lg md:text-xl text-gray-600 mb-8 leading-relaxed max-w-xl"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.8 }}
                >
                  Bangun profil digitalmu yang mudah diingat dan profesional. 
                  Tampilkan semua sosial media, portofolio, dan toko kamu dalam satu tautan yang rapi.
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.6 }}
                  className="flex flex-col sm:flex-row gap-4 mb-12"
                >
                  <button
                    onClick={() => router.push("/login")}
                    className="group bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 px-8 py-4 rounded-xl font-semibold text-lg text-white shadow-xl hover:shadow-2xl transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    Mulai Gratis Sekarang
                    <Zap className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                  </button>
                  
                  <button
                    onClick={() => router.push("/login")}
                    className="px-8 py-4 rounded-xl font-semibold text-lg text-red-700 border-2 border-red-300 hover:bg-red-50 transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    Lihat Demo
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </motion.div>

                {/* Stats */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7, duration: 0.6 }}
                  className="flex flex-wrap gap-8"
                >
                  <div>
                    <div className="text-3xl font-bold text-gray-900 mb-1">10K+</div>
                    <div className="text-sm text-gray-600">Active Users</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-gray-900 mb-1">50K+</div>
                    <div className="text-sm text-gray-600">Links Created</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-gray-900 mb-1">99.9%</div>
                    <div className="text-sm text-gray-600">Uptime</div>
                  </div>
                </motion.div>
              </div>

              {/* Right - Profile Preview Card */}
              <motion.div
                className="relative"
                initial={{ opacity: 0, scale: 0.9, y: 40 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.8 }}
              >
                <div className="bg-white/90 backdrop-blur-xl rounded-3xl border-2 border-red-100 shadow-2xl p-8 max-w-sm mx-auto relative overflow-hidden">
                  {/* Decorative gradient */}
                  <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-br from-red-600 to-orange-600 rounded-t-3xl -z-10"></div>
                  
                  <div className="relative pt-8">
                    <div className="flex flex-col items-center mb-6">
                      <div className="w-28 h-28 rounded-full mb-4 border-4 border-white shadow-xl overflow-hidden bg-gradient-to-br from-red-400 to-orange-400 flex items-center justify-center text-white text-4xl font-bold">
                        YG
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900">Yogi Kurniawan</h3>
                      <p className="text-gray-600 text-sm mb-2">Founder YG Tech</p>
                      <div className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-semibold">
                        @ygtech
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 w-full">
                      <a className="bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold py-3.5 rounded-xl hover:shadow-lg transition-all duration-200 hover:scale-105 text-center flex items-center justify-center gap-2">
                        <Globe className="w-4 h-4" />
                        Website Portfolio
                      </a>
                      <a className="border-2 border-gray-200 text-gray-700 font-semibold py-3.5 rounded-xl hover:bg-gray-50 transition-all duration-200 hover:scale-105 text-center flex items-center justify-center gap-2">
                        📸 Instagram
                      </a>
                      <a className="border-2 border-gray-200 text-gray-700 font-semibold py-3.5 rounded-xl hover:bg-gray-50 transition-all duration-200 hover:scale-105 text-center flex items-center justify-center gap-2">
                        🎥 TikTok
                      </a>
                      <a className="border-2 border-gray-200 text-gray-700 font-semibold py-3.5 rounded-xl hover:bg-gray-50 transition-all duration-200 hover:scale-105 text-center flex items-center justify-center gap-2">
                        📧 Email Me
                      </a>
                    </div>

                    <div className="mt-6 pt-6 border-t border-gray-200 flex items-center justify-center gap-2 text-sm text-gray-600">
                      <Share2 className="w-4 h-4" />
                      Share Profile
                    </div>
                  </div>
                </div>

                {/* Floating elements */}
                <motion.div
                  className="absolute -top-4 -right-4 bg-white p-3 rounded-xl shadow-lg"
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </motion.div>
                <motion.div
                  className="absolute -bottom-4 -left-4 bg-white p-3 rounded-xl shadow-lg"
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 2.5, repeat: Infinity }}
                >
                  <Users className="w-6 h-6 text-blue-600" />
                </motion.div>
              </motion.div>
            </div>
          </div>

          {/* --- Features Section --- */}
          <div className="max-w-7xl mx-auto py-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h3 className="text-4xl md:text-5xl font-bold mb-4">
                Kenapa Pilih <span className="text-red-600">RedLink</span>?
              </h3>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                Platform all-in-one yang memudahkan kamu mengelola dan membagikan semua link penting
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl border border-red-100 hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  <div className="bg-gradient-to-br from-red-600 to-red-700 text-white p-3 rounded-xl w-fit mb-4">
                    {feature.icon}
                  </div>
                  <h4 className="font-bold text-lg mb-2 text-gray-900">{feature.title}</h4>
                  <p className="text-gray-600 text-sm">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* --- Benefits Section --- */}
          <div className="max-w-5xl mx-auto py-20">
            <div className="bg-gradient-to-br from-red-600 to-red-800 rounded-3xl p-8 md:p-12 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
              
              <div className="relative z-10">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  viewport={{ once: true }}
                  className="text-center mb-10"
                >
                  <h3 className="text-3xl md:text-4xl font-bold mb-4">
                    Fitur Lengkap untuk Semua Kebutuhan
                  </h3>
                  <p className="text-white/90 text-lg">
                    Mulai gratis dan upgrade kapan saja sesuai kebutuhan
                  </p>
                </motion.div>

                <div className="grid md:grid-cols-2 gap-4 max-w-3xl mx-auto">
                  {benefits.map((benefit, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      viewport={{ once: true }}
                      className="flex items-center gap-3 bg-white/10 backdrop-blur-sm p-4 rounded-xl"
                    >
                      <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0" />
                      <span className="text-white font-medium">{benefit}</span>
                    </motion.div>
                  ))}
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  viewport={{ once: true }}
                  className="text-center mt-10"
                >
                  <button
                    onClick={() => router.push("/login")}
                    className="bg-white text-red-700 px-8 py-4 rounded-xl font-bold text-lg hover:shadow-2xl hover:scale-105 transition-all duration-200"
                  >
                    Coba Sekarang - Gratis! 🎉
                  </button>
                </motion.div>
              </div>
            </div>
          </div>

          {/* --- CTA Section --- */}
          <div className="max-w-4xl mx-auto text-center py-20">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h3 className="text-4xl md:text-5xl font-bold mb-6">
                Siap untuk Memulai?
              </h3>
              <p className="text-gray-600 text-lg mb-8 max-w-2xl mx-auto">
                Bergabung dengan ribuan kreator, influencer, dan bisnis yang sudah mempercayai RedLink
              </p>
              <button
                onClick={() => router.push("/login")}
                className="bg-gradient-to-r from-red-600 to-red-700 text-white px-10 py-5 rounded-xl font-bold text-xl hover:shadow-2xl hover:scale-105 transition-all duration-200 inline-flex items-center gap-3"
              >
                Buat RedLink Gratis
                <Zap className="w-6 h-6" />
              </button>
            </motion.div>
          </div>
        </main>

        {/* --- Modern Footer --- */}
        <footer className="relative z-10 py-8 text-center border-t border-red-100 bg-white/70 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-red-600 to-red-700 rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-red-700">redlink.web.id</span>
              </div>
              
              <p className="text-gray-600 text-sm">
                © {new Date().getFullYear()} redlink.web.id — by YG Tech. All rights reserved.
              </p>

              <div className="flex gap-4">
                <a href="#" className="text-gray-600 hover:text-red-600 transition">Privacy</a>
                <a href="#" className="text-gray-600 hover:text-red-600 transition">Terms</a>
                <a href="#" className="text-gray-600 hover:text-red-600 transition">Contact</a>
              </div>
            </div>
          </div>
        </footer>
      </div>

      {/* ✅ Cookie Consent Banner */}
      <CookieConsent />
    </>
  );
}