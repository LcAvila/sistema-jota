import { getToken } from '@/lib/auth';

export type ApiFetchOptions = RequestInit & { auth?: boolean };

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

function isPublicPath(path: string) {
  return path.startsWith('/public');
}

export async function apiFetch(path: string, options: ApiFetchOptions = {}) {
  const url = path.startsWith('http') ? path : `${API_BASE}${path.startsWith('/') ? '' : '/'}${path}`;
  const headers = new Headers(options.headers || {});

  // Define JSON default
  if (!headers.has('Content-Type') && options.body && typeof options.body === 'string') {
    headers.set('Content-Type', 'application/json');
  }

  // Inject Authorization unless public path or explicitly disabled
  const wantsAuth = options.auth !== false && !isPublicPath(path.replace(API_BASE, ''));
  if (wantsAuth && !headers.has('Authorization')) {
    const token = getToken();
    if (token) headers.set('Authorization', `Bearer ${token}`);
  }

  const init: RequestInit = { ...options, headers };
  const resp = await fetch(url, init);
  return resp;
}
