# Profound — AI Summarizer

An AI-powered web application that generates concise summaries of any webpage. Paste a URL, and Profound extracts the content, sends it to GPT-4o-mini, and streams a markdown-formatted summary in real time with a blur-to-sharp reveal animation.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 16.1.6](https://nextjs.org/) (App Router, Turbopack) |
| Language | TypeScript 5 |
| UI | React 19, Tailwind CSS 4, Framer Motion 12 |
| Database | [Neon PostgreSQL](https://neon.tech/) (serverless) |
| ORM | [Drizzle ORM](https://orm.drizzle.team/) |
| LLM | [OpenAI GPT-4o-mini](https://platform.openai.com/) via [Vercel AI SDK](https://sdk.vercel.ai/) |
| Scraper | [Cheerio](https://cheerio.js.org/) |
| Validation | [Zod 4](https://zod.dev/) |
| Markdown | [react-markdown](https://github.com/remarkjs/react-markdown) |
| Linting | ESLint 9 with Next.js core-web-vitals + TypeScript config |

## Features

- **URL Summarization** — Paste any URL and get an AI-generated summary
- **Real-time Streaming** — Summary streams word-by-word from the LLM with a blur-to-sharp reveal animation
- **Session Management** — All summaries are persisted in PostgreSQL and listed in a sidebar
- **Search & Filter** — Filter sessions by URL, title, or content (appears when >5 sessions)
- **Copy / Download / Delete** — Action buttons with visual feedback (Copied!, Downloaded!, Deleted!)
- **URL Deduplication** — Prevents re-summarizing already processed URLs (returns 409 with message)
- **Client-side Validation** — URL format, protocol, and domain validation with descriptive error messages
- **Dismissible Errors** — Error messages can be closed by the user
- **Responsive Design** — Sidebar auto-closes on mobile, stays open on desktop
- **Glassmorphism UI** — Dark theme with glass-effect buttons, inputs, and borders
- **Skeleton Loading** — Animated skeleton placeholders while sessions load
- **Entry Animations** — Staggered fade-in-up animations on the landing page (FadeInUp, WordReveal)
- **Floating URL Bar** — Shows the source URL when scrolled past the footer, hides when footer is visible (IntersectionObserver)
- **Rate Limiting** — In-memory rate limiter (10 requests/minute per IP)
- **SSRF Protection** — Blocks private/internal IP ranges and localhost
- **Error Boundary** — Next.js `error.tsx` catches unhandled errors with a retry button
- **Loading State** — Next.js `loading.tsx` shows a spinner during page transitions
- **SEO** — Open Graph and Twitter Card meta tags with custom image
- **Accessibility** — `aria-label` on all icon-only buttons and interactive elements

## Project Structure

```
profound/
├── app/
│   ├── animations/
│   │   ├── FadeInUp.tsx          # Fade-in-up animation wrapper (framer-motion)
│   │   └── WordReveal.tsx        # Word-by-word reveal animation
│   ├── api/
│   │   └── sessions/
│   │       ├── route.ts          # GET (list) + POST (create & stream) sessions
│   │       └── [id]/route.ts     # GET (single) + DELETE session
│   ├── components/
│   │   ├── icons/                # SVG icon components (Close, Copy, Delete, Download, Logo, More, Search)
│   │   ├── BigGlow.tsx           # Background glow effect (GPU-accelerated)
│   │   ├── SmallGlow.tsx         # Form area glow effect
│   │   ├── Form.tsx              # URL input form
│   │   ├── GlassButton.tsx       # Reusable glassmorphism button (default/ghost/danger variants)
│   │   ├── GlassInput.tsx        # Glassmorphism text input
│   │   ├── Header.tsx            # Top bar (shown when sidebar is closed)
│   │   ├── Sidebar.tsx           # Session list with filter, skeleton loading
│   │   └── SummaryDisplay.tsx    # Summary renderer with streaming animation, action buttons
│   ├── hooks/
│   │   ├── useSessions.ts        # Fetches, caches, and deletes sessions
│   │   └── useStreamingSummary.ts # Handles URL submission, streaming, validation, errors
│   ├── error.tsx                 # Error boundary UI
│   ├── globals.css               # Glass effect CSS classes, shadows, borders
│   ├── layout.tsx                # Root layout with metadata, fonts, favicons
│   ├── loading.tsx               # Loading spinner UI
│   └── page.tsx                  # Main page — composes all components
├── lib/
│   ├── db/
│   │   ├── index.ts              # Neon + Drizzle connection
│   │   └── schema.ts             # Sessions table schema
│   ├── llm.ts                    # OpenAI streaming integration
│   ├── scraper.ts                # Cheerio-based content extraction
│   └── validators.ts             # Zod schemas for API responses
├── public/
│   ├── favicon/                  # Favicon files (ico, png, apple-touch)
│   └── image-metatag.png         # OG/Twitter card image
├── drizzle.config.ts             # Drizzle Kit configuration
├── eslint.config.mjs             # ESLint flat config
├── next.config.ts                # Next.js configuration
├── postcss.config.mjs            # PostCSS (Tailwind)
├── tailwind.config.ts            # Tailwind CSS configuration
└── tsconfig.json                 # TypeScript configuration
```

## API Reference

### `GET /api/sessions`

List all sessions, optionally filtered by search query.

| Parameter | Type | Description |
|---|---|---|
| `q` | query string (optional) | Search term — filters by URL, title, or summary content |

**Response:** `200 OK`
```json
[
  {
    "id": "uuid",
    "url": "https://example.com",
    "title": "Example Page",
    "summary": "Markdown summary...",
    "status": "completed",
    "error": null,
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  }
]
```

### `POST /api/sessions`

Create a new session and stream the AI-generated summary.

**Request Body:**
```json
{ "url": "https://example.com" }
```

**Response:** `200 OK` — Streamed text (chunked transfer encoding)
- Header `X-Session-Id` contains the new session UUID
- Body streams the markdown summary in real-time

**Error Responses:**

| Status | Condition |
|---|---|
| `400` | Missing URL, invalid format, unsupported protocol, private IP |
| `409` | URL already summarized (deduplication) |
| `422` | Failed to fetch page content |
| `429` | Rate limited (>10 requests/minute) |
| `500` | Internal server error |

### `GET /api/sessions/:id`

Get a single session by ID.

**Response:** `200 OK` — Session object (same shape as list items)

### `DELETE /api/sessions/:id`

Delete a session.

**Response:** `204 No Content`

## Database Schema

Single `sessions` table (PostgreSQL):

| Column | Type | Description |
|---|---|---|
| `id` | UUID (PK) | Auto-generated |
| `url` | TEXT NOT NULL | Source URL |
| `title` | TEXT | Extracted page title |
| `summary` | TEXT | AI-generated markdown summary |
| `status` | TEXT NOT NULL | `pending` → `streaming` → `completed` / `error` |
| `error` | TEXT | Error message (if failed) |
| `created_at` | TIMESTAMP | Auto-set on creation |
| `updated_at` | TIMESTAMP | Updated on each state change |

## Getting Started

### Prerequisites

- Node.js 18+
- A [Neon](https://neon.tech/) PostgreSQL database
- An [OpenAI API key](https://platform.openai.com/api-keys)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd profound

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local
```

### Environment Variables

Edit `.env.local` with your credentials:

```env
# OpenAI API Key
OPENAI_API_KEY=sk-...

# Neon PostgreSQL connection string
DATABASE_URL=postgresql://user:password@host/database?sslmode=require
```

### Database Setup

Push the schema to your database:

```bash
npx drizzle-kit push
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Production Build

```bash
npm run build
npm start
```

### Linting

```bash
npm run lint
```

## Architecture Decisions

### Streaming with `after()`

The POST endpoint streams the LLM response directly to the client, then uses Next.js `after()` to persist the completed summary to the database after the response is sent. This ensures the user sees the summary immediately while the database write happens in the background — critical for serverless environments where the function might terminate after the response.

### Streaming Animation System

`SummaryDisplay` implements a blur-to-sharp word reveal animation for streaming text. Key design decisions:

- **Memoized ReactMarkdown components** (`useMemo`) prevent React from unmounting/remounting DOM nodes on every streaming chunk
- **`wrapRef` pattern** bridges memoized components with current render state (word counter, revealed count)
- **Recursive `cloneElement`** traverses React element children (bold, links, etc.) to maintain word counter in reading order
- **`useEffect` without deps** intentionally runs after every render to snapshot the word count for the next frame

### Content Extraction

The scraper uses Cheerio to:
1. Remove non-content elements (scripts, styles, nav, footer, iframes)
2. Prefer semantic content containers (`<article>`, `<main>`, `[role="main"]`)
3. Fall back to `<body>` text
4. Truncate to 10,000 characters to stay within LLM context limits

### Client-side Validation

URL validation runs on the client before hitting the API:
1. `new URL()` constructor — catches malformed URLs
2. Protocol check — only `http:` and `https:`
3. Hostname dot check — rejects `localhost`, bare words

The server duplicates these checks plus SSRF protection (private IP blocking).

### Glassmorphism CSS System

Glass effects are implemented as utility CSS classes in `globals.css`:
- `glass-bg` — Semi-transparent gradient background
- `glass-border` / `glass-border-soft` / `glass-border-medium` — Gradient borders via mask-composite
- `glass-shadow-*` — Multi-layer box shadows with inset highlights
- `glass-btn-*` — Button variant backgrounds (default purple, ghost transparent, danger red)

## Deploy

Deploy to [Vercel](https://vercel.com/) with zero configuration:

1. Push to GitHub
2. Import the repository in Vercel
3. Add `OPENAI_API_KEY` and `DATABASE_URL` environment variables
4. Deploy

## Known Limitations

- **In-memory rate limiter** — Does not persist across serverless instances. For production, use Redis/Upstash
- **No authentication** — All sessions are public. Add auth (NextAuth, Clerk) for multi-user support
- **No tests** — Test coverage is planned but not yet implemented
