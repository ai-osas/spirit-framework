// src/app/api/patterns/route.ts
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const conversationId = searchParams.get('conversationId');

  if (!conversationId) {
    return NextResponse.json({ error: 'Conversation ID required' }, { status: 400 });
  }

  const modusEndpoint = process.env.NEXT_PUBLIC_MODUS_API || 'http://localhost:8686/graphql'
  const hypermodeApiKey = process.env.HYPERMODE_API_KEY

  if (!hypermodeApiKey) {
    console.error('Hypermode API key not found')
    throw new Error('API key not configured')
  }

  const query = `
    query GetPatterns($conversationId: String!) {
      getConversationPatterns(conversationId: $conversationId) {
        patterns {
          patternId
          observation
          context
          confidence
          timestamp
        }
      }
    }
  `

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
    return NextResponse.json(result);
  } catch (error) {
    console.error('Patterns API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch patterns' }, { status: 500 });
  }
}