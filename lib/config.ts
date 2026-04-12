const DEFAULT_APP_URL = "http://localhost:3000";
const DEFAULT_API_URL = "http://localhost:5000";
const AUTH_CALLBACK_PATH = "/auth/callback";

function trimTrailingSlash(value: string) {
  return value.endsWith("/") ? value.slice(0, -1) : value;
}

function getConfiguredAppUrl() {
  const envUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (envUrl) return trimTrailingSlash(envUrl);

  if (typeof window !== "undefined" && window.location.origin) {
    return trimTrailingSlash(window.location.origin);
  }

  return DEFAULT_APP_URL;
}

export const config = {
  appBaseUrl: getConfiguredAppUrl(),
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL ?? DEFAULT_API_URL,
  authCallbackPath: AUTH_CALLBACK_PATH,
  get authCallbackUrl() {
    return `${getConfiguredAppUrl()}${AUTH_CALLBACK_PATH}`;
  },
};
