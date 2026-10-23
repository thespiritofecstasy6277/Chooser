import type { DareTopic } from "./darePrompts";

export async function requestPrompt(
  topic: DareTopic,
  kind: "truth" | "dare",
  adult: boolean,
): Promise<string> {
  const response = await fetch("/api/prompts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ topic, kind, adult }),
  });

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new Error("The prompt feed returned an invalid response.");
  }

  if (!response.ok) {
    const error =
      typeof payload === "object" &&
      payload !== null &&
      "error" in payload &&
      typeof payload.error === "string"
        ? payload.error
        : "The prompt feed is unavailable.";
    throw Object.assign(new Error(error), { status: response.status });
  }

  if (
    typeof payload !== "object" ||
    payload === null ||
    !("prompt" in payload) ||
    typeof payload.prompt !== "string" ||
    !payload.prompt.trim() ||
    payload.prompt.length > 500
  ) {
    throw new Error("The prompt feed returned an invalid prompt.");
  }

  return payload.prompt.trim();
}
