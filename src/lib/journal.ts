import { getStoredTokens } from './auth';

export interface JournalEntry {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  media: {
    id: string;
    file_type: string;
    file_url: string;
  }[];
  patterns?: unknown[]; // Use 'unknown' if you don't have a specific type for patterns
}

export interface APIError {
  error: string;
  detail?: string;
}

const DJANGO_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

async function handleResponse(response: Response) {
  if (!response.ok) {
    let errorMessage: string;
    try {
      const errorData = await response.json() as APIError;
      errorMessage = errorData.detail || errorData.error || response.statusText;
    } catch {
      errorMessage = await response.text() || response.statusText;
    }
    throw new Error(errorMessage);
  }
  return response.json();
}

function getAuthHeaders(token: string) {
  return {
    'Authorization': `Bearer ${token}`,
  };
}

export async function createEntry(data: {
  title: string;
  content: string;
  media?: File[];
}) {
  const tokens = getStoredTokens();
  if (!tokens?.access_token) {
    throw new Error('Not authenticated');
  }

  const formData = new FormData();
  formData.append('title', data.title);
  formData.append('content', data.content);

  if (data.media?.length) {
    data.media.forEach(file => {
      formData.append('media', file);
    });
  }

  const response = await fetch(`${DJANGO_API_URL}/api/journal/entries/`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${tokens.access_token}`,
    },
    body: formData
  });

  return handleResponse(response);
}

export async function updateEntry(
  id: string,
  data: {
    title: string;
    content: string;
    media?: File[];
  }
) {
  const tokens = getStoredTokens();
  if (!tokens?.access_token) {
    throw new Error('Not authenticated');
  }

  const formData = new FormData();
  formData.append('title', data.title);
  formData.append('content', data.content);

  if (data.media?.length) {
    data.media.forEach(file => {
      formData.append('media', file);
    });
  }

  const response = await fetch(`${DJANGO_API_URL}/api/journal/entries/${id}/`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${tokens.access_token}`,
    },
    body: formData
  });

  return handleResponse(response);
}

export async function getEntries() {
  const tokens = getStoredTokens();
  if (!tokens?.access_token) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(`${DJANGO_API_URL}/api/journal/entries/`, {
    headers: getAuthHeaders(tokens.access_token)
  });

  return handleResponse(response);
}

export async function getEntry(id: string) {
  const tokens = getStoredTokens();
  if (!tokens?.access_token) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(`${DJANGO_API_URL}/api/journal/entries/${id}/`, {
    headers: getAuthHeaders(tokens.access_token)
  });

  return handleResponse(response);
}

export async function deleteEntry(id: string) {
  const tokens = getStoredTokens();
  if (!tokens?.access_token) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(`${DJANGO_API_URL}/api/journal/entries/${id}/`, {
    method: 'DELETE',
    headers: getAuthHeaders(tokens.access_token)
  });

  if (!response.ok) {
    throw new Error('Failed to delete entry');
  }
}