"use client";
import { useState } from "react";
import { Bell, Share2, Calendar, Info, Eye, MousePointer, DollarSign, TrendingUp } from "lucide-react";

export default function RedlinkStatisticsPage() {
  const [profile] = useState({
    username: "wayjitech",
    avatar_url: "https://cdn-icons-png.flaticon.com/512/149/149071.png",
    display_name: "WayjiTech"
  });

  // Sample data for charts
  const viewsData = [
    { date: "11 Oct", views: 1, clicks: 0 },
    { date: "12 Oct", views: 0, clicks: 0 },
    { date: "13 Oct", views: 1, clicks: 0 },
    { date: "14 Oct", views: 0, clicks: 0 },
    { date: "15 Oct", views: 1, clicks: 0 },
    { date: "16 Oct", views: 0, clicks: 0 },
    { date: "17 Oct", views: 0, clicks: 0 },
  ];

  const maxViews = Math.max(...viewsData.map(d => d.views));
  const totalViews = viewsData.reduce((sum, d) => sum + d.views, 0);
  const totalClicks = viewsData.reduce((sum, d) => sum + d.clicks, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Statistics</h1>
          <button className="p-2 hover:bg-gray-100 rounded-full transition">
            <Bell className="w-6 h-6 text-gray-600" />
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Section - Statistics */}
          <div className="lg:col-span-2 space-y-6">
            {/* Lynk URL Card */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex-1">
                  <p className="text-sm text-gray-500 mb-1">My Lynkid:</p>
                  <p className="text-lg font-semibold text-gray-800">
                    https://lynk.id/{profile.username}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm font-medium text-gray-700">
                    <Share2 className="w-4 h-4" />
                    Share
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg hover:from-emerald-600 hover:to-emerald-700 transition text-sm font-medium">
                    Customize URL
                  </button>
                </div>
              </div>
            </div>

            {/* Info Alert */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-blue-800">
                To see individual statistics for each product you're selling, go to{" "}
                <a href="#" className="font-semibold underline hover:text-blue-900">
                  My Lynk
                </a>
                , click the three-dot icon, and select the Analytics option.
              </p>
            </div>

            {/* Total Views & Clicks */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-800">Total Views & Clicks</h2>
                <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm font-medium text-gray-700">
                  <Calendar className="w-4 h-4" />
                  Choose Date
                </button>
              </div>

              {/* Legend */}
              <div className="flex gap-6 mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-orange-400"></div>
                  <span className="text-sm text-gray-600">Views</span>
                  <span className="text-xl font-bold text-gray-800 ml-2">{totalViews}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                  <span className="text-sm text-gray-600">Clicks</span>
                  <span className="text-xl font-bold text-gray-800 ml-2">{totalClicks}</span>
                </div>
              </div>

              {/* Chart */}
              <div className="relative h-64">
                <div className="absolute inset-0 flex items-end justify-between gap-2 px-4">
                  {viewsData.map((data, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div className="w-full flex flex-col items-center justify-end h-48 mb-2">
                        {data.views > 0 && (
                          <div
                            className="w-full bg-gradient-to-t from-orange-400 to-orange-300 rounded-t-lg relative"
                            style={{ height: `${(data.views / maxViews) * 100}%`, minHeight: "60px" }}
                          >
                            <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-semibold text-gray-700">
                              {data.views}
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 text-center">
                        <div>{data.date.split(" ")[0]}</div>
                        <div>{data.date.split(" ")[1]}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Total Sales */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-800">Total Sales</h2>
                <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm font-medium text-gray-700">
                  <Calendar className="w-4 h-4" />
                  Choose Date
                </button>
              </div>

              {/* Sales Amount */}
              <div className="flex items-center gap-2 mb-6">
                <div className="w-3 h-3 rounded-full bg-orange-400"></div>
                <span className="text-sm text-gray-600">Sales Amount</span>
                <span className="text-3xl font-bold text-gray-800 ml-2">0</span>
              </div>

              {/* Empty Chart */}
              <div className="relative h-48 flex items-end justify-between gap-2 px-4 border-t border-gray-100 pt-4">
                {viewsData.map((data, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div className="text-xs text-gray-500 text-center mt-2">
                      <div>{data.date.split(" ")[0]}</div>
                      <div>{data.date.split(" ")[1]}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Sales Value */}
              <div className="mt-8 pt-6 border-t border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                  <span className="text-sm text-gray-600">Sales Value (IDR)</span>
                  <span className="text-3xl font-bold text-gray-800 ml-2">0</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Section - Page Preview */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-8">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Page Preview</h2>

              {/* Phone Mockup */}
              <div className="relative mx-auto" style={{ width: "280px", height: "560px" }}>
                <div className="absolute inset-0 bg-gray-800 rounded-[3rem] shadow-2xl overflow-hidden">
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-gray-800 rounded-b-2xl z-10"></div>
                  <div className="absolute inset-3 bg-gradient-to-br from-orange-400 via-orange-500 to-red-500 rounded-[2.5rem] overflow-auto">
                    {/* Top Bar */}
                    <div className="bg-gray-800/30 backdrop-blur-sm px-4 py-3 flex items-center justify-between">
                      <span className="text-white text-sm font-semibold">Home</span>
                      <button className="text-white">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </button>
                    </div>

                    <div className="p-6 flex flex-col items-center">
                      {/* Avatar */}
                      <div className="w-20 h-20 bg-white rounded-full mb-3 shadow-lg flex items-center justify-center overflow-hidden">
                        <img
                          src={profile.avatar_url}
                          alt="Avatar"
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Username */}
                      <p className="text-white font-bold text-sm mb-1">
                        {profile.display_name}
                      </p>
                      <p className="text-white/80 text-xs mb-6">
                        http://localhost:3787/wayji/products
                      </p>

                      {/* Video Block Preview */}
                      <div className="w-11/12 bg-white/95 backdrop-blur-sm rounded-xl overflow-hidden shadow-lg mb-3">
                        <div className="relative bg-gradient-to-br from-red-500 to-orange-500 aspect-video flex items-center justify-center">
                          <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center">
                            <div className="w-0 h-0 border-t-8 border-t-transparent border-l-12 border-l-red-600 border-b-8 border-b-transparent ml-1"></div>
                          </div>
                          <div className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded font-bold">
                            LIVE
                          </div>
                        </div>
                      </div>

                      {/* Button Blocks */}
                      <div className="w-11/12 bg-white/95 backdrop-blur-sm text-gray-800 rounded-xl py-3 px-4 text-center text-sm font-semibold shadow-lg mb-3">
                        Button Block
                      </div>
                      <div className="w-11/12 bg-white/95 backdrop-blur-sm text-gray-800 rounded-xl py-3 px-4 text-center text-sm font-semibold shadow-lg">
                        Button Block
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <div className="flex items-center justify-center gap-4 text-sm text-gray-600">
            <a href="#" className="hover:text-gray-900 transition">
              Terms & Conditions
            </a>
            <span>•</span>
            <a href="#" className="hover:text-gray-900 transition">
              Privacy
            </a>
            <span>•</span>
            <a href="#" className="hover:text-gray-900 transition">
              Contact Us
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}