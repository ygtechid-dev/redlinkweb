import { NextResponse } from 'next/server';

const WEBINY_AUTH_URL = "https://d112igt95wgees.cloudfront.net/graphql";

export async function POST(request) {
  try {
    // Introspection query untuk cari tahu schema login yang benar
    const introspectionQuery = `
      query IntrospectionQuery {
        __type(name: "SecurityMutation") {
          name
          fields {
            name
            description
            args {
              name
              description
              type {
                name
                kind
                ofType {
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
            }
            type {
              name
              kind
            }
          }
        }
      }
    `;

    const response = await fetch(WEBINY_AUTH_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: introspectionQuery }),
    });

    const result = await response.json();
    
    if (result.errors) {
      return NextResponse.json({
        success: false,
        errors: result.errors
      }, { status: 400 });
    }

    const securityMutation = result.data?.__type;
    const loginField = securityMutation?.fields?.find(f => f.name === 'login');

    return NextResponse.json({
      success: true,
      loginField,
      allSecurityMutations: securityMutation?.fields?.map(f => ({
        name: f.name,
        args: f.args?.map(a => ({
          name: a.name,
          type: a.type.name || a.type.ofType?.name
        }))
      }))
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}