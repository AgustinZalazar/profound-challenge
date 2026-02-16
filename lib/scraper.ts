import * as cheerio from "cheerio";

const MAX_CONTENT_LENGTH = 10000;
const FETCH_TIMEOUT_MS = 15000;

interface PageContent {
  title: string;
  content: string;
}

export async function fetchPageContent(url: string): Promise<PageContent> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; SummaryBot/1.0; +https://example.com)",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error(`Request timed out after ${FETCH_TIMEOUT_MS / 1000}s`);
    }
    throw new Error(`Failed to fetch URL: ${(error as Error).message}`);
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("text/html") && !contentType.includes("text/plain")) {
    throw new Error(`Unsupported content type: ${contentType}`);
  }

  const html = await response.text();
  const $ = cheerio.load(html);

  // Remove non-content elements
  $("script, style, nav, footer, header, aside, iframe, noscript, svg").remove();
  $('[role="navigation"], [role="banner"], [role="contentinfo"]').remove();

  const title = $("title").first().text().trim() ||
    $('meta[property="og:title"]').attr("content")?.trim() ||
    $("h1").first().text().trim() ||
    "";

  // Extract main content, preferring article/main elements
  let textContent = "";
  const mainSelectors = ["article", "main", '[role="main"]', ".content", "#content"];

  for (const selector of mainSelectors) {
    const el = $(selector);
    if (el.length && el.text().trim().length > 200) {
      textContent = el.text();
      break;
    }
  }

  if (!textContent) {
    textContent = $("body").text();
  }

  // Clean up whitespace
  const cleaned = textContent
    .replace(/\s+/g, " ")
    .trim();

  if (!cleaned) {
    throw new Error("No readable content found on the page");
  }

  return {
    title,
    content: cleaned.slice(0, MAX_CONTENT_LENGTH),
  };
}
