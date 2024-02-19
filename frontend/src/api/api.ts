import { QueryClient } from "@tanstack/react-query";

export const HOST_URL = import.meta.env.VITE_API_URL;
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 10,
    },
  },
});

export class HttpError extends Error {
  public readonly status: number;

  public constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

interface ValidationError {
  field: string;
  message: string;
  rule: string;
}
export class UnprocessableContentError extends HttpError {
  public constructor(public readonly errors: ValidationError[]) {
    super("Unprocessable content", 422);
  }
}

export class ConflictError extends HttpError {
  public constructor(message: string) {
    super(message, 409);
  }
}

export async function fetcher<T = void>(
  url: string,
  options?: RequestInit
): Promise<T> {
  let transformedUrl = HOST_URL;
  if (!url.startsWith("/")) {
    transformedUrl += "/";
  }
  transformedUrl += url;

  const res = await fetch(transformedUrl, {
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  });
  if (!res.ok) {
    if (res.status === 422) {
      throw new UnprocessableContentError(
        await res.json().then((e) => e.errors)
      );
    }

    if (res.status === 409) {
      throw new ConflictError(await res.json().then((e) => e.message));
    }

    throw new HttpError(
      "An error occurred while fetching the data.",
      res.status
    );
  }
  if (res.status === 204) {
    return {} as T;
  }
  return res.json();
}