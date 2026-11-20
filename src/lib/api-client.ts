const DEFAULT_SERVER_URL = "https://fixmate-service-server.vercel.app";
const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || DEFAULT_SERVER_URL;

interface FetchOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
  token?: string | null;
  _isRetry?: boolean;
}

/**
 * Retrieve saved auth JWT token from client storage
 */
export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("fixmate_token");
}

export function setStoredToken(token: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("fixmate_token", token);
}

export function removeStoredToken(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem("fixmate_token");
}

/**
 * Checks if a JWT token is missing, malformed, or expired (with 30s buffer)
 */
export function isTokenExpired(token: string | null, expectedEmail?: string): boolean {
  if (!token) return true;
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return true;
    const payload = JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")));
    if (!payload.email || !payload.email.includes("@")) return true;
    if (expectedEmail && payload.email.toLowerCase() !== expectedEmail.toLowerCase()) return true;
    if (payload.exp && typeof payload.exp === "number") {
      return Date.now() >= (payload.exp * 1000) - 30000;
    }
    return false;
  } catch {
    return true;
  }
}

export function getTokenPayload(token: string | null): any {
  if (!token) return null;
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    return JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")));
  } catch {
    return null;
  }
}

let refreshTokenPromise: Promise<string | null> | null = null;

/**
 * Silently refresh or issue a fresh JWT token for the current Better-Auth session
 */
export async function refreshAuthToken(): Promise<string | null> {
  if (typeof window === "undefined") return null;

  if (refreshTokenPromise) {
    return refreshTokenPromise;
  }

  refreshTokenPromise = (async () => {
    try {
      const { authClient } = await import("@/lib/auth-client");
      const sessionRes = await authClient.getSession();
      const user = sessionRes?.data?.user;

      if (!user?.email) {
        removeStoredToken();
        return null;
      }

      // Request fresh Express JWT token signed with server's JWT_SECRET
      let data: any = null;
      const jwtPayload = JSON.stringify({
        email: user.email,
        name: user.name,
        role: (user as any).role || "customer",
      });

      try {
        const res = await fetch(`${SERVER_URL}/api/auth/jwt`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: jwtPayload,
        });
        data = await res.json().catch(() => null);
      } catch {
        // Fallback to live server if local server is unreachable
        if (SERVER_URL !== DEFAULT_SERVER_URL) {
          const res = await fetch(`${DEFAULT_SERVER_URL}/api/auth/jwt`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: jwtPayload,
          }).catch(() => null);
          data = res ? await res.json().catch(() => null) : null;
        }
      }
      if (data?.success && data?.token) {
        setStoredToken(data.token);
        return data.token as string;
      }

      // Fallback to Next.js Better-Auth /api/auth/token endpoint
      const tokenRes = await fetch("/api/auth/token", { credentials: "include" })
        .then((r) => r.json())
        .catch(() => null);

      if (tokenRes?.token) {
        setStoredToken(tokenRes.token);
        return tokenRes.token as string;
      }

      return null;
    } catch (err) {
      console.warn("[api-client] Token refresh notice:", err);
      return null;
    } finally {
      refreshTokenPromise = null;
    }
  })();

  return refreshTokenPromise;
}

/**
 * Robust fetch client for FixMate Express API with automatic token management and retry
 */
export async function apiFetch<T = any>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { params, headers, token, _isRetry, ...restOptions } = options;

  let url = `${SERVER_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += (url.includes("?") ? "&" : "?") + queryString;
    }
  }

  let activeToken = token !== undefined ? token : getStoredToken();

  // If token is expired or missing in browser, proactively obtain a fresh token
  if (typeof window !== "undefined" && !token && isTokenExpired(activeToken)) {
    activeToken = await refreshAuthToken();
  }

  const authHeaders: Record<string, string> = {};
  if (activeToken) {
    authHeaders["Authorization"] = `Bearer ${activeToken}`;
  }

  let res: Response;
  const fetchConfig: RequestInit = {
    ...restOptions,
    headers: {
      "Content-Type": "application/json",
      ...authHeaders,
      ...headers,
    },
    credentials: "include",
  };

  try {
    res = await fetch(url, fetchConfig);
  } catch (netErr) {
    // If local server is not running, seamlessly fallback to live cloud server
    if (url.includes("localhost:5000")) {
      const fallbackUrl = url.replace("http://localhost:5000", DEFAULT_SERVER_URL);
      res = await fetch(fallbackUrl, fetchConfig);
    } else {
      throw netErr;
    }
  }

  // Handle 401 Unauthorized or 403 Forbidden with automatic transparent token refresh and retry
  if ((res.status === 401 || res.status === 403) && !_isRetry && typeof window !== "undefined") {
    removeStoredToken();
    const freshToken = await refreshAuthToken();
    if (freshToken) {
      return apiFetch<T>(endpoint, {
        ...options,
        token: freshToken,
        _isRetry: true,
      });
    }
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || `Request failed with status ${res.status}`);
  }

  return data as T;
}

export { SERVER_URL };
