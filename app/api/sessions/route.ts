import { NextRequest, NextResponse } from "next/server";
import { after } from "next/server";
import { db } from "@/lib/db";
import { sessions } from "@/lib/db/schema";
import { desc, ilike, or, eq } from "drizzle-orm";
import { fetchPageContent } from "@/lib/scraper";
import { createSummaryStream } from "@/lib/llm";

// Simple in-memory rate limiter for POST requests - Only for demonstration purposes, not suitable for production
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 10;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  entry.count++;
  return entry.count > RATE_LIMIT_MAX_REQUESTS;
}

// GET /api/sessions?q=searchterm
export async function GET(request: NextRequest) {
  try {
    const query = request.nextUrl.searchParams.get("q")?.trim();

    let result;
    if (query) {
      const pattern = `%${query}%`;
      result = await db
        .select()
        .from(sessions)
        .where(
          or(
            ilike(sessions.url, pattern),
            ilike(sessions.title, pattern),
            ilike(sessions.summary, pattern)
          )
        )
        .orderBy(desc(sessions.createdAt));
    } else {
      result = await db
        .select()
        .from(sessions)
        .orderBy(desc(sessions.createdAt));
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to list sessions:", error);
    return NextResponse.json(
      { error: "Failed to retrieve sessions" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  // Rate limiting
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 }
    );
  }

  let sessionId: string | undefined;

  try {
    const body = await request.json();
    const { url } = body;

    if (!url || typeof url !== "string") {
      return NextResponse.json(
        { error: "A valid URL is required" },
        { status: 400 }
      );
    }

    // Validate URL format and restrict protocols (SSRF protection)
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
    } catch {
      return NextResponse.json(
        { error: "Invalid URL format" },
        { status: 400 }
      );
    }

    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      return NextResponse.json(
        { error: "Only HTTP and HTTPS URLs are supported" },
        { status: 400 }
      );
    }

    const hostname = parsedUrl.hostname;
    if (isPrivateHost(hostname)) {
      return NextResponse.json(
        { error: "URLs pointing to private or internal networks are not allowed" },
        { status: 400 }
      );
    }

    const [existing] = await db
      .select()
      .from(sessions)
      .where(eq(sessions.url, url))
      .orderBy(desc(sessions.createdAt))
      .limit(1);

    if (existing && existing.status === "completed" && existing.summary) {
      return NextResponse.json(
        { error: "This URL has already been summarized. You can find it in your session list." },
        { status: 409 }
      );
    }

    const [session] = await db
      .insert(sessions)
      .values({ url, status: "pending" })
      .returning();

    sessionId = session.id;

    let pageContent;
    try {
      pageContent = await fetchPageContent(url);
    } catch (error) {
      await db
        .update(sessions)
        .set({
          status: "error",
          error: (error as Error).message,
          updatedAt: new Date(),
        })
        .where(eq(sessions.id, session.id));

      return NextResponse.json(
        {
          id: session.id,
          error: `Failed to fetch page: ${(error as Error).message}`,
        },
        { status: 422 }
      );
    }

    await db
      .update(sessions)
      .set({
        title: pageContent.title,
        status: "streaming",
        updatedAt: new Date(),
      })
      .where(eq(sessions.id, session.id));

    const result = createSummaryStream(pageContent.content, pageContent.title);

    // Use after() to persist the completed summary after the response is sent
    // This ensures the work completes even on serverless platforms
    after(async () => {
      try {
        const fullText = await result.text;
        await db
          .update(sessions)
          .set({
            summary: fullText,
            status: "completed",
            updatedAt: new Date(),
          })
          .where(eq(sessions.id, session.id));
      } catch (err: unknown) {
        await db
          .update(sessions)
          .set({
            status: "error",
            error: `LLM error: ${(err as Error).message}`,
            updatedAt: new Date(),
          })
          .where(eq(sessions.id, session.id));
      }
    });

    const response = result.toTextStreamResponse();
    response.headers.set("X-Session-Id", session.id);
    return response;
  } catch (error) {
    console.error("Failed to create session:", error);

    if (sessionId) {
      await db
        .update(sessions)
        .set({
          status: "error",
          error: `Unexpected error: ${(error as Error).message}`,
          updatedAt: new Date(),
        })
        .where(eq(sessions.id, sessionId))
        .catch(() => { });
    }

    return NextResponse.json(
      { error: "Failed to create summary" },
      { status: 500 }
    );
  }
}

function isPrivateHost(hostname: string): boolean {
  // Block localhost variants
  if (hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1" || hostname === "0.0.0.0") {
    return true;
  }

  // Block private IP ranges
  const parts = hostname.split(".").map(Number);
  if (parts.length === 4 && parts.every((p) => !isNaN(p))) {
    // 10.0.0.0/8
    if (parts[0] === 10) return true;
    // 172.16.0.0/12
    if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;
    // 192.168.0.0/16
    if (parts[0] === 192 && parts[1] === 168) return true;
    // 169.254.0.0/16 (link-local)
    if (parts[0] === 169 && parts[1] === 254) return true;
  }

  return false;
}
