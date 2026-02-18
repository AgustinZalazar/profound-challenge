import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sessions } from "@/lib/db/schema";
import { desc, ilike, or } from "drizzle-orm";
import { fetchPageContent } from "@/lib/scraper";
import { createSummaryStream } from "@/lib/llm";
import { eq } from "drizzle-orm";

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

// POST /api/sessions — Create session and stream summary
export async function POST(request: NextRequest) {
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

    // Validate URL format
    try {
      new URL(url);
    } catch {
      return NextResponse.json(
        { error: "Invalid URL format" },
        { status: 400 }
      );
    }

    // Create session in pending state
    const [session] = await db
      .insert(sessions)
      .values({ url, status: "pending" })
      .returning();

    sessionId = session.id;

    // Fetch page content
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

    // Update session with title and mark as streaming
    await db
      .update(sessions)
      .set({
        title: pageContent.title,
        status: "streaming",
        updatedAt: new Date(),
      })
      .where(eq(sessions.id, session.id));

    // Stream LLM summary
    const result = createSummaryStream(pageContent.content, pageContent.title);

    // Collect full text in background to persist after stream ends
    (async () => {
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
    })();

    // Return streaming response with session ID in header
    const response = result.toTextStreamResponse();
    response.headers.set("X-Session-Id", session.id);
    return response;
  } catch (error) {
    console.error("Failed to create session:", error);

    // If session was created, mark it as error
    if (sessionId) {
      await db
        .update(sessions)
        .set({
          status: "error",
          error: `Unexpected error: ${(error as Error).message}`,
          updatedAt: new Date(),
        })
        .where(eq(sessions.id, sessionId))
        .catch(() => {});
    }

    return NextResponse.json(
      { error: "Failed to create summary" },
      { status: 500 }
    );
  }
}
