// src/app/api/chat/route.ts

import { NextResponse } from 'next/server'
import type { SpiritChatResponse, SpiritChatVariables } from '@/types/spirit'

export async function POST(request: Request) {
  // Add detailed logging at the start
  console.log('Environment Variables Check:', {
    HYPERMODE_API_KEY_EXISTS: !!process.env.HYPERMODE_API_KEY,
    MODUS_API: process.env.NEXT_PUBLIC_MODUS_API,
    ENV_KEYS: Object.keys(process.env).filter(key => key.includes('HYPERMODE') || key.includes('MODUS')),
    NODE_ENV: process.env.NODE_ENV
  });
  try {
    const variables: SpiritChatVariables = await request.json()
    const modusEndpoint = process.env.NEXT_PUBLIC_MODUS_API || 'http://localhost:8686/graphql'
    const hypermodeApiKey = process.env.HYPERMODE_API_KEY

    // Verify API key exists
    if (!hypermodeApiKey) {
      console.error('Hypermode API key not found')
      throw new Error('API key not configured')
    }
    // Test 
    console.log('Modus Endpoint:', modusEndpoint)

    const query = `
      query SpiritChat($message: String!, $conversationId: String!) {
        spiritChat(message: $message, conversationId: $conversationId)
      }
    `

    const response = await fetch(modusEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${hypermodeApiKey}`
      },
      body: JSON.stringify({
        query,
        variables,
      })
    })

    // src/app/api/chat/route.ts
  // After processing chat and before returning response
  console.log('Chat processing completed, conversationId:', variables.conversationId);

    // Check if the response is ok
    if (!response.ok) {
      const errorText = await response.text()
      console.error('Hypermode API Error:', errorText)
      throw new Error(`API request failed: ${response.status} ${response.statusText}`)
    }

    const result = await response.json() as SpiritChatResponse
    
    if ('errors' in result) {
      throw new Error(JSON.stringify(result.errors))
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Chat API Error:', error)
    return NextResponse.json(
      {
        data: {
          spiritChat: "I apologize, but I encountered an error. Please try again."
        }
      },
      { status: 500 }
    )
  }
}