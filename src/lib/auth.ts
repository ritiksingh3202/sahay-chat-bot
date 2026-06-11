import { trackEvent } from "./session";

const USERS_KEY = "sahay_users";
const AUTH_KEY = "sahay_auth";

export const ADMIN_EMAIL = "ritiksingh6252@gmail.com";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  phone: string;
};

type StoredUser = AuthUser & { password: string };

function loadUsers(): StoredUser[] {
  if (typeof localStorage === "undefined") return [];
  try {
    const raw = localStorage.getItem(USERS_KEY);
    const users = raw ? (JSON.parse(raw) as StoredUser[]) : [];
    return users.map((u) => ({ ...u, email: u.email ?? "" }));
  } catch {
    return [];
  }
}

function saveUsers(users: StoredUser[]): void {
  if (typeof localStorage !== "undefined") {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }
}

export function loadAuthUser(): AuthUser | null {
  if (typeof localStorage === "undefined") return null;
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    if (!raw) return null;
    const user = JSON.parse(raw) as AuthUser;
    return { ...user, email: user.email ?? "" };
  } catch {
    return null;
  }
}

export function isAuthenticated(): boolean {
  return loadAuthUser() !== null;
}

export function isAdmin(user?: AuthUser | null): boolean {
  const u = user ?? loadAuthUser();
  return u?.email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
}

function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, "").slice(-10);
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function toAuthUser(user: StoredUser): AuthUser {
  return { id: user.id, name: user.name, email: user.email, phone: user.phone };
}

export function signup(
  name: string,
  email: string,
  phone: string,
  password: string,
): { ok: true; user: AuthUser } | { ok: false; error: string } {
  const trimmedName = name.trim();
  const normalizedEmail = normalizeEmail(email);
  const normalized = normalizePhone(phone);

  if (!trimmedName || trimmedName.length < 2) {
    return { ok: false, error: "Please enter your full name." };
  }
  if (!isValidEmail(normalizedEmail)) {
    return { ok: false, error: "Enter a valid email address." };
  }
  if (normalized.length !== 10) {
    return { ok: false, error: "Enter a valid 10-digit mobile number." };
  }
  if (password.length < 6) {
    return { ok: false, error: "Password must be at least 6 characters." };
  }

  const users = loadUsers();
  if (users.some((u) => u.phone === normalized)) {
    return { ok: false, error: "This mobile number is already registered. Please log in." };
  }
  if (users.some((u) => u.email.toLowerCase() === normalizedEmail)) {
    return { ok: false, error: "This email is already registered. Please log in." };
  }

  const user: StoredUser = {
    id: `u-${Date.now()}`,
    name: trimmedName,
    email: normalizedEmail,
    phone: normalized,
    password,
  };
  saveUsers([...users, user]);

  const authUser = toAuthUser(user);
  localStorage.setItem(AUTH_KEY, JSON.stringify(authUser));
  trackEvent("auth:signup");
  return { ok: true, user: authUser };
}

export function login(
  identifier: string,
  password: string,
): { ok: true; user: AuthUser } | { ok: false; error: string } {
  const users = loadUsers();
  const trimmed = identifier.trim();

  let user: StoredUser | undefined;
  if (trimmed.includes("@")) {
    const email = normalizeEmail(trimmed);
    if (!isValidEmail(email)) {
      return { ok: false, error: "Enter a valid email address." };
    }
    user = users.find((u) => u.email.toLowerCase() === email);
  } else {
    const normalized = normalizePhone(trimmed);
    if (normalized.length !== 10) {
      return { ok: false, error: "Enter a valid email or 10-digit mobile number." };
    }
    user = users.find((u) => u.phone === normalized);
  }

  if (!user || user.password !== password) {
    return { ok: false, error: "Invalid credentials. Check email/mobile and password." };
  }

  const authUser = toAuthUser(user);
  if (typeof localStorage !== "undefined") {
    localStorage.setItem(AUTH_KEY, JSON.stringify(authUser));
  }
  trackEvent("auth:login");
  return { ok: true, user: authUser };
}

export function logout(): void {
  if (typeof localStorage !== "undefined") {
    localStorage.removeItem(AUTH_KEY);
  }
  trackEvent("auth:logout");
}
