"use client";
import { useEffect, useRef, useState } from "react";
import { X, Loader2, ExternalLink, Save, Eye, Maximize2, Minimize2, RefreshCw } from "lucide-react";

export default function WebinyEditorModal({ page, onClose, onSave }) {
  const iframeRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [loginStatus, setLoginStatus] = useState('');

  useEffect(() => {
    const handleMessage = (event) => {
      if (!event.origin.includes('cloudfront.net') && !event.origin.includes('webiny')) {
        return;
      }

      const { type, data } = event.data;

      switch (type) {
        case 'webiny:page:saved':
          console.log('✅ Page saved:', data);
          if (onSave) onSave(data);
          break;
        case 'webiny:page:published':
          console.log('✅ Page published:', data);
          if (onSave) onSave(data);
          break;
        case 'webiny:editor:loaded':
          console.log('✅ Editor loaded');
          setLoading(false);
          setLoginStatus('');
          break;
        default:
          break;
      }
    };

    window.addEventListener('message', handleMessage);
    
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [onSave]);

  // ✅ Auto-fill login di iframe
  useEffect(() => {
    if (!loading && loginAttempts === 0) {
      // Tunggu iframe fully loaded
      setTimeout(() => {
        tryAutoLogin();
      }, 2000);
    }
  }, [loading]);

  const tryAutoLogin = () => {
    if (!iframeRef.current) return;

    setLoginStatus('🔐 Mencoba auto-login...');
    setLoginAttempts(prev => prev + 1);

    try {
      const iframe = iframeRef.current;
      const iframeWindow = iframe.contentWindow;

      // Try to inject login script
      const loginScript = `
        (function() {
          console.log('🚀 RedLink Auto-Login Script Running...');
          
          const EMAIL = 'ygwork.only@yahoo.com';
          const PASSWORD = 'ogiwaelah13';
          
          function findAndFillLogin() {
            // Find email input
            const emailSelectors = [
              'input[type="email"]',
              'input[name="email"]',
              'input[name="username"]',
              'input[placeholder*="email" i]',
              'input[placeholder*="Email" i]',
              'input[id*="email" i]',
              'input[autocomplete="email"]',
              'input[autocomplete="username"]'
            ];
            
            let emailInput = null;
            for (const selector of emailSelectors) {
              emailInput = document.querySelector(selector);
              if (emailInput) break;
            }
            
            // Find password input
            const passwordSelectors = [
              'input[type="password"]',
              'input[name="password"]',
              'input[placeholder*="password" i]',
              'input[placeholder*="Password" i]',
              'input[id*="password" i]',
              'input[autocomplete="current-password"]'
            ];
            
            let passwordInput = null;
            for (const selector of passwordSelectors) {
              passwordInput = document.querySelector(selector);
              if (passwordInput) break;
            }
            
            console.log('Email input found:', !!emailInput);
            console.log('Password input found:', !!passwordInput);
            
            if (emailInput && passwordInput) {
              console.log('✅ Login form found! Filling...');
              
              // Fill email
              emailInput.value = EMAIL;
              emailInput.dispatchEvent(new Event('input', { bubbles: true }));
              emailInput.dispatchEvent(new Event('change', { bubbles: true }));
              emailInput.dispatchEvent(new Event('blur', { bubbles: true }));
              
              // Small delay before password
              setTimeout(() => {
                passwordInput.value = PASSWORD;
                passwordInput.dispatchEvent(new Event('input', { bubbles: true }));
                passwordInput.dispatchEvent(new Event('change', { bubbles: true }));
                passwordInput.dispatchEvent(new Event('blur', { bubbles: true }));
                
                console.log('✅ Credentials filled!');
                
                // Find and click submit button
                setTimeout(() => {
                  const submitSelectors = [
                    'button[type="submit"]',
                    'input[type="submit"]',
                    'button:has-text("Login")',
                    'button:has-text("Sign in")',
                    'button:has-text("Log in")',
                    'form button[type="button"]'
                  ];
                  
                  let submitButton = null;
                  
                  // Try exact selectors first
                  for (const selector of submitSelectors.slice(0, 2)) {
                    submitButton = document.querySelector(selector);
                    if (submitButton) break;
                  }
                  
                  // If not found, search by text content
                  if (!submitButton) {
                    const buttons = document.querySelectorAll('button');
                    for (const btn of buttons) {
                      const text = btn.textContent.trim().toLowerCase();
                      if (text.includes('login') || text.includes('sign in') || text.includes('log in')) {
                        submitButton = btn;
                        break;
                      }
                    }
                  }
                  
                  console.log('Submit button found:', !!submitButton);
                  
                  if (submitButton) {
                    console.log('🚀 Clicking submit button...');
                    submitButton.click();
                    
                    // Notify parent window
                    window.parent.postMessage({
                      type: 'webiny:auto-login:submitted'
                    }, '*');
                  } else {
                    console.log('⚠️ Submit button not found. Please click login manually.');
                    window.parent.postMessage({
                      type: 'webiny:auto-login:filled'
                    }, '*');
                  }
                }, 500);
              }, 300);
              
              return true;
            }
            
            return false;
          }
          
          // Try immediately
          if (findAndFillLogin()) {
            return;
          }
          
          // If not found, observe DOM changes
          let attempts = 0;
          const maxAttempts = 20;
          
          const observer = new MutationObserver(() => {
            attempts++;
            console.log('Attempt', attempts, 'to find login form...');
            
            if (findAndFillLogin() || attempts >= maxAttempts) {
              observer.disconnect();
              
              if (attempts >= maxAttempts) {
                console.log('❌ Login form not found after', maxAttempts, 'attempts');
                window.parent.postMessage({
                  type: 'webiny:auto-login:not-found'
                }, '*');
              }
            }
          });
          
          observer.observe(document.body, {
            childList: true,
            subtree: true
          });
          
          // Stop observing after 15 seconds
          setTimeout(() => {
            observer.disconnect();
          }, 15000);
        })();
      `;

      // Listen for messages from iframe
      const handleIframeMessage = (event) => {
        if (event.data.type === 'webiny:auto-login:submitted') {
          setLoginStatus('✅ Login dikirim! Tunggu redirect...');
          setTimeout(() => {
            setLoading(false);
            setLoginStatus('');
          }, 3000);
        } else if (event.data.type === 'webiny:auto-login:filled') {
          setLoginStatus('⚠️ Form terisi, silakan klik tombol Login');
        } else if (event.data.type === 'webiny:auto-login:not-found') {
          setLoginStatus('❌ Form login tidak ditemukan');
          setLoading(false);
        }
      };

      window.addEventListener('message', handleIframeMessage);

      // Inject script into iframe
      if (iframeWindow && iframeWindow.document) {
        const script = iframeWindow.document.createElement('script');
        script.textContent = loginScript;
        iframeWindow.document.head.appendChild(script);
        
        console.log('✅ Auto-login script injected');
      } else {
        // If can't access iframe (CORS), use postMessage to inject
        iframeWindow.postMessage({
          type: 'redlink:inject-login',
          script: loginScript
        }, '*');
      }

    } catch (error) {
      console.error('❌ Auto-login error:', error);
      setLoginStatus('⚠️ Auto-login gagal (CORS). Refresh dan coba lagi.');
      setLoading(false);
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleSave = () => {
    setIsSaving(true);
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        { type: 'redlink:save' },
        '*'
      );
    }
    setTimeout(() => setIsSaving(false), 2000);
  };

  const openInNewTab = () => {
    window.open(page.editor_url, '_blank');
  };

  const reloadIframe = () => {
    setLoading(true);
    setLoginAttempts(0);
    setLoginStatus('');
    if (iframeRef.current) {
      iframeRef.current.src = iframeRef.current.src;
    }
  };

  return (
    <div
      className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-all ${
        isFullscreen ? 'p-0' : ''
      }`}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={`bg-white rounded-2xl shadow-2xl flex flex-col transition-all ${
          isFullscreen
            ? 'w-full h-full rounded-none'
            : 'w-full max-w-7xl h-[90vh]'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-red-500 to-rose-600">
          <div className="flex items-center gap-3">
            <h3 className="font-bold text-white text-lg">
              {page.page_title}
            </h3>
            <span className="bg-white/20 text-white text-xs px-2 py-1 rounded-full">
              {page.status === 'draft' ? 'Draft' : page.status === 'published' ? 'Dipublikasi' : page.status}
            </span>
            {loginStatus && (
              <span className="bg-yellow-400 text-gray-800 text-xs px-2 py-1 rounded-full font-medium">
                {loginStatus}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Reload Button */}
            <button
              onClick={reloadIframe}
              className="bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition flex items-center gap-1"
              title="Reload dan coba auto-login lagi"
            >
              <RefreshCw className="w-4 h-4" />
              Reload
            </button>

            {/* Save Button */}
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition flex items-center gap-1 disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Simpan
                </>
              )}
            </button>

            {/* Preview Button */}
            {page.page_url && (
              <a
                href={page.page_url}
                target="_blank"
                className="bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition flex items-center gap-1"
              >
                <Eye className="w-4 h-4" />
                Preview
              </a>
            )}

            {/* Open in New Tab */}
            <button
              onClick={openInNewTab}
              className="bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition flex items-center gap-1"
              title="Buka di tab baru"
            >
              <ExternalLink className="w-4 h-4" />
            </button>

            {/* Fullscreen Toggle */}
            <button
              onClick={toggleFullscreen}
              className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-lg transition"
              title={isFullscreen ? "Keluar fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? (
                <Minimize2 className="w-4 h-4" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-lg transition"
              title="Tutup"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Loading Overlay */}
        {loading && (
          <div className="absolute inset-0 bg-white/90 flex flex-col items-center justify-center z-10">
            <Loader2 className="w-12 h-12 animate-spin text-red-500 mb-4" />
            <p className="text-gray-600 font-medium">Memuat Editor Webiny...</p>
            {loginStatus && (
              <p className="text-blue-600 text-sm mt-2">{loginStatus}</p>
            )}
            <p className="text-gray-400 text-xs mt-2">Auto-login sedang berjalan...</p>
          </div>
        )}

        {/* Iframe */}
        <div className="flex-1 relative">
          <iframe
            ref={iframeRef}
            src={page.editor_url}
            className="w-full h-full border-0"
            title={`Editor: ${page.page_title}`}
            allow="fullscreen; clipboard-write"
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals allow-popups-to-escape-sandbox allow-top-navigation"
            onLoad={() => {
              console.log('📥 Iframe loaded');
              setTimeout(() => {
                setLoading(false);
              }, 1000);
            }}
          />
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-gray-200 bg-gray-50 flex items-center justify-between text-xs text-gray-500">
          <span>ID Halaman: {page.page_id}</span>
          <span className="flex items-center gap-2">
            Powered by <strong className="text-red-600">Webiny CMS</strong>
          </span>
        </div>
      </div>
    </div>
  );
}