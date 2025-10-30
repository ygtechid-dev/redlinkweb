"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  Save,
  Eye,
  Type,
  Image,
  Layout,
  X,
  ChevronUp,
  ChevronDown,
  Smartphone,
  Monitor,
} from "lucide-react";

export default function RedlinkElementorBuilder() {
  const [username, setUsername] = useState(null);
  const [appearance, setAppearance] = useState(null);
  const [canvas, setCanvas] = useState([]);
  const [selected, setSelected] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("mobile");

  useEffect(() => {
    const u = localStorage.getItem("username") || "ygbaru";
    setUsername(u);
  }, []);

  useEffect(() => {
    if (!username) return;
    const fetchAll = async () => {
      const [{ data: app }, { data: els }, { data: bls }] = await Promise.all([
        supabase.from("appearance_settings").select("*").eq("username", username).maybeSingle(),
        supabase.from("page_elements").select("*").eq("username", username),
        supabase.from("blocks").select("*").eq("username", username),
      ]);

      setAppearance(app);
      const combined = [
        ...(els || []).map((x) => ({ ...x, source_type: "custom" })),
        ...(bls || []).map((x) => ({
          ...x,
          source_type: "block",
          type: x.block_type || "link",
          content: x.title,
        })),
      ].sort((a, b) => (a.order_index || 0) - (b.order_index || 0));

      setCanvas(combined);
      setLoading(false);
    };
    fetchAll();
  }, [username]);

  const addElement = async (type) => {
    const el = {
      username,
      type,
      content:
        type === "heading"
          ? "New Heading"
          : type === "text"
          ? "Add your text here"
          : type === "button"
          ? "Click Me"
          : "New Element",
      style: {
        fontSize: "18px",
        color: "#1f2937",
        textAlign: "center",
      },
      order_index: canvas.length,
    };
    const { data } = await supabase.from("page_elements").insert(el).select().single();
    setCanvas([...canvas, { ...data, source_type: "custom" }]);
  };

const updateElementContent = (id, val) => {
  setCanvas((prev) => {
    const updated = prev.map((el) => (el.id === id ? { ...el, content: val } : el));
    const sel = updated.find((el) => el.id === id);
    setSelected(sel); // 🔹 sinkronkan panel kanan
    return updated;
  });

  // 🔹 simpan ke Supabase (async)
  supabase
    .from("page_elements")
    .update({ content: val })
    .eq("id", id)
    .then(({ error }) => {
      if (error) console.error("❌ Gagal update konten:", error);
    });
};


  const updateElementStyle = (id, key, val) => {
    setCanvas((prev) =>
      prev.map((el) =>
        el.id === id ? { ...el, style: { ...el.style, [key]: val } } : el
      )
    );
    supabase.from("page_elements").update({ style: { ...selected.style, [key]: val } }).eq("id", id);
  };

  const moveElement = async (index, direction) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= canvas.length) return;

    const reordered = [...canvas];
    [reordered[index], reordered[newIndex]] = [reordered[newIndex], reordered[index]];
    setCanvas(reordered);

    for (let i = 0; i < reordered.length; i++) {
      const el = reordered[i];
      if (el.source_type === "custom")
        await supabase.from("page_elements").update({ order_index: i }).eq("id", el.id);
      else await supabase.from("blocks").update({ order_index: i }).eq("id", el.id);
    }
  };

  const deleteElement = async (id, type) => {
    if (type === "block") return alert("❌ Tidak bisa hapus block asli!");
    await supabase.from("page_elements").delete().eq("id", id);
    setCanvas(canvas.filter((c) => c.id !== id));
    setSelected(null);
  };

  const saveAll = async () => {
    setSaving(true);
    for (let i = 0; i < canvas.length; i++) {
      const el = canvas[i];
      if (el.source_type === "custom")
        await supabase.from("page_elements").update({ order_index: i }).eq("id", el.id);
      else await supabase.from("blocks").update({ order_index: i }).eq("id", el.id);
    }
    setSaving(false);
    alert("✅ Semua perubahan disimpan!");
  };

  if (loading)
    return (
      <div className="min-h-screen flex justify-center items-center text-gray-500">
        Loading Builder...
      </div>
    );

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <div className="bg-white border-b px-6 py-3 flex justify-between items-center">
        <h1 className="text-xl font-bold text-red-600">RedLink Builder</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode("mobile")}
            className={`p-2 rounded ${viewMode === "mobile" ? "bg-red-100 text-red-600" : "hover:bg-gray-100"}`}
          >
            <Smartphone className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode("desktop")}
            className={`p-2 rounded ${viewMode === "desktop" ? "bg-red-100 text-red-600" : "hover:bg-gray-100"}`}
          >
            <Monitor className="w-5 h-5" />
          </button>
          <a
            href={`/app/${username}`}
            target="_blank"
            className="px-3 py-2 border rounded text-gray-700 flex items-center gap-2 hover:bg-gray-50"
          >
            <Eye className="w-4 h-4" /> Preview
          </a>
          <button
            onClick={saveAll}
            disabled={saving}
            className={`px-4 py-2 rounded-lg text-white font-semibold flex items-center gap-2 ${
              saving ? "bg-gray-400" : "bg-gradient-to-r from-red-500 to-red-600 hover:opacity-90"
            }`}
          >
            <Save className="w-4 h-4" /> {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

      <div className="flex flex-1">
        {/* Sidebar kiri */}
        <div className="w-64 bg-white border-r p-4">
          <h3 className="font-semibold mb-3 text-gray-800">Add Element</h3>
          {[
            { name: "Heading", icon: Type, type: "heading" },
            { name: "Text", icon: Type, type: "text" },
            { name: "Image", icon: Image, type: "image" },
            { name: "Button", icon: Layout, type: "button" },
          ].map((item) => (
            <button
              key={item.type}
              onClick={() => addElement(item.type)}
              className="w-full flex items-center gap-3 p-2 border border-gray-200 rounded-lg hover:border-red-300 hover:bg-red-50 transition mb-2"
            >
              <item.icon className="w-5 h-5 text-gray-600" />
              <span className="text-sm font-medium">{item.name}</span>
            </button>
          ))}
        </div>

        {/* Canvas tengah */}
        <div className="flex-1 bg-gray-100 flex justify-center overflow-auto p-4">
          <div
            className={`relative bg-white shadow-xl rounded-2xl overflow-hidden ${
              viewMode === "mobile" ? "w-96" : "w-[800px]"
            }`}
          >
            <div className="p-6">
              {canvas.map((el, i) => (
                <div
                  key={`${el.source_type}-${el.id}`}
                  onClick={() => setSelected(el)}
                  className={`relative group cursor-pointer mb-3 ${
                    selected?.id === el.id ? "ring-2 ring-red-500" : ""
                  }`}
                >
                  {/* Elemen custom */}
                  {el.source_type === "custom" && (
                    <>
                      {el.type === "heading" && <h2 style={el.style}>{el.content}</h2>}
                      {el.type === "text" && <p style={el.style}>{el.content}</p>}
                      {el.type === "button" && (
                        <button
                          style={{
                            ...el.style,
                            backgroundColor: el.style.backgroundColor || "#ef4444",
                            color: el.style.color || "#fff",
                            padding: "10px 20px",
                            borderRadius: "10px",
                          }}
                        >
                          {el.content}
                        </button>
                      )}
                      {el.type === "image" && (
                        <img src={el.content} alt="" className="rounded-xl mx-auto mb-3" />
                      )}
                    </>
                  )}

                  {/* Block */}
                  {el.source_type === "block" && (
                    <div className="bg-white rounded-2xl shadow text-gray-900 overflow-hidden">
                      {el.image_url && <img src={el.image_url} className="w-full h-40 object-cover" />}
                      <div className="p-4">
                        <h3 className="font-semibold">{el.title}</h3>
                        <p className="text-sm text-gray-600">{el.description}</p>
                      </div>
                    </div>
                  )}

                  {/* Controls */}
                  <div className="absolute right-0 top-0 flex opacity-0 group-hover:opacity-100 transition">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        moveElement(i, -1);
                      }}
                      className="bg-gray-200 hover:bg-gray-300 p-1 rounded-l"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        moveElement(i, 1);
                      }}
                      className="bg-gray-200 hover:bg-gray-300 p-1"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    {el.source_type === "custom" && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteElement(el.id, el.source_type);
                        }}
                        className="bg-red-500 text-white p-1 rounded-r"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar kanan */}
        {selected && selected.source_type === "custom" && (
          <div className="w-72 bg-white border-l p-4">
            <h3 className="font-semibold mb-4 text-gray-800">Edit Element</h3>
            <label className="text-sm font-medium">Content</label>
            <input
              type="text"
              value={selected.content || ""}
              onChange={(e) => updateElementContent(selected.id, e.target.value)}
              className="w-full border rounded-lg px-3 py-2 mb-3"
            />
            <label className="text-sm font-medium">Font Size</label>
            <input
              type="text"
              value={selected.style?.fontSize || "16px"}
              onChange={(e) => updateElementStyle(selected.id, "fontSize", e.target.value)}
              className="w-full border rounded-lg px-3 py-2 mb-3"
            />
            <label className="text-sm font-medium">Color</label>
            <input
              type="color"
              value={selected.style?.color || "#000000"}
              onChange={(e) => updateElementStyle(selected.id, "color", e.target.value)}
              className="w-16 h-10 border mb-3"
            />
          </div>
        )}
      </div>
    </div>
  );
}
