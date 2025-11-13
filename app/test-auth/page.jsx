"use client";
import { useState } from "react";

export default function TestAuthPage() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const inspectLoginSchema = async () => {
    setLoading(true);
    try {
      console.log("🔍 Inspecting login schema...");
      
      const response = await fetch("/api/webiny/auth/inspect", {
        method: "POST",
      });
      
      const data = await response.json();
      console.log("📦 Schema data:", data);
      
      setResult(data);
    } catch (error) {
      console.error("❌ Error:", error);
      setResult({ 
        success: false, 
        error: error.message 
      });
    } finally {
      setLoading(false);
    }
  };

  const testAuth = async () => {
    setLoading(true);
    try {
      console.log("🚀 Sending POST to /api/webiny/auth...");
      
      const response = await fetch("/api/webiny/auth", {
        method: "POST",
      });
      
      console.log("📥 Response status:", response.status);
      
      const data = await response.json();
      console.log("📦 Response data:", data);
      
      setResult(data);
    } catch (error) {
      console.error("❌ Error:", error);
      setResult({ 
        success: false, 
        error: error.message 
      });
    } finally {
      setLoading(false);
    }
  };

  const checkConfig = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/webiny/auth", {
        method: "GET",
      });
      
      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({ 
        success: false, 
        error: error.message 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-gray-800">🔐 Webiny Auth Test</h1>
        
        {/* Current Config Display */}
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h2 className="font-semibold text-lg mb-4">Current Configuration</h2>
          <div className="space-y-2 text-sm">
            <p className="flex items-center gap-2">
              <span className="text-gray-600">Email:</span>
              <code className="bg-gray-100 px-2 py-1 rounded">ygwork.only@yahoo.com</code>
            </p>
            <p className="flex items-center gap-2">
              <span className="text-gray-600">Password:</span>
              <code className="bg-gray-100 px-2 py-1 rounded">••••••••••••</code>
            </p>
            <p className="flex items-center gap-2">
              <span className="text-gray-600">API URL:</span>
              <code className="bg-gray-100 px-2 py-1 rounded break-all">
                https://d112igt95wgees.cloudfront.net/graphql
              </code>
            </p>
          </div>
        </div>

        {/* Test Buttons */}
        <div className="bg-white p-6 rounded-xl shadow-lg space-y-4">
          <h2 className="font-semibold text-lg">Test Authentication</h2>
          
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={checkConfig}
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 transition text-sm"
            >
              {loading ? "..." : "📋 Config"}
            </button>

            <button
              onClick={inspectLoginSchema}
              disabled={loading}
              className="bg-purple-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-purple-700 disabled:opacity-50 transition text-sm"
            >
              {loading ? "..." : "🔍 Inspect Schema"}
            </button>

            <button
              onClick={testAuth}
              disabled={loading}
              className="bg-green-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 transition text-sm"
            >
              {loading ? "..." : "🔐 Test Login"}
            </button>
          </div>

          <p className="text-xs text-gray-500 text-center">
            Click "Inspect Schema" first to see the correct login format
          </p>
        </div>

        {/* Results */}
        {result && (
          <div className="space-y-4">
            {/* Success/Error Banner */}
            <div className={`p-6 rounded-lg border-2 ${
              result.success 
                ? 'bg-green-50 border-green-500' 
                : result.message 
                ? 'bg-blue-50 border-blue-500'
                : 'bg-red-50 border-red-500'
            }`}>
              <h3 className={`font-bold text-lg mb-2 ${
                result.success 
                  ? 'text-green-800' 
                  : result.message 
                  ? 'text-blue-800' 
                  : 'text-red-800'
              }`}>
                {result.success 
                  ? '✅ Success!' 
                  : result.message 
                  ? '📋 Configuration Info' 
                  : '❌ Failed'}
              </h3>
              
              {/* Login Schema Info */}
              {result.loginField && (
                <div className="bg-green-100 p-4 rounded-lg mt-4">
                  <h4 className="font-semibold text-green-800 mb-2">
                    ✅ Found Login Mutation!
                  </h4>
                  <div className="space-y-2 text-sm text-green-700">
                    <p><strong>Field Name:</strong> {result.loginField.name}</p>
                    <div>
                      <p className="font-semibold mb-1">Arguments:</p>
                      <div className="bg-green-50 p-2 rounded">
                        {result.loginField.args?.map((arg, i) => (
                          <div key={i} className="flex items-center gap-2 text-xs">
                            <code className="bg-green-200 px-2 py-0.5 rounded">
                              {arg.name}
                            </code>
                            <span>:</span>
                            <span className="text-green-600">
                              {arg.type.name || arg.type.ofType?.name || 'Unknown'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Show input fields if available */}
                    {result.loginField.args?.[0]?.type?.ofType?.inputFields && (
                      <div className="mt-3">
                        <p className="font-semibold mb-1">Input Fields:</p>
                        <div className="bg-green-50 p-2 rounded space-y-1">
                          {result.loginField.args[0].type.ofType.inputFields.map((field, i) => (
                            <div key={i} className="text-xs">
                              <code className="bg-green-200 px-2 py-0.5 rounded">
                                {field.name}: {field.type.name}
                              </code>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* All Security Mutations */}
              {result.allSecurityMutations && (
                <div className="bg-blue-100 p-4 rounded-lg mt-4">
                  <h4 className="font-semibold text-blue-800 mb-2">
                    📋 All Security Mutations:
                  </h4>
                  <div className="space-y-1">
                    {result.allSecurityMutations.map((mutation, i) => (
                      <div key={i} className="text-sm text-blue-700">
                        <code className="bg-blue-200 px-2 py-0.5 rounded">
                          {mutation.name}
                        </code>
                        {mutation.args && mutation.args.length > 0 && (
                          <span className="text-xs ml-2">
                            ({mutation.args.map(a => `${a.name}: ${a.type}`).join(', ')})
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Auth Success Info */}
              {result.success && result.user && (
                <div className="space-y-2 text-sm text-green-700">
                  <p><strong>User:</strong> {result.user.email}</p>
                  <p><strong>Name:</strong> {result.user.displayName}</p>
                  <p><strong>Token Preview:</strong> {result.token?.substring(0, 30)}...</p>
                </div>
              )}

              {/* Error Info */}
              {result.error && (
                <div className="space-y-2">
                  <p className="text-red-700 text-sm">
                    <strong>Error:</strong> {result.error}
                  </p>
                  {result.hint && (
                    <p className="text-yellow-700 text-sm">
                      💡 <strong>Hint:</strong> {result.hint}
                    </p>
                  )}
                </div>
              )}

              {/* Config Info */}
              {result.test && (
                <div className="space-y-1 text-sm text-blue-700 mt-3">
                  <p>✅ Email: {result.test.email}</p>
                  <p>✅ Password: {result.test.hasPassword ? 'Configured' : 'Missing'}</p>
                  <p>✅ API: {result.test.url}</p>
                </div>
              )}
            </div>

            {/* Full Response */}
            <details className="bg-gray-900 text-green-400 p-4 rounded-lg">
              <summary className="cursor-pointer font-semibold mb-2 hover:text-green-300">
                📄 View Full Response
              </summary>
              <pre className="text-xs overflow-auto max-h-96 mt-2">
                {JSON.stringify(result, null, 2)}
              </pre>
            </details>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-xl">
          <h3 className="font-semibold text-yellow-800 mb-3">
            📖 Troubleshooting Steps:
          </h3>
          <ol className="text-sm text-yellow-700 space-y-2 list-decimal list-inside">
            <li>Click <strong>"Inspect Schema"</strong> to see correct login mutation format</li>
            <li>Check the "Arguments" section to see what Webiny expects</li>
            <li>Based on the schema, we'll update the auth API route</li>
            <li>Then test login again</li>
          </ol>
        </div>
      </div>
    </div>
  );
}