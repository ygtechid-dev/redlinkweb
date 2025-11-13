import { NextResponse } from 'next/server';

const WEBINY_API_URL = process.env.WEBINY_API_URL || "https://d112igt95wgees.cloudfront.net/graphql";
const WEBINY_API_TOKEN = process.env.WEBINY_API_TOKEN;

export async function POST(request) {
  try {
    const body = await request.json();
    
    console.log("📡 Proxying request to Webiny:", {
      query: body.query?.substring(0, 100) + "...",
      variables: body.variables
    });

    const response = await fetch(WEBINY_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(WEBINY_API_TOKEN && { 
          "Authorization": `Bearer ${WEBINY_API_TOKEN}` 
        }),
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      console.error("❌ Webiny API Error:", response.status, response.statusText);
      return NextResponse.json(
        { 
          errors: [{ 
            message: `Webiny API returned ${response.status}: ${response.statusText}` 
          }] 
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    if (data.errors) {
      console.error("❌ Webiny GraphQL Errors:", data.errors);
    } else {
      console.log("✅ Webiny request successful");
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("🔥 Proxy Error:", error);
    return NextResponse.json(
      { 
        errors: [{ 
          message: error.message || "Internal proxy error" 
        }] 
      },
      { status: 500 }
    );
  }
}

// Handle OPTIONS request for CORS preflight
export async function OPTIONS(request) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}