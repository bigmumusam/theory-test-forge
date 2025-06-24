const API_BASE = "http://localhost:8000/api";

export function getToken() {
  return localStorage.getItem('token');
}

export async function request(url: string, options: RequestInit = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  // 自动拼接 API 前缀
  const fullUrl = url.startsWith("http") ? url : API_BASE + url;

  const res = await fetch(fullUrl, { ...options, headers });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
} 