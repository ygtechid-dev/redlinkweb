import Sidebar from "@/components/Sidebar";

export default function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen flex bg-[#fff5f5]">
      {/* Sidebar tetap di kiri */}
      <Sidebar />

      {/* Konten utama */}
      <main className="flex-1 p-8 overflow-y-auto">{children}</main>
    </div>
  );
}
