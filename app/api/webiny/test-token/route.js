import { NextResponse } from 'next/server';

const WEBINY_API_URL = "https://d112igt95wgees.cloudfront.net/graphql";

export async function POST(request) {
  try {
    const { token } = await request.json();
    
    const response = await fetch(WEBINY_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({
        query: `query { pageBuilder { version } }`
      }),
    });

    const data = await response.json();
    
    return NextResponse.json({
      status: response.status,
      success: response.ok,
      headers: Object.fromEntries(response.headers.entries()),
      data
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}