import { NextResponse } from 'next/server';

const WEBINY_AUTH_URL = "https://d112igt95wgees.cloudfront.net/graphql";
const WEBINY_EMAIL = process.env.WEBINY_EMAIL || "ygwork.only@yahoo.com";
const WEBINY_PASSWORD = process.env.WEBINY_PASSWORD || "ogiwaelah13";

export async function POST(request) {
  try {
    console.log("🔐 Attempting Webiny login...");
    console.log("📧 Email:", WEBINY_EMAIL);
    console.log("🌐 Auth URL:", WEBINY_AUTH_URL);

    // Try different login mutations (Webiny versions berbeda punya schema berbeda)
    
    // Attempt 1: Standard login mutation
    const loginMutationV1 = `
      mutation Login($data: SecurityLoginInput!) {
        security {
          login(data: $data) {
            data {
              token
              expiresOn
              user {
                id
                email
                displayName
              }
            }
            error {
              message
              code
            }
          }
        }
      }
    `;

    // Attempt 2: Alternative login mutation
    const loginMutationV2 = `
      mutation Login($email: String!, $password: String!) {
        security {
          login(email: $email, password: $password) {
            data {
              token
              expiresOn
              user {
                id
                email
                displayName
              }
            }
            error {
              message
              code
            }
          }
        }
      }
    `;

    // Try first mutation
    let response = await fetch(WEBINY_AUTH_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: loginMutationV1,
        variables: {
          data: {
            email: WEBINY_EMAIL,
            password: WEBINY_PASSWORD,
          }
        }
      }),
    });

    let result = await response.json();
    
    console.log("📥 First attempt response:", JSON.stringify(result, null, 2));

    // If first attempt fails, try second mutation
    if (result.errors) {
      console.log("⚠️ First mutation failed, trying alternative...");
      
      response = await fetch(WEBINY_AUTH_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: loginMutationV2,
          variables: {
            email: WEBINY_EMAIL,
            password: WEBINY_PASSWORD,
          }
        }),
      });

      result = await response.json();
      console.log("📥 Second attempt response:", JSON.stringify(result, null, 2));
    }

    // Check for errors
    if (result.errors) {
      console.error("❌ Login error:", result.errors);
      return NextResponse.json({
        success: false,
        error: result.errors[0].message,
        hint: "Check if email/password are correct or if Webiny login schema is different"
      }, { status: 401 });
    }

    const loginData = result.data?.security?.login;
    
    if (loginData?.error) {
      console.error("❌ Login failed:", loginData.error);
      return NextResponse.json({
        success: false,
        error: loginData.error.message || "Login failed"
      }, { status: 401 });
    }

    if (!loginData?.data?.token) {
      console.error("❌ No token received");
      
      // Return debug info
      return NextResponse.json({
        success: false,
        error: "No authentication token received",
        debug: {
          hasLoginData: !!loginData,
          loginDataKeys: loginData ? Object.keys(loginData) : [],
          fullResponse: result
        }
      }, { status: 401 });
    }

    console.log("✅ Login successful!");
    console.log("👤 User:", loginData.data.user?.email);
    
    return NextResponse.json({
      success: true,
      token: loginData.data.token,
      expiresOn: loginData.data.expiresOn,
      user: loginData.data.user
    });

  } catch (error) {
    console.error("🔥 Auth error:", error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}

// Also support GET for testing in browser
export async function GET(request) {
  return NextResponse.json({
    message: "Webiny Auth Endpoint",
    method: "Use POST to authenticate",
    test: {
      url: WEBINY_AUTH_URL,
      email: WEBINY_EMAIL,
      hasPassword: !!WEBINY_PASSWORD,
    }
  });
}