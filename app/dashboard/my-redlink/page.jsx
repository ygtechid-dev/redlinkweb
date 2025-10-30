"use client";
import { useState, useEffect } from "react";
import {
  Share2,
  Settings,
  Plus,
  Bell,
  X,
  Trash2,
  Edit2,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function MyRedLinkPage() {
  const [profile, setProfile] = useState(null);
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBlock, setEditingBlock] = useState(null);

  const [newBlock, setNewBlock] = useState({
    title: "",
    url: "",
    block_type: "link",
    price: "",
    description: "",
    image_url: "",
  });

  // ✅ Fetch profile + blocks
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const username = localStorage.getItem("username");
        if (!username) return;

        const { data: profileData } = await supabase
          .from("profiles")
          .select(`
            id, username, avatar_url, user_id,
            users:users!profiles_user_id_fkey(id, display_name)
          `)
          .eq("username", username)
          .maybeSingle();

        setProfile(profileData);

        const { data: blocksData } = await supabase
          .from("blocks")
          .select("*")
          .eq("username", profileData.username)
          .order("created_at", { ascending: false });

        setBlocks(blocksData || []);
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  // ✅ Add or Update Block
  const handleSaveBlock = async () => {
    if (!newBlock.title) return alert("Judul wajib diisi!");

    try {
      if (editingBlock) {
        // 🔹 Update block
        const { data, error } = await supabase
          .from("blocks")
          .update({
            title: newBlock.title,
            url: newBlock.url || null,
            price:
              newBlock.block_type === "product"
                ? parseInt(newBlock.price)
                : null,
            description: newBlock.description || null,
            image_url: newBlock.image_url || null,
          })
          .eq("id", editingBlock.id)
          .select()
          .single();

        if (error) throw error;

        setBlocks(
          blocks.map((b) => (b.id === editingBlock.id ? data : b))
        );
        alert("✅ Block berhasil diperbarui!");
      } else {
        // 🔹 Tambah block
        const { data, error } = await supabase
          .from("blocks")
          .insert([
            {
              user_id: profile.id,
              username: profile.username,
              title: newBlock.title,
              url: newBlock.url || null,
              block_type: newBlock.block_type,
              price:
                newBlock.block_type === "product"
                  ? parseInt(newBlock.price)
                  : null,
              description: newBlock.description || null,
              image_url: newBlock.image_url || null,
            },
          ])
          .select()
          .single();

        if (error) throw error;
        setBlocks([data, ...blocks]);
      }

      // Reset
      setNewBlock({
        title: "",
        url: "",
        block_type: "link",
        price: "",
        description: "",
        image_url: "",
      });
      setEditingBlock(null);
      setShowModal(false);
    } catch (err) {
      console.error("Error saving block:", err);
      alert("❌ Gagal menyimpan block");
    }
  };

  // ✅ Delete Block
  const handleDelete = async (blockId) => {
    const confirmDel = confirm("Yakin mau hapus block ini?");
    if (!confirmDel) return;

    try {
      const { error } = await supabase
        .from("blocks")
        .delete()
        .eq("id", blockId);

      if (error) throw error;
      setBlocks(blocks.filter((b) => b.id !== blockId));
    } catch (err) {
      console.error("Error deleting block:", err);
      alert("❌ Gagal menghapus block");
    }
  };

  // ✅ Open modal edit
  const openEditModal = (block) => {
    setEditingBlock(block);
    setNewBlock({
      title: block.title || "",
      url: block.url || "",
      block_type: block.block_type,
      price: block.price || "",
      description: block.description || "",
      image_url: block.image_url || "",
    });
    setShowModal(true);
  };

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-600">
        Loading profile...
      </div>
    );

  if (!profile)
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-600">
        No profile found 😢
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">My Redlink</h1>
          <button className="p-2 hover:bg-gray-100 rounded-full transition">
            <Bell className="w-6 h-6 text-gray-600" />
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Lynk URL */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">My Redlink:</p>
                  <p className="text-lg font-semibold text-gray-800">
                    https://redlink.id/{profile.username}
                  </p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm font-medium text-gray-700">
                  <Share2 className="w-4 h-4" /> Share
                </button>
              </div>
            </div>

            {/* Add Block Button */}
            <button
              onClick={() => {
                setEditingBlock(null);
                setShowModal(true);
              }}
              className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white rounded-2xl py-4 font-semibold text-lg hover:from-red-600 hover:to-red-700 transition shadow-lg flex items-center justify-center gap-2"
            >
              <Plus className="w-6 h-6" /> Add new block
            </button>

            {/* Block List */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Block List
              </h2>

              {blocks.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  No blocks yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {blocks.map((b) => (
                    <div
                      key={b.id}
                      className="border border-gray-200 rounded-lg p-4 flex justify-between items-center hover:bg-gray-50 transition"
                    >
                      <div>
                        <p className="font-medium text-gray-800">{b.title}</p>
                        {b.block_type === "product" ? (
                          <p className="text-sm text-red-600 font-semibold">
                            💰 Rp{b.price?.toLocaleString("id-ID")}
                          </p>
                        ) : (
                          <a
                            href={b.url}
                            className="text-sm text-gray-500 hover:text-red-600 transition"
                            target="_blank"
                            rel="noreferrer"
                          >
                            {b.url}
                          </a>
                        )}
                      </div>

                      <div className="flex gap-3">
                        <button
                          onClick={() => openEditModal(b)}
                          className="p-2 hover:bg-gray-100 rounded-full transition"
                          title="Edit"
                        >
                          <Edit2 className="w-5 h-5 text-gray-500" />
                        </button>
                        <button
                          onClick={() => handleDelete(b.id)}
                          className="p-2 hover:bg-gray-100 rounded-full transition"
                          title="Delete"
                        >
                          <Trash2 className="w-5 h-5 text-red-500" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Preview (same) */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-8">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Page Preview
              </h2>

              <div
                className="relative mx-auto"
                style={{ width: "280px", height: "560px" }}
              >
                <div className="absolute inset-0 bg-gray-800 rounded-[3rem] shadow-2xl overflow-hidden">
                  <div className="absolute inset-3 bg-gradient-to-br from-red-400 via-pink-400 to-red-600 rounded-[2.5rem] overflow-auto">
                    <div className="p-6 flex flex-col items-center">
                      <div className="w-20 h-20 bg-white rounded-full mb-3 shadow-lg overflow-hidden">
                        <img
                          src={
                            profile.avatar_url ||
                            "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                          }
                          alt="Avatar"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <p className="text-white font-bold text-sm mb-1">
                        {profile.users?.display_name}
                      </p>
                      <p className="text-white/80 text-xs mb-6">
                        @{profile.username}
                      </p>

                      <div className="w-full flex flex-col items-center gap-3">
                        {blocks.map((b) =>
                          b.block_type === "product" ? (
                            <div
                              key={b.id}
                              className="w-11/12 bg-yellow-100 rounded-xl p-3 text-center text-sm font-semibold text-gray-800 shadow"
                            >
                              🛍 {b.title} — Rp
                              {b.price?.toLocaleString("id-ID")}
                            </div>
                          ) : (
                            <div
                              key={b.id}
                              className="w-11/12 bg-white/95 text-gray-800 rounded-xl py-3 px-4 text-center text-sm font-semibold shadow"
                            >
                              {b.title}
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL Add/Edit Block */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>

            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              {editingBlock ? "Edit Block" : "Add New Block"}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Block Type
                </label>
                <select
                  value={newBlock.block_type}
                  onChange={(e) =>
                    setNewBlock({ ...newBlock, block_type: e.target.value })
                  }
                  disabled={!!editingBlock}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:border-red-500 text-gray-700"
                >
                  <option value="link">Normal Link</option>
                  <option value="product">Digital Product</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Block Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. My Instagram or Ebook"
                  value={newBlock.title}
                  onChange={(e) =>
                    setNewBlock({ ...newBlock, title: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:border-red-500 text-gray-700"
                />
              </div>

              {newBlock.block_type === "link" && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    URL Link
                  </label>
                  <input
                    type="url"
                    placeholder="https://example.com"
                    value={newBlock.url}
                    onChange={(e) =>
                      setNewBlock({ ...newBlock, url: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:border-red-500 text-gray-700"
                  />
                </div>
              )}

              {newBlock.block_type === "product" && (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Product Price (IDR)
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 25000"
                      value={newBlock.price}
                      onChange={(e) =>
                        setNewBlock({ ...newBlock, price: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:border-red-500 text-gray-700"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      placeholder="Describe your digital product"
                      value={newBlock.description}
                      onChange={(e) =>
                        setNewBlock({
                          ...newBlock,
                          description: e.target.value,
                        })
                      }
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:border-red-500 text-gray-700"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Product Image URL (optional)
                    </label>
                    <input
                      type="url"
                      placeholder="https://image-link.com"
                      value={newBlock.image_url}
                      onChange={(e) =>
                        setNewBlock({
                          ...newBlock,
                          image_url: e.target.value,
                        })
                      }
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:border-red-500 text-gray-700"
                    />
                  </div>
                </>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 border border-gray-300 text-gray-700 rounded-lg py-3 font-semibold hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveBlock}
                className="flex-1 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg py-3 font-semibold hover:opacity-90 transition shadow-md"
              >
                {editingBlock ? "Save Changes" : "Add Block"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
