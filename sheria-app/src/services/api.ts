import {
  API_ENDPOINTS,
  ChatRequest,
  ChatResponse,
  UploadResponse,
} from "@/types";


export async function uploadDocument(file: File): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(API_ENDPOINTS.uploadDocument, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(
      err?.message || err?.detail || `Upload failed: ${response.statusText}`
    );
  }

  return response.json();
}

export async function sendChatMessage(
  payload: ChatRequest
): Promise<ChatResponse> {
  const response = await fetch(API_ENDPOINTS.chat, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(
      err?.message || err?.detail || `Chat request failed: ${response.statusText}`
    );
  }

  return response.json();
}


export async function* sendChatMessageStream(
  payload: ChatRequest
): AsyncGenerator<string, void, unknown> {
  const response = await fetch(API_ENDPOINTS.chatStream, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "text/event-stream",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(
      err?.message || err?.detail || `Stream request failed: ${response.statusText}`
    );
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error("No response body reader");

  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
  
      if (!line.startsWith("data:")) continue;

      const data = line.slice(5);

  
      if (data === "" || data.trimStart() === "[DONE]") continue;

      try {
        const parsed = JSON.parse(data);
        const token =
          parsed?.token ??
          parsed?.content ??
          parsed?.text ??
          parsed?.delta?.content;
        if (typeof token === "string") yield token;
      } catch {
        // Plain text token — yield with spaces intact
        yield data;
      }
    }
  }
}