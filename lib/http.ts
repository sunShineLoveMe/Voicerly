const API_BASE = process.env.NEXT_PUBLIC_API_BASE || ""

interface HttpError extends Error {
  status?: number
}

export async function postJson<T>(path: string, body: unknown): Promise<T> {
  const url = `${API_BASE}${path}`

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body ?? {}),
    credentials: "include",
  })

  let data: any = null
  try {
    data = await response.json()
  } catch (error) {
    // ignore json parse error, will be handled below
  }

  if (!response.ok) {
    const error: HttpError = new Error(data?.error || data?.message || "Request failed")
    error.status = response.status
    throw error
  }

  return data as T
}

