"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  DollarSign,
  Users,
  Link,
  Copy,
  CheckCircle2,
  PlusCircle,
  Sparkles,
} from "lucide-react";

export default function AffiliateDashboard() {
  const username =
    typeof window !== "undefined" ? localStorage.getItem("username") : "";

  const [profile, setProfile] = useState(null);
  const [commissions, setCommissions] = useState([]);
  const [summary, setSummary] = useState({ totalSales: 0, totalCommission: 0 });
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [productAffiliates, setProductAffiliates] = useState([]);
  const [newAffiliate, setNewAffiliate] = useState("");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  // ✅ Ambil profil dan data awal
  useEffect(() => {
    const fetchAll = async () => {
      const { data: prof } = await supabase
        .from("profiles")
        .select("username, plan")
        .eq("username", username)
        .maybeSingle();
      setProfile(prof);

      const { data: comm } = await supabase
        .from("affiliate_commissions")
        .select("*")
        .eq("affiliate_username", username)
        .order("created_at", { ascending: false });

      const totalSales = comm?.reduce(
        (s, c) => s + Number(c.total_sale || 0),
        0
      );
      const totalCommission = comm?.reduce(
        (s, c) => s + Number(c.commission || 0),
        0
      );
      setCommissions(comm || []);
      setSummary({ totalSales, totalCommission });

      const { data: prods } = await supabase
        .from("blocks")
        .select("id, title")
        .eq("username", username)
        .eq("block_type", "product");
      setProducts(prods || []);
      setLoading(false);
    };
    fetchAll();
  }, [username]);

  // ✅ Ambil affiliate untuk produk terpilih
  const fetchProductAffiliates = async (pid) => {
    const { data } = await supabase
      .from("product_affiliates")
      .select("*")
      .eq("creator_username", username)
      .eq("product_id", pid);
    setProductAffiliates(data || []);
  };

  // ✅ Tambah affiliate
  const addAffiliate = async () => {
    if (!selectedProduct || !newAffiliate) return;
    const { error } = await supabase.from("product_affiliates").insert([
      {
        product_id: selectedProduct,
        creator_username: username,
        affiliate_username: newAffiliate,
      },
    ]);
    if (error) {
      console.error(error);
      alert("❌ Gagal menambah affiliate!");
    } else {
      fetchProductAffiliates(selectedProduct);
      setNewAffiliate("");
      alert("✅ Affiliate ditambahkan!");
    }
  };

  // ✅ Link affiliate diarahkan ke homepage redlink.web.id dengan ref parameter
  const affiliateLink = `https://redlink.web.id?ref=${username}`;
  
  const copyLink = async () => {
    await navigator.clipboard.writeText(affiliateLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-600">
        Loading Affiliate Dashboard...
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-red-100/70 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* 🔹 Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-red-500" /> RedLink Affiliate
          </h1>
          <p className="text-sm text-gray-500">
            Earn commissions by sharing your affiliate links
          </p>
        </div>

        {/* 🔹 Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 shadow-md border border-white/40 hover:shadow-lg transition">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500">Total Sales</p>
                <h2 className="text-2xl font-bold text-gray-800">
                  Rp{summary.totalSales.toLocaleString("id-ID")}
                </h2>
              </div>
              <DollarSign className="w-10 h-10 text-red-500" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-500 to-rose-600 rounded-2xl p-6 shadow-md text-white hover:scale-[1.01] transition">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm opacity-80">Total Commission</p>
                <h2 className="text-2xl font-bold">
                  Rp{summary.totalCommission.toLocaleString("id-ID")}
                </h2>
              </div>
              <Users className="w-10 h-10 opacity-90" />
            </div>
          </div>
        </div>

        {/* 🔹 Affiliate Link */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="font-semibold text-gray-800 mb-1">
                Your Global Affiliate Link
              </h3>
              <p className="text-sm text-gray-500">
                Share this link and earn{" "}
                {profile?.plan === "Pro" ? "50%" : "30%"} commissions on
                referred sales.
              </p>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <input
                readOnly
                value={affiliateLink}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full sm:w-96"
              />
              <button
                onClick={copyLink}
                className="bg-red-600 hover:bg-red-700 text-white rounded-lg px-3 py-2 flex items-center gap-1 transition"
              >
                {copied ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" /> Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" /> Copy
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* 🔹 Product Affiliate Management */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <h2 className="font-semibold text-gray-800 mb-4">
            Manage Product Affiliates
          </h2>

          {/* Select Product */}
          <select
            className="border rounded-lg px-4 py-2 mb-4 w-full"
            onChange={(e) => {
              setSelectedProduct(e.target.value);
              fetchProductAffiliates(e.target.value);
            }}
          >
            <option value="">Select product</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>

          {selectedProduct && (
            <>
              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <input
                  placeholder="Affiliate username..."
                  value={newAffiliate}
                  onChange={(e) => setNewAffiliate(e.target.value)}
                  className="border rounded-lg px-4 py-2 w-full"
                />
                <button
                  onClick={addAffiliate}
                  className="bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-lg px-5 py-2 font-semibold hover:from-red-600 hover:to-rose-700 transition flex items-center justify-center gap-2"
                >
                  <PlusCircle className="w-4 h-4" /> Add Affiliate
                </button>
              </div>

              {productAffiliates.length > 0 ? (
                <div className="grid sm:grid-cols-2 gap-4">
                  {productAffiliates.map((a) => (
                    <div
                      key={a.id}
                      className="border border-gray-200 rounded-xl p-4 bg-gradient-to-br from-white to-gray-50 shadow-sm"
                    >
                      <p className="font-semibold text-gray-800">
                        @{a.affiliate_username}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Link:{" "}
                        <span className="text-blue-600 break-all">
                          https://redlink.web.id?product={a.product_id}&ref={a.affiliate_username}
                        </span>
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {a.commission_rate * 100 || 30}% commission
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm italic">
                  No affiliates added for this product.
                </p>
              )}
            </>
          )}
        </div>

        {/* 🔹 Commission Table */}
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
          <h3 className="font-semibold text-gray-800 mb-3">
            Affiliate Commission History
          </h3>
          {commissions.length === 0 ? (
            <p className="text-gray-400 text-center py-10 text-sm">
              No affiliate transactions yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm border-t">
                <thead className="text-gray-500 uppercase text-xs border-b">
                  <tr>
                    <th className="text-left py-2">Product</th>
                    <th className="text-center py-2">Buyer</th>
                    <th className="text-right py-2">Sale</th>
                    <th className="text-right py-2">Commission</th>
                  </tr>
                </thead>
                <tbody>
                  {commissions.map((c) => (
                    <tr
                      key={c.id}
                      className="border-b hover:bg-gray-50 transition"
                    >
                      <td className="py-2">{c.product_title}</td>
                      <td className="text-center py-2">
                        @{c.buyer_username}
                      </td>
                      <td className="text-right py-2">
                        Rp{Number(c.total_sale).toLocaleString("id-ID")}
                      </td>
                      <td className="text-right py-2 text-red-600 font-semibold">
                        Rp{Number(c.commission).toLocaleString("id-ID")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center text-gray-400 text-xs pt-8">
          © {new Date().getFullYear()} RedLink Affiliate. All rights reserved.
        </div>
      </div>
    </div>
  );
}