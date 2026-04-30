"use client";

export default function LoadingDots() {
  return (
    <div className="flex items-center gap-1 px-4 py-3">
      <span className="loading-dot" />
      <span className="loading-dot" />
      <span className="loading-dot" />
    </div>
  );
}
