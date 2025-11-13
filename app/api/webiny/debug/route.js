import { NextResponse } from 'next/server';

const WEBINY_API_URL = "https://d112igt95wgees.cloudfront.net/graphql";

export async function POST(request) {
  const WEBINY_API_TOKEN = process.env.WEBINY_API_TOKEN;

  try {
    console.log("🔍 Debug Info:");
    console.log("- WEBINY_API_URL:", WEBINY_API_URL);
    console.log("- WEBINY_API_TOKEN exists:", !!WEBINY_API_TOKEN);
    console.log("- Token preview:", WEBINY_API_TOKEN ? `${WEBINY_API_TOKEN.substring(0, 20)}...` : "N/A");

    const headers = {
      "Content-Type": "application/json",
      ...(WEBINY_API_TOKEN && { "Authorization": `Bearer ${WEBINY_API_TOKEN}` }),
    };

    console.log("📤 Sending headers:", Object.keys(headers));

    const response = await fetch(WEBINY_API_URL, {
      method: "POST",
      headers,
      body: JSON.stringify({
        query: `query { pageBuilder { version } }`
      }),
    });

    const responseText = await response.text();
    let data;
    try {
      data = JSON.parse(responseText);
    } catch {
      data = { rawResponse: responseText };
    }

    return NextResponse.json({
      request: {
        url: WEBINY_API_URL,
        headers: Object.keys(headers),
        hasToken: !!WEBINY_API_TOKEN,
      },
      response: {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        data
      }
    });
  } catch (error) {
    return NextResponse.json({
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}