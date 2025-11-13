import { NextResponse } from 'next/server';

const WEBINY_API_URL = process.env.WEBINY_API_URL || "https://d112igt95wgees.cloudfront.net/graphql";
const WEBINY_API_TOKEN = process.env.WEBINY_API_TOKEN;

export async function POST(request) {
  try {
    // GraphQL Introspection Query
    const introspectionQuery = `
      query IntrospectionQuery {
        __type(name: "PbMutation") {
          name
          fields {
            name
            args {
              name
              type {
                name
                kind
                ofType {
                  name
                  kind
                }
              }
            }
            type {
              name
              kind
            }
          }
        }
        createPageInput: __type(name: "PbCreatePageInput") {
          name
          kind
          inputFields {
            name
            type {
              name
              kind
            }
          }
        }
        createPageV2Input: __type(name: "PbCreatePageV2Input") {
          name
          kind
          inputFields {
            name
            type {
              name
              kind
            }
          }
        }
      }
    `;

    const response = await fetch(WEBINY_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(WEBINY_API_TOKEN && { "Authorization": `Bearer ${WEBINY_API_TOKEN}` }),
      },
      body: JSON.stringify({ query: introspectionQuery }),
    });

    const data = await response.json();
    
    return NextResponse.json({
      success: !data.errors,
      data
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}