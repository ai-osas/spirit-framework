import { NextResponse } from 'next/server'
import type { SpiritChatResponse, SpiritChatVariables } from '@/types/spirit'

export async function POST(request: Request) {
  try {
    const variables: SpiritChatVariables = await request.json()

    const query = `
      query SpiritChat($message: String!, $conversationId: String!) {
        spiritChat(message: $message, conversationId: $conversationId)
      }
    `

    const response = await fetch('http://localhost:8686/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        variables,
      })
    })

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