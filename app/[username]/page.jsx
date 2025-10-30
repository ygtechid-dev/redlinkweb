"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function UserPage() {
  const { username } = useParams();
  const [profile, setProfile] = useState(null);
  const [appearance, setAppearance] = useState(null);
  const [elements, setElements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  // ✅ Fetch data: profile + appearance + page_elements + blocks
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 🔹 Profile
        const { data: profileData } = await supabase
          .from("profiles")
          .select(`
            id, username, bio, plan, avatar_url, phone,
            users:users!profiles_user_id_fkey(display_name, photo_url)
          `)
          .eq("username", username)
          .maybeSingle();

        if (!profileData) return setProfile(null);
        setProfile(profileData);

        // 🔹 Appearance
        const { data: appData } = await supabase
          .from("appearance_settings")
          .select("*")
          .eq("username", username)
          .maybeSingle();
        setAppearance(appData);

        // 🔹 Custom elements
        const { data: elData } = await supabase
          .from("page_elements")
          .select("*")
          .eq("username", username);

        // 🔹 Blocks (produk/link)
        const { data: blData } = await supabase
          .from("blocks")
          .select("id, title, url, price, description, image_url, block_type, order_index")
          .eq("username", username);

        // 🔹 Gabungkan semua elemen dan urutkan
        const combined = [
          ...(elData || []).map((x) => ({ ...x, source_type: "custom" })),
          ...(blData || []).map((x) => ({
            ...x,
            source_type: "block",
            type: x.block_type || "link",
            content: x.title,
          })),
        ].sort((a, b) => (a.order_index || 0) - (b.order_index || 0));

        setElements(combined);
      } catch (err) {
        console.error("❌ Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    if (username) fetchData();
  }, [username]);

  // ✅ Catat kunjungan
  useEffect(() => {
    if (!username) return;
    supabase.from("visits").insert([{ username, user_agent: navigator.userAgent }]);
  }, [username]);

  // ✅ Handle Pembelian Produk Digital (affiliate + fonnte)
  const handleBuyProduct = async (block) => {
    try {
      setSending(true);
      const orderId = `PROD-${block.id}-${Date.now()}`;
      const params = new URLSearchParams(window.location.search);
      const ref = params.get("ref");

      // 🔹 Create Tripay Transaction
      const response = await fetch("https://api.ditokoku.id/api/tripay/createRL", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          method: "QRIS",
          amount: block.price,
          name: block.title,
          email: "buyer@redlynk.id",
          phone: profile?.phone || "08123456789",
          orderId,
        }),
      });

      const data = await response.json();
      console.log("🧾 Tripay Response:", data);

      if (!data?.checkout_url) {
        alert("❌ Gagal membuat transaksi Tripay");
        setSending(false);
        return;
      }

      // 🔹 Simpan pembelian awal
      await supabase.from("digital_purchases").insert([
        {
          user_id: profile?.id,
          username, // pembuat halaman
          buyer_username: profile?.username,
          product_id: block.id,
          product_title: block.title,
          product_price: block.price,
          order_id: orderId,
          payment_status: "pending",
        },
      ]);

      window.open(data.checkout_url, "_blank");

      // 🔹 Simulasi pembayaran berhasil
      setTimeout(async () => {
        // ✅ Affiliate jika ada ?ref
        if (ref && ref !== username) {
          const { data: aff } = await supabase
            .from("product_affiliates")
            .select("commission_rate")
            .eq("product_id", block.id)
            .eq("affiliate_username", ref)
            .maybeSingle();

          const rate = aff?.commission_rate || (profile?.plan === "Pro" ? 0.5 : 0.3);
          const commission = block.price * rate;

          await supabase.from("affiliate_commissions").insert([
            {
              affiliate_username: ref,
              buyer_username: profile?.username,
              creator_username: username,
              product_id: block.id,
              product_title: block.title,
              total_sale: block.price,
              commission,
              commission_rate: rate * 100,
            },
          ]);

          console.log(`💸 Komisi affiliate ${ref} dicatat: Rp${commission}`);
        }

        // ✅ Kirim via Fonnte
        const phone = (profile?.phone || "08123456789").replace(/^0/, "62");
        const message = `
🎉 *Selamat!* Pembelian kamu di *RedLink* berhasil!

📦 Produk: *${block.title}*
💰 Total: Rp${Number(block.price).toLocaleString("id-ID")}
🧾 Ref: ${orderId}

Berikut link produk digital kamu:
🔗 ${block.description || "https://redlynk.id/download/" + orderId}

⚠️ *Syarat & Ketentuan:*
Link ini bersifat pribadi dan *tidak boleh disebarluaskan atau dijual kembali.*
Pelanggaran dapat menyebabkan penonaktifan akun RedLink.
        `.trim();

        try {
          const fonnteRes = await fetch("https://api.fonnte.com/send", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: "ScSuD6CbrZakniT79zut",
            },
            body: JSON.stringify({ target: phone, message }),
          });

          const result = await fonnteRes.json();
          console.log("📤 Fonnte Result:", result);

          await supabase
            .from("digital_purchases")
            .update({ payment_status: "paid", wa_sent: true })
            .eq("order_id", orderId);

          alert("✅ Pembayaran berhasil & pesan WA dikirim!");
        } catch (err) {
          console.error("❌ Fonnte Error:", err);
          alert("Gagal kirim WA.");
        }
        setSending(false);
      }, 5000);
    } catch (err) {
      console.error("❌ handleBuyProduct:", err);
      setSending(false);
    }
  };

  // ✅ Loading State
  if (loading)
    return (
      <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-red-500 to-rose-700 text-white text-lg font-semibold">
        Loading RedLink...
      </div>
    );

  if (!profile)
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-900 text-white text-lg font-semibold">
        User not found 😢
      </div>
    );

  const themeColor = appearance?.theme_color || "#ef4444";

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-start relative overflow-hidden text-white transition-all"
      style={
        appearance?.background_image
          ? {
              backgroundImage: `url(${appearance.background_image})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }
          : { background: `linear-gradient(160deg, ${themeColor} 0%, #000000 100%)` }
      }
    >
      {appearance?.background_image && (
        <div className="absolute inset-0 bg-black/25 backdrop-blur-[1px]" />
      )}

      {/* 🔹 Header Profile */}
      <div className="relative z-10 max-w-md mx-auto px-4 py-8 text-center">
        <img
          src={
            appearance?.profile_image ||
            profile.users?.photo_url ||
            profile.avatar_url ||
            "https://cdn-icons-png.flaticon.com/512/149/149071.png"
          }
          className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-xl mx-auto mb-3"
          alt="Profile"
        />
        <h1 className="text-2xl font-bold drop-shadow-md">
          {profile.users?.display_name || "RedLink User"}
        </h1>
        <p className="text-white/90 text-sm">@{profile.username}</p>
        {appearance?.about && (
          <p className="text-white/80 text-sm mb-6 leading-relaxed mt-3">
            {appearance.about}
          </p>
        )}

        {/* 🔹 Render Semua Elemen */}
        <div className="space-y-4 w-full max-w-md mx-auto">
          {elements.length > 0 ? (
            elements.map((el) => (
              <div key={`${el.source_type}-${el.id}`}>
                {/* Custom Element */}
                {el.source_type === "custom" && (
                  <>
                    {el.type === "heading" && (
                      <h2 style={el.style} className="text-xl font-bold mb-2">
                        {el.content}
                      </h2>
                    )}
                    {el.type === "text" && (
                      <p style={el.style} className="text-base mb-2">
                        {el.content}
                      </p>
                    )}
                    {el.type === "button" && (
                      <button
                        style={{
                          ...el.style,
                          backgroundColor: el.style.backgroundColor || "#ef4444",
                          color: el.style.color || "#fff",
                          padding: "10px 20px",
                          borderRadius: "10px",
                        }}
                        className="mt-2"
                      >
                        {el.content}
                      </button>
                    )}
                    {el.type === "image" && (
                      <img
                        src={el.content}
                        alt=""
                        className="rounded-xl mx-auto mb-3"
                        style={el.style}
                      />
                    )}
                  </>
                )}

                {/* Block Produk */}
                {el.source_type === "block" && el.type === "product" && (
                  <div className="bg-white text-gray-900 rounded-2xl shadow overflow-hidden">
                    {el.image_url && (
                      <img src={el.image_url} className="w-full h-40 object-cover" />
                    )}
                    <div className="p-5">
                      <h3 className="font-bold">{el.title}</h3>
                      {/* <p className="text-sm text-gray-600 line-clamp-3">
                        {el.description}
                      </p> */}
                      <div className="flex justify-between items-center mt-3">
                        <p className="text-red-600 font-bold">
                          Rp{el.price?.toLocaleString("id-ID")}
                        </p>
                        <button
                          onClick={() => handleBuyProduct(el)}
                          disabled={sending}
                          className={`px-4 py-2 rounded-lg text-sm font-semibold text-white transition ${
                            sending
                              ? "bg-gray-400 cursor-not-allowed"
                              : "bg-gradient-to-r from-red-500 to-rose-600 hover:opacity-90"
                          }`}
                        >
                          {sending ? "Processing..." : "Beli"}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Block Link */}
                {el.source_type === "block" && el.type === "link" && (
                  <a
                    href={el.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block bg-white/90 rounded-2xl py-4 px-6 shadow-md hover:shadow-lg hover:scale-[1.02] transition text-gray-900"
                  >
                    <div className="flex flex-col items-center justify-center text-center">
                      <span className="text-lg font-semibold">{el.title}</span>
                      <span className="text-xs text-gray-500 mt-1 truncate">
                        {el.url?.replace(/^https?:\/\//, "")}
                      </span>
                    </div>
                  </a>
                )}
              </div>
            ))
          ) : (
            <div className="text-white/70 italic py-10 text-sm">
              🚀 Belum ada konten di halaman ini.
            </div>
          )}
        </div>

        <div className="mt-10 text-white/80 text-xs">
          Powered by <span className="font-semibold">RedLink</span> ©{" "}
          {new Date().getFullYear()}
        </div>
      </div>
    </div>
  );
}
