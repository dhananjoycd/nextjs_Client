import { config } from "@/lib/config";

type RequestOptions = RequestInit & {
  token?: string | null;
  skipAuthHandling?: boolean;
};

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export const AUTH_EXPIRED_EVENT = "foodhub:auth-expired";

export async function apiRequest<T>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<T> {
  const { token, headers, skipAuthHandling = false, ...rest } = options;
  const response = await fetch(`${config.apiBaseUrl}${endpoint}`, {
    ...rest,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(headers ?? {}),
    },
    cache: "no-store",
  });

  const body = await parseJson(response);
  if (!response.ok) {
    const message =
      (body as { message?: string } | null)?.message ?? "Request failed";
    const status = response.status;

    if (
      !skipAuthHandling &&
      typeof window !== "undefined" &&
      (status === 401 || status === 403)
    ) {
      window.dispatchEvent(
        new CustomEvent(AUTH_EXPIRED_EVENT, {
          detail: { status, endpoint },
        }),
      );
    }

    throw new ApiError(message, status);
  }

  return extractPayload<T>(body);
}

export function extractPayload<T>(body: unknown): T {
  if (body && typeof body === "object") {
    const maybeRecord = body as Record<string, unknown>;
    if ("data" in maybeRecord) {
      const directData = maybeRecord.data;
      if (
        directData &&
        typeof directData === "object" &&
        "data" in (directData as Record<string, unknown>)
      ) {
        const directDataRecord = directData as Record<string, unknown>;
        const nestedData = directDataRecord.data;
        const keys = Object.keys(directDataRecord);
        // Only unwrap when the nested object is a pure { data: [...] } envelope.
        if (
          Array.isArray(nestedData) &&
          keys.length === 1 &&
          keys[0] === "data"
        ) {
          return nestedData as T;
        }
      }
      return directData as T;
    }
    if ("result" in maybeRecord) return maybeRecord.result as T;
  }
  return body as T;
}

async function parseJson(response: Response) {
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return null;
  return response.json();
}
