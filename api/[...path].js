import { handleRequest } from "../server/app.js";

export default async function handler(request, response) {
  try {
    await handleRequest(request, response);
  } catch (error) {
    console.error("Vercel prompt API request failed.", error);
    if (!response.headersSent) {
      response.writeHead(500, { "Content-Type": "application/json; charset=utf-8" });
    }
    if (!response.writableEnded) {
      response.end(JSON.stringify({ error: "The prompt API encountered an unexpected error." }));
    }
  }
}

export const config = { maxDuration: 15 };
