import type {
  BureauSettings,
  BureauStats,
  ContactRequest,
  MatrimonialProfile,
  PublicBureauSettings,
  TrackStatusResponse,
} from '../types';

const ADMIN_TOKEN_KEY = 'noor_rishta_admin_token';

export function getStoredAdminToken(): string | null {
  try {
    return sessionStorage.getItem(ADMIN_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setStoredAdminToken(token: string | null): void {
  try {
    if (token) {
      sessionStorage.setItem(ADMIN_TOKEN_KEY, token);
    } else {
      sessionStorage.removeItem(ADMIN_TOKEN_KEY);
    }
  } catch {
    // Ignore storage errors in restricted environments
  }
}

async function requestJson<T>(url: string, init: RequestInit = {}, includeAdmin = false): Promise<T> {
  const headers = new Headers(init.headers || {});
  if (init.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  if (includeAdmin) {
    const token = getStoredAdminToken();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }
  const res = await fetch(url, {
    ...init,
    headers,
    credentials: 'include',
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `Request failed (${res.status})`);
  }
  return data as T;
}

export function formatWhatsappHref(whatsappIntl: string, message: string): string {
  const digits = whatsappIntl.replace(/[^\d]/g, '') || '923096102719';
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

export async function fetchPublicBootstrap(): Promise<{
  settings: PublicBureauSettings;
  profiles: MatrimonialProfile[];
  stats: BureauStats;
}> {
  return requestJson('/api/public/bootstrap');
}

export async function submitPublicProfile(payload: Partial<MatrimonialProfile>): Promise<{
  profile: MatrimonialProfile;
  whatsappUrl: string;
  whatsappMessage: string;
}> {
  return requestJson('/api/public/profiles', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function submitContactRequest(payload: {
  profileId: string;
  requesterName: string;
  requesterCity: string;
  requesterPhone: string;
  relationToCandidate: string;
  message: string;
}): Promise<{
  request: ContactRequest;
  whatsappUrl: string;
  whatsappMessage: string;
}> {
  return requestJson('/api/public/contact-requests', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function trackReferenceStatus(refCode: string): Promise<TrackStatusResponse> {
  return requestJson(`/api/public/track/${encodeURIComponent(refCode.trim())}`);
}

export async function checkAdminSession(): Promise<{ authenticated: boolean }> {
  return requestJson('/api/admin/session', {}, true);
}

export async function loginAdmin(password: string): Promise<{ authenticated: boolean; token: string }> {
  const data = await requestJson<{ authenticated: boolean; token: string }>(
    '/api/admin/login',
    {
      method: 'POST',
      body: JSON.stringify({ password }),
    }
  );
  if (data.token) {
    setStoredAdminToken(data.token);
  }
  return data;
}

export async function logoutAdmin(): Promise<void> {
  await requestJson('/api/admin/logout', { method: 'POST' }, true);
  setStoredAdminToken(null);
}

export async function fetchAdminDashboard(): Promise<{
  settings: BureauSettings;
  profiles: MatrimonialProfile[];
  requests: ContactRequest[];
  stats: BureauStats;
}> {
  return requestJson('/api/admin/dashboard', {}, true);
}

export async function createAdminProfile(payload: Partial<MatrimonialProfile>): Promise<{
  profile: MatrimonialProfile;
  stats: BureauStats;
}> {
  return requestJson(
    '/api/admin/profiles',
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
    true
  );
}

export async function updateAdminProfile(
  id: string,
  payload: Partial<MatrimonialProfile>
): Promise<{
  profile: MatrimonialProfile;
  stats: BureauStats;
}> {
  return requestJson(
    `/api/admin/profiles/${encodeURIComponent(id)}`,
    {
      method: 'PATCH',
      body: JSON.stringify(payload),
    },
    true
  );
}

export async function deleteAdminProfile(id: string): Promise<{ deleted: boolean; stats: BureauStats }> {
  return requestJson(
    `/api/admin/profiles/${encodeURIComponent(id)}`,
    {
      method: 'DELETE',
    },
    true
  );
}

export async function updateAdminRequestStatus(
  id: string,
  status: ContactRequest['status']
): Promise<{
  request: ContactRequest;
  stats: BureauStats;
}> {
  return requestJson(
    `/api/admin/requests/${encodeURIComponent(id)}`,
    {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    },
    true
  );
}

export async function deleteAdminRequest(id: string): Promise<{ deleted: boolean; stats: BureauStats }> {
  return requestJson(
    `/api/admin/requests/${encodeURIComponent(id)}`,
    {
      method: 'DELETE',
    },
    true
  );
}

export async function updateAdminSettings(
  payload: Partial<BureauSettings> & { newAdminPassword?: string }
): Promise<{
  settings: BureauSettings;
  stats: BureauStats;
}> {
  return requestJson(
    '/api/admin/settings',
    {
      method: 'PATCH',
      body: JSON.stringify(payload),
    },
    true
  );
}
