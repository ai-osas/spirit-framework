// src/app/api/entries/route.ts
import { NextResponse } from 'next/server';
import { getStoredTokens } from '@/lib/auth';

const DJANGO_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
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

    const response = await fetch(`${DJANGO_API_URL}/api/journal/entries/`, {
      method: 'POST',
      headers: {
        'Authorization': authHeader || `Bearer ${getStoredTokens()?.access_token}`,
      },
      body: formData
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
    console.error('Journal API Error:', error);
    return NextResponse.json(
      { error: 'Failed to process journal request' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
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

    const response = await fetch(`${DJANGO_API_URL}/api/journal/entries/`, {
      headers: {
        'Authorization': authHeader || `Bearer ${getStoredTokens()?.access_token}`,
      },
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
    console.error('Journal API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch journal entries' },
      { status: 500 }
    );
  }
}