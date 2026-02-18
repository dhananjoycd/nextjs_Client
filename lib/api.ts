import { config } from "@/lib/config";

type RequestOptions = RequestInit & {
  token?: string | null;
};

export async function apiRequest<T>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<T> {
  const { token, headers, ...rest } = options;
  const response = await fetch(`${config.apiBaseUrl}${endpoint}`, {
    ...rest,
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
    throw new Error(message);
  }

  return extractPayload<T>(body);
}

export function extractPayload<T>(body: unknown): T {
  if (body && typeof body === "object") {
    const maybeRecord = body as Record<string, unknown>;
    if ("data" in maybeRecord) return maybeRecord.data as T;
    if ("result" in maybeRecord) return maybeRecord.result as T;
  }
  return body as T;
}

async function parseJson(response: Response) {
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return null;
  return response.json();
}
