"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Appearance() {
  const [profile, setProfile] = useState(null);
  const [settings, setSettings] = useState({
    layout_style: "classic",
    banner_url: "",
    profile_image: "",
    about: "",
    theme_color: "#ff4d4f",
    background_image: "",
    social_links: {},
  });
  const [previewUsername, setPreviewUsername] = useState("");
  const [loading, setLoading] = useState(true);

  // ✅ Fetch profile dan setting
  useEffect(() => {
    const username = localStorage.getItem("username");
    if (!username) return;
    setPreviewUsername(username);

    const fetchData = async () => {
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("username", username)
        .maybeSingle();

      setProfile(profileData);

      const { data: appearanceData } = await supabase
        .from("appearance_settings")
        .select("*")
        .eq("username", username)
        .maybeSingle();

      if (appearanceData) setSettings(appearanceData);
      setLoading(false);
    };
    fetchData();
  }, []);

  // ✅ Simpan perubahan
  const saveAppearance = async () => {
    if (!previewUsername) return;

    const { error } = await supabase
      .from("appearance_settings")
      .upsert({
        username: previewUsername,
        ...settings,
        updated_at: new Date(),
      });

    if (error) {
      alert("❌ Gagal menyimpan pengaturan");
      console.error(error);
    } else {
      alert("✅ Pengaturan tampil disimpan!");
    }
  };

  if (loading) return <div className="p-8 text-gray-600">Loading...</div>;

  // 🔹 Template background list
  const backgroundTemplates = [
    {
      label: "Red Abstract",
      url: "https://images.rawpixel.com/image_social_portrait/czNmcy1wcml2YXRlL3Jhd3BpeGVsX2ltYWdlcy93ZWJzaXRlX2NvbnRlbnQvbHIvcm00OTQtYmctMDE4Yy14LmpwZw.jpg",
    },
    {
      label: "Green Aesthetic",
      url: "https://marketplace.canva.com/EAGQsYIQ34g/1/0/1131w/canva-green-aesthetic-poster-portrait-XJid1pSaHD0.jpg",
    },
    {
      label: "Matrix Tech",
      url: "https://www.shutterstock.com/image-illustration/abstract-digital-science-fiction-matrix-600nw-398787766.jpg",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-6 flex flex-col md:flex-row gap-10">
      {/* Left side: Form */}
      <div className="w-full md:w-1/2 bg-white rounded-2xl shadow p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Appearance</h1>

        {/* Layout style */}
        <label className="font-semibold text-gray-700">Layout Style</label>
        <div className="grid grid-cols-3 gap-3 mt-2 mb-6">
          {["classic", "modern", "clean"].map((style) => (
            <button
              key={style}
              className={`border rounded-lg py-3 font-medium capitalize ${
                settings.layout_style === style
                  ? "border-red-500 bg-red-50"
                  : "border-gray-300 hover:border-gray-400"
              }`}
              onClick={() => setSettings({ ...settings, layout_style: style })}
            >
              {style}
            </button>
          ))}
        </div>

        {/* Banner upload */}
        <label className="font-semibold text-gray-700 block mb-2">
          Banner URL
        </label>
        <input
          type="text"
          placeholder="https://example.com/banner.jpg"
          className="border border-gray-300 rounded-lg px-4 py-2 w-full mb-4"
          value={settings.banner_url}
          onChange={(e) =>
            setSettings({ ...settings, banner_url: e.target.value })
          }
        />

        {/* Profile image */}
        <label className="font-semibold text-gray-700 block mb-2">
          Profile Image URL
        </label>
        <input
          type="text"
          placeholder="https://example.com/avatar.png"
          className="border border-gray-300 rounded-lg px-4 py-2 w-full mb-4"
          value={settings.profile_image}
          onChange={(e) =>
            setSettings({ ...settings, profile_image: e.target.value })
          }
        />

        {/* About */}
        <label className="font-semibold text-gray-700 block mb-2">About</label>
        <textarea
          placeholder="Write about yourself or your project..."
          className="border border-gray-300 rounded-lg px-4 py-2 w-full mb-4"
          value={settings.about}
          onChange={(e) =>
            setSettings({ ...settings, about: e.target.value })
          }
        ></textarea>

        {/* Theme color */}
        <label className="font-semibold text-gray-700 block mb-2">
          Theme Color
        </label>
        <input
          type="color"
          className="w-20 h-10 border rounded mb-4 cursor-pointer"
          value={settings.theme_color}
          onChange={(e) =>
            setSettings({ ...settings, theme_color: e.target.value })
          }
        />

        {/* Background Template */}
        <label className="font-semibold text-gray-700 block mb-2">
          Background Template
        </label>
        <div className="grid grid-cols-3 gap-3 mb-6">
          {backgroundTemplates.map((bg) => (
            <div
              key={bg.url}
              onClick={() =>
                setSettings({
                  ...settings,
                  background_image:
                    settings.background_image === bg.url ? "" : bg.url,
                })
              }
              className={`relative cursor-pointer rounded-lg overflow-hidden border-2 ${
                settings.background_image === bg.url
                  ? "border-red-500 scale-105"
                  : "border-transparent hover:border-gray-400"
              } transition-all`}
            >
              <img
                src={bg.url}
                alt={bg.label}
                className="w-full h-24 object-cover"
              />
              <div className="absolute bottom-0 w-full bg-black/40 text-white text-xs py-1 text-center">
                {bg.label}
              </div>
            </div>
          ))}
        </div>

        {/* Social Links */}
        <label className="font-semibold text-gray-700 block mb-2">
          Social Links
        </label>
        {["youtube", "instagram", "tiktok", "telegram", "website"].map(
          (key) => (
            <input
              key={key}
              placeholder={`${key.charAt(0).toUpperCase() + key.slice(1)} URL`}
              className="border border-gray-300 rounded-lg px-4 py-2 w-full mb-3"
              value={settings.social_links[key] || ""}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  social_links: {
                    ...settings.social_links,
                    [key]: e.target.value,
                  },
                })
              }
            />
          )
        )}

        {/* Save button */}
        <button
          onClick={saveAppearance}
          className="mt-4 bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-3 rounded-lg w-full"
        >
          💾 Save Appearance
        </button>
      </div>

      {/* Right side: Live Preview */}
      <div className="w-full md:w-1/2 flex justify-center items-start mt-10 md:mt-0">
        <div
          className="relative w-[280px] h-[560px] bg-gray-900 rounded-[3rem] shadow-2xl overflow-hidden"
          style={
            settings.background_image
              ? {
                  backgroundImage: `url(${settings.background_image})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }
              : {
                  background: `linear-gradient(135deg, ${settings.theme_color} 0%, #000000 100%)`,
                }
          }
        >
          {settings.banner_url && (
            <img
              src={settings.banner_url}
              alt="banner"
              className="w-full h-36 object-cover"
            />
          )}
          <div className="flex flex-col items-center mt-5 px-4 text-center text-white bg-black/20 backdrop-blur-sm rounded-t-3xl">
            <img
              src={
                settings.profile_image ||
                "https://cdn-icons-png.flaticon.com/512/149/149071.png"
              }
              alt="profile"
              className="w-20 h-20 rounded-full border-2 border-white object-cover shadow-lg mb-2"
            />
            <h3 className="font-bold text-lg">@{previewUsername}</h3>
            {settings.about && (
              <p className="text-sm text-white/80 mt-2">{settings.about}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
