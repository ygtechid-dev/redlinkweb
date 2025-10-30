"use client";
import { useRouter, usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Link2,
  Monitor,
  BarChart3,
  ClipboardList,
  ShoppingBag,
  PlaySquare,
  Settings,
  Users,
  Mail,
  MessageCircle,
  Layers,
} from "lucide-react";
import { Poppins } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname(); // ✅ Dapatkan path aktif

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("username");
    localStorage.removeItem("user_id");
    router.push("/login");
  };

  const mainMenu = [
    { title: "Home", icon: <LayoutDashboard size={18} />, path: "/dashboard" },
    { title: "My RedLink", icon: <Link2 size={18} />, path: "/dashboard/my-redlink" },
    { title: "Appearance", icon: <Monitor size={18} />, path: "/dashboard/appearance" },
    { title: "Statistics", icon: <BarChart3 size={18} />, path: "/dashboard/statistics" },
    { title: "Orders", icon: <ClipboardList size={18} />, badge: 0, path: "/dashboard/orders" },
    { title: "My Purchase", icon: <ShoppingBag size={18} />, badge: 0, path: "/dashboard/purchases" },
    { title: "Tutorials", icon: <PlaySquare size={18} />, path: "/dashboard/tutorials" },
    { title: "Settings", icon: <Settings size={18} />, path: "/dashboard/settings" },
  ];

  const marketingTools = [
    { title: "Affiliates", icon: <Users size={18} />, path: "/dashboard/affiliate" },
    { title: "E-Mail Marketing", icon: <Mail size={18} />, path: "/dashboard/email" },
    { title: "WhatsApp Blast", icon: <MessageCircle size={18} />, path: "/dashboard/whatsapp" },
  ];

  return (
    <aside
      className={`w-72 text-white flex flex-col p-6 shadow-xl relative overflow-hidden ${poppins.className}`}
      style={{
        background: "linear-gradient(180deg, #831516 0%, #B71C1C 100%)",
      }}
    >
      {/* Background Decoration */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle at 30% 20%, white 3%, transparent 3%), radial-gradient(circle at 80% 80%, white 3%, transparent 3%)",
          backgroundSize: "80px 80px",
        }}
      />

      {/* Header */}
      <div className="relative z-10 flex flex-col items-start mb-8">
        <img
          src="/images/redlynk.png"
          alt="RedLink Logo"
          className="h-16 w-auto mb-3 rounded-lg object-contain shadow-md"
        />
        <h1 className="text-2xl font-bold tracking-tight uppercase drop-shadow-md">
          RedLink
        </h1>
      </div>

      {/* Main Menu */}
      <div className="relative z-10 mb-6">
        <p className="uppercase text-xs font-semibold text-white/70 mb-2 tracking-wide">
          Menu
        </p>
        <nav className="flex flex-col space-y-1">
          {mainMenu.map((item, i) => {
            const isActive = pathname === item.path; // ✅ cek route aktif

            return (
              <button
                key={i}
                onClick={() => router.push(item.path || "#")}
                className={`flex items-center justify-between w-full py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-white/25 text-white shadow-md scale-[1.02]"
                    : "hover:bg-white/10 text-white/90 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`${
                      isActive ? "text-white" : "text-white/80"
                    } transition-colors`}
                  >
                    {item.icon}
                  </span>
                  <span>{item.title}</span>
                </div>
                {item.badge !== undefined && (
                  <span
                    className={`${
                      isActive ? "bg-white text-red-700" : "bg-white/80 text-red-700"
                    } text-xs font-bold px-2 rounded-full`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Marketing Tools */}
      <div className="relative z-10 mb-6">
        <p className="uppercase text-xs font-semibold text-white/70 mb-2 tracking-wide">
          Marketing Tools
        </p>
        <nav className="flex flex-col space-y-1">
          {marketingTools.map((item, i) => {
            const isActive = pathname === item.path;
            return (
              <button
                key={i}
                onClick={() => router.push(item.path || "#")}
                className={`flex items-center gap-3 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-white/25 text-white shadow-md scale-[1.02]"
                    : "hover:bg-white/10 text-white/90 hover:text-white"
                }`}
              >
                <span
                  className={`${
                    isActive ? "text-white" : "text-white/80"
                  } transition-colors`}
                >
                  {item.icon}
                </span>
                <span>{item.title}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Elementor RedLink (Bottom Section) */}
      <div className="relative z-10 mt-auto border-t border-white/20 pt-4">
        <button 
         onClick={() => router.push('/dashboard/builder')} 
         className="flex items-center gap-3 py-2 px-3 rounded-lg text-sm font-semibold bg-white/15 hover:bg-white/25 text-white w-full transition-all duration-200">
          <Layers size={18} />
          Elementor RedLink
        </button>

        <button
          onClick={handleLogout}
          className="w-full bg-white text-red-700 py-2 mt-4 rounded-lg font-semibold hover:bg-gray-100 transition"
        >
          Logout
        </button>
      </div>
    </aside>
  );
}
