"use client";
import { useState } from "react";

export default function TestWebinyPage() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // ✅ Introspect Webiny Schema
  const introspectSchema = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/webiny/introspect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      
      const data = await response.json();
      
      // Extract createPage mutation info
      const pbMutation = data.data?.data?.__type;
      const createPageField = pbMutation?.fields?.find(f => f.name === 'createPage');
      
      setResult({
        method: "Schema Introspection",
        createPageField,
        createPageInput: data.data?.data?.createPageInput,
        createPageV2Input: data.data?.data?.createPageV2Input,
        fullData: data
      });
    } catch (error) {
      setResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  // ✅ Test different create page variations
  const testCreateVariations = async () => {
    setLoading(true);
    const results = [];

    // Variation 1: With data wrapper
    try {
      const res1 = await fetch("/api/webiny", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: `
            mutation CreatePage($data: PbCreatePageInput!) {
              pageBuilder {
                createPage(data: $data) {
                  data { id title }
                  error { message }
                }
              }
            }
          `,
          variables: { data: { title: "Test 1" } }
        }),
      });
      const data1 = await res1.json();
      results.push({ variation: "With data wrapper (PbCreatePageInput)", result: data1 });
    } catch (e) {
      results.push({ variation: "With data wrapper", error: e.message });
    }

    // Variation 2: Without wrapper
    try {
      const res2 = await fetch("/api/webiny", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: `
            mutation CreatePage($title: String!) {
              pageBuilder {
                createPage(title: $title) {
                  data { id title }
                  error { message }
                }
              }
            }
          `,
          variables: { title: "Test 2" }
        }),
      });
      const data2 = await res2.json();
      results.push({ variation: "Direct arguments", result: data2 });
    } catch (e) {
      results.push({ variation: "Direct arguments", error: e.message });
    }

    // Variation 3: With meta
    try {
      const res3 = await fetch("/api/webiny", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: `
            mutation CreatePage($meta: JSON!) {
              pageBuilder {
                createPage(meta: $meta) {
                  data { id title }
                  error { message }
                }
              }
            }
          `,
          variables: { meta: { title: "Test 3" } }
        }),
      });
      const data3 = await res3.json();
      results.push({ variation: "With meta argument", result: data3 });
    } catch (e) {
      results.push({ variation: "With meta argument", error: e.message });
    }

    setResult({
      method: "Create Page Variations Test",
      results
    });
    setLoading(false);
  };

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-rose-50 to-red-100/70">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-gray-800">🔍 Webiny Schema Inspector</h1>
        
        <div className="bg-white p-6 rounded-xl shadow-lg space-y-4">
          <h2 className="font-semibold text-lg">Schema Inspection Tools</h2>
          
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={introspectSchema}
              disabled={loading}
              className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-6 py-4 rounded-lg font-semibold hover:opacity-90 disabled:opacity-50"
            >
              {loading ? "Inspecting..." : "🔍 Inspect createPage Schema"}
            </button>

            <button
              onClick={testCreateVariations}
              disabled={loading}
              className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-4 rounded-lg font-semibold hover:opacity-90 disabled:opacity-50"
            >
              {loading ? "Testing..." : "🧪 Test All Variations"}
            </button>
          </div>
        </div>

        {/* Results */}
        {result && (
          <div className="space-y-4">
            {/* Success indicators */}
            {result.createPageField && (
              <div className="bg-green-50 border-2 border-green-500 p-6 rounded-lg">
                <h3 className="font-bold text-green-800 text-lg mb-3">
                  ✅ Found createPage Mutation!
                </h3>
                
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-semibold text-green-700 mb-2">Arguments:</p>
                    <div className="bg-green-100 p-3 rounded space-y-1">
                      {result.createPageField.args?.map((arg, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm">
                          <span className="font-mono text-green-800">{arg.name}:</span>
                          <span className="text-green-600">
                            {arg.type.name || arg.type.ofType?.name}
                            {arg.type.kind === "NON_NULL" && "!"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white border border-green-200 p-4 rounded">
                    <p className="text-sm font-semibold text-gray-700 mb-2">
                      ✏️ Correct Usage:
                    </p>
                    <pre className="bg-gray-900 text-green-400 p-3 rounded text-xs overflow-auto">
{`mutation CreatePage(${result.createPageField.args?.map(a => `$${a.name}: ${a.type.name || a.type.ofType?.name}${a.type.kind === 'NON_NULL' ? '!' : ''}`).join(', ')}) {
  pageBuilder {
    createPage(${result.createPageField.args?.map(a => `${a.name}: $${a.name}`).join(', ')}) {
      data { id title }
      error { message }
    }
  }
}`}
                    </pre>
                  </div>
                </div>
              </div>
            )}

            {/* Test variations results */}
            {result.results && (
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <h3 className="font-semibold text-lg mb-4">Test Results:</h3>
                {result.results.map((r, i) => (
                  <div
                    key={i}
                    className={`mb-4 p-4 rounded-lg border-2 ${
                      r.result && !r.result.errors
                        ? 'bg-green-50 border-green-500'
                        : 'bg-red-50 border-red-500'
                    }`}
                  >
                    <h4 className="font-semibold mb-2">{r.variation}</h4>
                    {r.result && !r.result.errors ? (
                      <p className="text-green-700 text-sm">✅ Success!</p>
                    ) : (
                      <p className="text-red-700 text-sm">
                        ❌ {r.error || r.result?.errors?.[0]?.message}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Full response */}
            <details className="bg-gray-900 text-green-400 p-4 rounded-lg">
              <summary className="cursor-pointer font-semibold mb-2">
                📄 View Full Response
              </summary>
              <pre className="text-xs overflow-auto max-h-96">
                {JSON.stringify(result, null, 2)}
              </pre>
            </details>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-xl">
          <h3 className="font-semibold text-yellow-800 mb-3">
            🎯 What This Tool Does:
          </h3>
          <ul className="text-sm text-yellow-700 space-y-2 list-disc list-inside">
            <li>
              <strong>Inspect createPage Schema:</strong> Shows exact arguments needed for createPage mutation
            </li>
            <li>
              <strong>Test All Variations:</strong> Tries different mutation formats to find which one works
            </li>
            <li>
              Once you see the correct schema, copy the working mutation to <code className="bg-yellow-100 px-1">/lib/webiny-client.js</code>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}