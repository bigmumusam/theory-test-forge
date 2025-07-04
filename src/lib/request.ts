// const API_BASE = "http://localhost:8000/api";
const API_BASE = import.meta.env.VITE_API_BASE;

export function getToken() {
  return localStorage.getItem('token');
}

export async function request(url: string, options: RequestInit = {}) {
  const token = getToken();
  // 判断是否是 FormData
  const isFormData = options.body instanceof FormData;
  const headers = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  // 自动拼接 API 前缀
  const fullUrl = url.startsWith("http") ? url : API_BASE + url;

  const res = await fetch(fullUrl, { ...options, headers });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
} 

// 新增 post 方法
export async function post<T = any>(url: string, data?: any, options: RequestInit = {}) {
  return request(url, {
    ...options,
    method: 'POST',
    body: JSON.stringify(data),
  }) as Promise<T>;
} 