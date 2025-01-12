// src/app/api/patterns/route.ts
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const conversationId = searchParams.get('conversationId');

  const modusEndpoint = process.env.NEXT_PUBLIC_MODUS_API || 'http://localhost:8686/graphql'
  const hypermodeApiKey = process.env.HYPERMODE_API_KEY;

  // Modified to match their example exactly
  const query = `
    query ConversationPatterns($conversationId: String!) {
      conversationPatterns(conversationId: $conversationId)
    }
  `;

  try {
    const response = await fetch(modusEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${hypermodeApiKey}`
      },
      body: JSON.stringify({
        query,
        variables: { conversationId }
      })
    });

    const result = await response.json();

    if (result.errors) {
      console.error("GraphQL Errors:", result.errors);
      return NextResponse.json({ patterns: [], message: "Error fetching patterns" });
    }

    if (result.data?.conversationPatterns) {
      try {
        const parsedPatterns = JSON.parse(result.data.conversationPatterns);
        return NextResponse.json(parsedPatterns);
      } catch (parseError) {
        console.error("Parse Error:", parseError);
        return NextResponse.json({ patterns: [], message: "Invalid pattern data" });
      }
    }

    return NextResponse.json({ patterns: [], message: "No patterns found" });
  } catch (error) {
    console.error('Patterns API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch patterns' }, { status: 500 });
  }
}