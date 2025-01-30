// src/app/api/chat/route.ts
import { NextResponse } from 'next/server';
import { getStoredTokens } from '@/lib/auth';

const DJANGO_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function POST(request: Request) {
    try {
        // Get request body and header
        const body = await request.json();
        const authHeader = request.headers.get('Authorization');
        
        if (!authHeader) {
            const tokens = getStoredTokens();
            if (!tokens?.access_token) {
                return NextResponse.json(
                    { error: 'Not authenticated' },
                    { status: 401 }
                );
            }
        }

        const response = await fetch(`${DJANGO_API_URL}/api/chat/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': authHeader || `Bearer ${getStoredTokens()?.access_token}`,
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const errorData = await response.text();
            console.error('Django API Error:', errorData);
            return NextResponse.json(
                { error: `Backend error: ${response.status}` },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Chat API Error:', error);
        return NextResponse.json(
            { error: 'Failed to process chat request' },
            { status: 500 }
        );
    }
}