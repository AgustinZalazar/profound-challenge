import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";

const SYSTEM_PROMPT = `You are a helpful assistant that summarizes webpage content.
Given the text content of a webpage, provide a clear, well-structured summary that captures the key points.
Use markdown formatting for readability. Keep the summary concise but informative.
Do NOT start with a title like "Summary of..." — jump straight into the content.
Always respond in English regardless of the source language.
If the content appears to be minimal or not meaningful, note that in your summary.`;

export function createSummaryStream(content: string, title: string) {
  return streamText({
    model: openai("gpt-4o-mini"),
    system: SYSTEM_PROMPT,
    prompt: `Summarize the following webpage${title ? ` titled "${title}"` : ""}:\n\n${content}`,
  });
}
