"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4">
      <div className="text-center">
        <h2 className="mb-2 text-xl font-semibold text-white">
          Something went wrong
        </h2>
        <p className="mb-6 text-sm text-white/60">
          {error.message || "An unexpected error occurred."}
        </p>
        <button
          onClick={reset}
          className="rounded-full bg-purple-600 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-purple-500"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
