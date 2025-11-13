"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { webinyClient } from "@/lib/webiny-client";
import WebinyEditorModal from "@/components/WebinyEditorModal";
import {
  Globe,
  Plus,
  Edit,
  Trash2,
  Eye,
  Loader2,
  Sparkles,
  Lock,
  Crown,
  CheckCircle2,
  Clock,
  ExternalLink,
} from "lucide-react";

export default function RedlinkWebBuilderLanding() {
  const [username, setUsername] = useState(null);
  const [profile, setProfile] = useState(null);
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [projectName, setProjectName] = useState("");
  
  // 🆕 State untuk iframe modal
  const [selectedPage, setSelectedPage] = useState(null);
  const [showEditor, setShowEditor] = useState(false);

  // Page limits
  const FREE_LIMIT = 5;
  const isPro = profile?.plan === "Pro";
  const canCreateMore = isPro || pages.length < FREE_LIMIT;

  useEffect(() => {
    const u = localStorage.getItem("username");
    if (!u) {
      setLoading(false);
      return;
    }
    setUsername(u);
    fetchData(u);
  }, []);

  // ✅ Ambil profile dan pages
  const fetchData = async (u) => {
    setLoading(true);
    try {
      // Get profile
      const { data: prof } = await supabase
        .from("profiles")
        .select("username, plan, balance")
        .eq("username", u)
        .maybeSingle();
      setProfile(prof);

      // Get pages dari database
      const { data: pagesData, error } = await supabase
        .from("webiny_pages")
        .select("*")
        .eq("username", u)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPages(pagesData || []);
    } catch (err) {
      console.error("❌ Gagal ambil data:", err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Buat landing page baru via Webiny API
  const createNewLandingPage = async () => {
    if (!username) return alert("Username belum ditemukan.");
    if (!projectName.trim()) return alert("Isi nama project dulu.");

    // Check limit
    if (!canCreateMore) {
      return alert(
        `❌ Limit tercapai!\n\nAkun Free hanya bisa membuat ${FREE_LIMIT} landing pages.\nUpgrade ke Pro untuk unlimited pages!`
      );
    }

    setCreating(true);
    try {
      // 1. Create page via Webiny API
      const result = await webinyClient.createPage(
        projectName.trim(),
        username
      );

      if (result.error) {
        throw new Error(result.error.message);
      }

      const pageData = result.data;

      // 2. Generate editor URL
      const editorUrl = await webinyClient.getEditorUrl(
        pageData.id,
        username
      );

      // 3. Save to database
      const { data: newPage, error: dbError } = await supabase
        .from("webiny_pages")
        .insert([
          {
            username,
            page_id: pageData.id,
            page_pid: pageData.pid,
            page_title: pageData.title,
            page_url: pageData.url,
            editor_url: editorUrl,
            status: pageData.status,
          },
        ])
        .select()
        .single();

      if (dbError) throw dbError;

      setPages((prev) => [newPage, ...prev]);
      setProjectName("");
      
      alert(`✅ Landing page '${projectName}' berhasil dibuat!`);

      // 🆕 Auto-open editor in modal
      setSelectedPage(newPage);
      setShowEditor(true);
    } catch (err) {
      console.error("❌ Gagal membuat landing page:", err);
      alert(`Gagal membuat landing page: ${err.message}`);
    } finally {
      setCreating(false);
    }
  };

  // 🆕 Open editor in iframe modal
  const openEditor = (page) => {
    setSelectedPage(page);
    setShowEditor(true);
  };

  // 🆕 Close editor modal
  const closeEditor = () => {
    setShowEditor(false);
    setSelectedPage(null);
    // Refresh data setelah close
    fetchData(username);
  };

  // 🆕 Handle save from iframe
  const handleEditorSave = async (data) => {
    console.log("💾 Page saved from iframe:", data);
    // Update local state jika perlu
    await fetchData(username);
  };

  // ✅ Publish page
  const handlePublishPage = async (page) => {
    try {
      const result = await webinyClient.publishPage(page.page_id);

      if (result.error) {
        throw new Error(result.error.message);
      }

      // Update database
      await supabase
        .from("webiny_pages")
        .update({
          status: "published",
          page_url: result.data.url,
          published_at: new Date().toISOString(),
        })
        .eq("id", page.id);

      // Refresh data
      fetchData(username);
      
      alert("✅ Landing page berhasil dipublish!");
    } catch (err) {
      console.error("❌ Gagal publish:", err);
      alert(`Gagal publish: ${err.message}`);
    }
  };

  // ✅ Delete page
  const handleDeletePage = async (page) => {
    const confirm = window.confirm(
      `Yakin mau hapus landing page "${page.page_title}"?`
    );
    if (!confirm) return;

    try {
      // Delete from Webiny
      await webinyClient.deletePage(page.page_id);

      // Delete from database
      await supabase.from("webiny_pages").delete().eq("id", page.id);

      setPages((prev) => prev.filter((p) => p.id !== page.id));
      alert("✅ Landing page berhasil dihapus!");
    } catch (err) {
      console.error("❌ Gagal hapus:", err);
      alert(`Gagal hapus: ${err.message}`);
    }
  };

  // ========================== UI ==========================

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-red-500" />
      </div>
    );

  if (!username)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-700">❌ Tidak ada username di localStorage</p>
      </div>
    );

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-rose-50 to-red-100/70 p-6">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
                <Sparkles className="w-8 h-8 text-red-500" />
                Landing Page Builder
              </h1>
              <p className="text-gray-600 text-sm mt-1">
                Powered by Webiny CMS
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Hi, {username}!</p>
              <div className="flex items-center gap-2 mt-1">
                {isPro ? (
                  <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                    <Crown className="w-3 h-3" /> PRO
                  </span>
                ) : (
                  <span className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-xs font-semibold">
                    FREE
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Stats Card */}
          <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Landing Pages</p>
                <h2 className="text-3xl font-bold text-gray-800">
                  {pages.length}
                  {!isPro && (
                    <span className="text-lg text-gray-400 ml-2">
                      / {FREE_LIMIT}
                    </span>
                  )}
                </h2>
              </div>
              {!isPro && pages.length >= FREE_LIMIT && (
                <div className="text-right">
                  <Lock className="w-8 h-8 text-red-500 mx-auto mb-2" />
                  <p className="text-xs text-red-600 font-semibold">
                    Limit Reached
                  </p>
                  <button className="mt-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-lg text-xs font-bold hover:opacity-90">
                    Upgrade to Pro
                  </button>
                </div>
              )}
            </div>

            {!isPro && (
              <div className="mt-4 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm text-gray-700">
                  💡 <strong>Upgrade ke Pro</strong> untuk unlimited landing
                  pages, custom domain, dan fitur premium lainnya!
                </p>
              </div>
            )}
          </div>

          {/* Create New Page */}
          <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-200">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5 text-red-500" />
              Buat Landing Page Baru
            </h2>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="Masukkan nama project (contoh: Promo Ramadan)"
                className="flex-1 border rounded-lg px-4 py-2 text-sm"
                disabled={!canCreateMore}
              />
              <button
                onClick={createNewLandingPage}
                disabled={creating || !canCreateMore}
                className="bg-gradient-to-r from-red-500 to-rose-600 text-white px-6 py-2 rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {creating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Creating...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" /> Buat Page
                  </>
                )}
              </button>
            </div>
            {!canCreateMore && (
              <p className="text-red-500 text-sm mt-2">
                ⚠️ Kamu sudah mencapai limit {FREE_LIMIT} pages untuk akun Free.
                Upgrade ke Pro untuk unlimited!
              </p>
            )}
          </div>

          {/* Pages List */}
          <div className="space-y-4">
            {pages.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center shadow-md border border-gray-200">
                <Globe className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">
                  Belum ada landing page dibuat.
                  <br />
                  Klik tombol di atas untuk membuat yang pertama!
                </p>
              </div>
            ) : (
              pages.map((page) => (
                <div
                  key={page.id}
                  className="bg-white rounded-2xl p-5 shadow-md border border-gray-200 hover:shadow-lg transition"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-bold text-gray-800 text-lg">
                          {page.page_title}
                        </h3>
                        {page.status === "published" ? (
                          <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Published
                          </span>
                        ) : (
                          <span className="bg-yellow-100 text-yellow-700 text-xs px-2 py-1 rounded-full font-semibold flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Draft
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">
                        Created:{" "}
                        {new Date(page.created_at).toLocaleDateString("id-ID")}
                      </p>
                      {page.page_url && (
                        <a
                          href={page.page_url}
                          target="_blank"
                          className="text-xs text-blue-600 hover:underline break-all"
                        >
                          {page.page_url}
                        </a>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2">
                      {/* 🆕 Edit in Modal */}
                      <button
                        onClick={() => openEditor(page)}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition flex items-center gap-1"
                      >
                        <Edit className="w-4 h-4" /> Edit
                      </button>

                      {/* Open in New Tab */}
                      <a
                        href={page.editor_url}
                        target="_blank"
                        className="bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-300 transition flex items-center gap-1"
                        title="Open in new tab"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>

                      {page.status === "draft" && (
                        <button
                          onClick={() => handlePublishPage(page)}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition flex items-center gap-1"
                        >
                          <Globe className="w-4 h-4" /> Publish
                        </button>
                      )}

                      {page.status === "published" && page.page_url && (
                        <a
                          href={page.page_url}
                          target="_blank"
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition flex items-center gap-1"
                        >
                          <Eye className="w-4 h-4" /> View
                        </a>
                      )}

                      <button
                        onClick={() => handleDeletePage(page)}
                        className="bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-300 transition flex items-center gap-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 🆕 Webiny Editor Modal */}
      {showEditor && selectedPage && (
        <WebinyEditorModal
          page={selectedPage}
          onClose={closeEditor}
          onSave={handleEditorSave}
        />
      )}
    </>
  );
}