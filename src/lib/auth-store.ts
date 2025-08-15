import { AuthTokens } from "@/types/auth";

const ACCESS_KEY = "myanycart.access";
const REFRESH_KEY = "myanycart.refresh";
const USER_KEY = "myanycart.user";

export const authStore = {
  get(): AuthTokens | null {
    if (typeof window === "undefined") return null;
    const access = localStorage.getItem(ACCESS_KEY);
    const refresh = localStorage.getItem(REFRESH_KEY);
    const userRaw = localStorage.getItem(USER_KEY);
    if (!access || !refresh) return null;
    return { access, refresh, user: userRaw ? JSON.parse(userRaw) : undefined };
  },
  set(session: AuthTokens) {
    if (typeof window === "undefined") return;
    localStorage.setItem(ACCESS_KEY, session.access);
    localStorage.setItem(REFRESH_KEY, session.refresh);
    localStorage.setItem(USER_KEY, JSON.stringify(session.user ?? null));
  },
  clear() {
    if (typeof window === "undefined") return;
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem(USER_KEY);
  },
  setAccess(access: string) {
    if (typeof window === "undefined") return;
    localStorage.setItem(ACCESS_KEY, access);
  },
};
