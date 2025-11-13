"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { getReferralStats } from "@/lib/referral-utils";
import {
  DollarSign,
  Users,
  Link,
  Copy,
  CheckCircle2,
  PlusCircle,
  Sparkles,
  TrendingUp,
  UserPlus,
  Award,
  Eye,
  MousePointerClick,
  Clock,
  BarChart3,
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

  // Referral Stats
  const [referralStats, setReferralStats] = useState({
    totalReferred: 0,
    proConversions: 0,
    totalEarnings: 0,
    referredUsers: []
  });

  // 🆕 Leads Stats
  const [leadsStats, setLeadsStats] = useState({
    totalLeads: 0,
    unconvertedLeads: 0,
    conversionRate: 0,
    leads: []
  });

  const [activeTab, setActiveTab] = useState('overview'); // overview, leads, commissions

  // ✅ Ambil profil dan data awal
  useEffect(() => {
    const fetchAll = async () => {
      const { data: prof } = await supabase
        .from("profiles")
        .select("username, plan, balance")
        .eq("username", username)
        .maybeSingle();
      setProfile(prof);

      // Ambil commission dari affiliate_commissions (product sales)
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

      // Ambil referral earnings (user referrals)
      const { data: refEarnings } = await supabase
        .from("referral_earnings")
        .select("*")
        .eq("referrer_username", username)
        .order("transaction_date", { ascending: false });

      const totalReferralEarnings = refEarnings?.reduce(
        (s, e) => s + Number(e.earning_amount || 0),
        0
      );

      setSummary({ 
        totalSales, 
        totalCommission: totalCommission + totalReferralEarnings 
      });

      // Get referral stats
      const stats = await getReferralStats(username);
      setReferralStats(stats);

      // 🆕 Get leads stats
      await fetchLeadsStats();

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

  // 🆕 Function untuk ambil leads stats
  const fetchLeadsStats = async () => {
    const { data: leads, error } = await supabase
      .from("affiliate_leads")
      .select("*")
      .eq("referrer_username", username)
      .order("last_visit", { ascending: false });

    if (error) {
      console.error("Error fetching leads:", error);
      return;
    }

    const totalLeads = leads?.length || 0;
    const unconvertedLeads = leads?.filter(l => !l.converted).length || 0;
    const convertedLeads = leads?.filter(l => l.converted).length || 0;
    const conversionRate = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;

    setLeadsStats({
      totalLeads,
      unconvertedLeads,
      conversionRate: conversionRate.toFixed(1),
      leads: leads || []
    });
  };

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

  // 🆕 Format waktu relatif
  const getTimeAgo = (date) => {
    const now = new Date();
    const diff = now - new Date(date);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
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
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
          <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 shadow-md border border-white/40 hover:shadow-lg transition">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500">Total Balance</p>
                <h2 className="text-2xl font-bold text-gray-800">
                  Rp{(profile?.balance || 0).toLocaleString("id-ID")}
                </h2>
              </div>
              <DollarSign className="w-10 h-10 text-green-500" />
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
              <Award className="w-10 h-10 opacity-90" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 shadow-md text-white hover:scale-[1.01] transition">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm opacity-80">Referred Users</p>
                <h2 className="text-2xl font-bold">
                  {referralStats.totalReferred}
                </h2>
                <p className="text-xs opacity-70 mt-1">
                  {referralStats.proConversions} Pro conversions
                </p>
              </div>
              <UserPlus className="w-10 h-10 opacity-90" />
            </div>
          </div>

          {/* 🆕 Leads Card */}
          <div className="bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl p-6 shadow-md text-white hover:scale-[1.01] transition">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm opacity-80">Total Leads</p>
                <h2 className="text-2xl font-bold">
                  {leadsStats.totalLeads}
                </h2>
                <p className="text-xs opacity-70 mt-1">
                  {leadsStats.conversionRate}% conversion rate
                </p>
              </div>
              <Eye className="w-10 h-10 opacity-90" />
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
                <span className="font-bold text-red-600">30%</span> for Free signups and{" "}
                <span className="font-bold text-green-600">50%</span> for Pro upgrades!
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

        {/* 🆕 Tab Navigation */}
        <div className="bg-white rounded-2xl p-2 shadow-sm border border-gray-200 flex gap-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition ${
              activeTab === 'overview'
                ? 'bg-red-500 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Users className="w-4 h-4 inline mr-2" />
            Overview
          </button>
          <button
            onClick={() => setActiveTab('leads')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition ${
              activeTab === 'leads'
                ? 'bg-red-500 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Eye className="w-4 h-4 inline mr-2" />
            Leads ({leadsStats.unconvertedLeads})
          </button>
          <button
            onClick={() => setActiveTab('commissions')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition ${
              activeTab === 'commissions'
                ? 'bg-red-500 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <BarChart3 className="w-4 h-4 inline mr-2" />
            Commissions
          </button>
        </div>

        {/* 🆕 Leads Section */}
        {activeTab === 'leads' && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                <MousePointerClick className="w-5 h-5 text-purple-600" />
                Affiliate Leads
              </h3>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                  <span className="text-gray-600">Pending: {leadsStats.unconvertedLeads}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                  <span className="text-gray-600">Converted: {leadsStats.totalLeads - leadsStats.unconvertedLeads}</span>
                </div>
              </div>
            </div>

            {leadsStats.leads.length === 0 ? (
              <div className="text-center py-12">
                <Eye className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-400">No leads yet. Share your affiliate link!</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {leadsStats.leads.map((lead) => (
                  <div
                    key={lead.id}
                    className={`border rounded-xl p-4 ${
                      lead.converted
                        ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200'
                        : 'bg-gradient-to-br from-white to-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {lead.converted ? (
                            <>
                              <CheckCircle2 className="w-4 h-4 text-green-600" />
                              <p className="font-semibold text-gray-800">
                                @{lead.converted_username}
                              </p>
                              <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded-full font-semibold">
                                CONVERTED
                              </span>
                            </>
                          ) : (
                            <>
                              <Clock className="w-4 h-4 text-yellow-600" />
                              <p className="font-semibold text-gray-800">
                                Visitor #{lead.visitor_id.slice(0, 8)}
                              </p>
                              <span className="bg-yellow-400 text-gray-800 text-xs px-2 py-0.5 rounded-full font-semibold">
                                PENDING
                              </span>
                            </>
                          )}
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-gray-500">
                          <div>
                            <p className="font-medium text-gray-700">First Visit</p>
                            <p>{new Date(lead.first_visit).toLocaleDateString('id-ID')}</p>
                            <p className="text-gray-400">{getTimeAgo(lead.first_visit)}</p>
                          </div>
                          <div>
                            <p className="font-medium text-gray-700">Last Visit</p>
                            <p>{new Date(lead.last_visit).toLocaleDateString('id-ID')}</p>
                            <p className="text-gray-400">{getTimeAgo(lead.last_visit)}</p>
                          </div>
                          <div>
                            <p className="font-medium text-gray-700">Visits</p>
                            <p className="text-lg font-bold text-purple-600">{lead.visit_count}x</p>
                          </div>
                          {lead.converted && (
                            <div>
                              <p className="font-medium text-gray-700">Converted At</p>
                              <p>{new Date(lead.converted_at).toLocaleDateString('id-ID')}</p>
                              <p className="text-green-600 font-semibold">
                                ✅ {getTimeAgo(lead.converted_at)}
                              </p>
                            </div>
                          )}
                        </div>

                        {lead.source && (
                          <p className="text-xs text-gray-400 mt-2">
                            Source: <span className="font-medium">{lead.source}</span>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Overview Tab (Referral Users) */}
        {activeTab === 'overview' && referralStats.referredUsers.length > 0 && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              Your Referred Users ({referralStats.totalReferred})
            </h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {referralStats.referredUsers.map((user) => (
                <div
                  key={user.id}
                  className={`border rounded-xl p-4 ${
                    user.conversion_status === 'converted_pro'
                      ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200'
                      : 'bg-gradient-to-br from-white to-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-semibold text-gray-800">
                      @{user.referred_username}
                    </p>
                    {user.conversion_status === 'converted_pro' && (
                      <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded-full font-semibold">
                        PRO
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    Joined: {new Date(user.referred_at).toLocaleDateString('id-ID')}
                  </p>
                  {user.converted_at && (
                    <p className="text-xs text-green-600 mt-1">
                      ✅ Converted: {new Date(user.converted_at).toLocaleDateString('id-ID')}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Product Affiliate Management - hanya muncul di overview */}
        {activeTab === 'overview' && (
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
        )}

        {/* Commission Table */}
        {activeTab === 'commissions' && (
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
            <h3 className="font-semibold text-gray-800 mb-3">
              All Commission History
            </h3>
            {commissions.length === 0 && referralStats.totalReferred === 0 ? (
              <p className="text-gray-400 text-center py-10 text-sm">
                No affiliate transactions yet.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm border-t">
                  <thead className="text-gray-500 uppercase text-xs border-b">
                    <tr>
                      <th className="text-left py-2">Type</th>
                      <th className="text-center py-2">Buyer/User</th>
                      <th className="text-right py-2">Amount</th>
                      <th className="text-right py-2">Commission</th>
                    </tr>
                  </thead>
                  <tbody>
                    {commissions.map((c) => (
                      <tr
                        key={c.id}
                        className="border-b hover:bg-gray-50 transition"
                      >
                        <td className="py-2">Product: {c.product_title}</td>
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
        )}

        {/* Footer */}
        <div className="text-center text-gray-400 text-xs pt-8">
          © {new Date().getFullYear()} RedLink Affiliate. All rights reserved.
        </div>
      </div>
    </div>
  );
}