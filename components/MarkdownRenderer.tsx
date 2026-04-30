"use client";

import React from "react";
import { AlertTriangle } from "lucide-react";

interface MarkdownProps {
  content: string;
}

// Very lightweight markdown renderer — handles the subset OMFS Coach uses
export default function MarkdownRenderer({ content }: MarkdownProps) {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // H3
    if (line.startsWith("### ")) {
      const text = line.slice(4).trim();
      const isRedFlag =
        text.toLowerCase().includes("red flag") ||
        text.includes("⚠️");
      elements.push(
        <h3
          key={i}
          className={`font-display text-base font-bold mt-5 mb-2 ${
            isRedFlag ? "text-crimson-500" : "text-bone-100"
          }`}
        >
          {isRedFlag && (
            <AlertTriangle className="inline mr-1.5 mb-0.5 h-4 w-4" />
          )}
          {text}
        </h3>
      );
      i++;
      continue;
    }

    // H2
    if (line.startsWith("## ")) {
      elements.push(
        <h2
          key={i}
          className="font-display text-lg font-bold mt-6 mb-2 text-bone-50"
        >
          {line.slice(3).trim()}
        </h2>
      );
      i++;
      continue;
    }

    // Bullet list
    if (line.startsWith("- ") || line.startsWith("* ")) {
      const listItems: string[] = [];
      while (
        i < lines.length &&
        (lines[i].startsWith("- ") || lines[i].startsWith("* "))
      ) {
        listItems.push(lines[i].slice(2).trim());
        i++;
      }
      elements.push(
        <ul key={`ul-${i}`} className="space-y-1.5 pl-1 my-2">
          {listItems.map((item, idx) => (
            <li key={idx} className="flex gap-2 text-sm text-bone-100/85 leading-relaxed">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-steel-400/60" />
              <span dangerouslySetInnerHTML={{ __html: formatInline(item) }} />
            </li>
          ))}
        </ul>
      );
      continue;
    }

    // Numbered list
    if (/^\d+\. /.test(line)) {
      const listItems: string[] = [];
      while (i < lines.length && /^\d+\. /.test(lines[i])) {
        listItems.push(lines[i].replace(/^\d+\. /, "").trim());
        i++;
      }
      elements.push(
        <ol key={`ol-${i}`} className="space-y-1.5 pl-1 my-2 list-none counter-reset-item">
          {listItems.map((item, idx) => (
            <li key={idx} className="flex gap-2.5 text-sm text-bone-100/85 leading-relaxed">
              <span className="shrink-0 flex h-5 w-5 items-center justify-center rounded-full bg-steel-500/20 text-xs font-mono text-steel-400 mt-0.5">
                {idx + 1}
              </span>
              <span dangerouslySetInnerHTML={{ __html: formatInline(item) }} />
            </li>
          ))}
        </ol>
      );
      continue;
    }

    // Horizontal rule
    if (line.startsWith("---") || line.startsWith("***")) {
      elements.push(
        <hr key={i} className="my-4 border-navy-600/40" />
      );
      i++;
      continue;
    }

    // Bold question (Socratic mode)
    if (line.startsWith("**") && line.endsWith("**") && line.length > 4) {
      const text = line.slice(2, -2);
      elements.push(
        <p
          key={i}
          className="mt-4 rounded-xl border border-steel-500/30 bg-steel-500/10 px-4 py-3 text-sm font-semibold text-bone-50 leading-relaxed"
        >
          {text}
        </p>
      );
      i++;
      continue;
    }

    // Empty line
    if (line.trim() === "") {
      i++;
      continue;
    }

    // Regular paragraph
    elements.push(
      <p
        key={i}
        className="text-sm text-bone-100/85 leading-relaxed my-1.5"
        dangerouslySetInnerHTML={{ __html: formatInline(line) }}
      />
    );
    i++;
  }

  return <div className="animate-fade-in">{elements}</div>;
}

function formatInline(text: string): string {
  return text
    // Bold
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-bone-50">$1</strong>')
    // Italic
    .replace(/\*(.*?)\*/g, '<em class="italic text-bone-100/90">$1</em>')
    // Inline code / source citation
    .replace(
      /\[Source: (.*?)\]/g,
      '<span class="inline-flex items-center rounded-md bg-sage-500/15 px-1.5 py-0.5 text-xs font-mono text-sage-400 border border-sage-500/20">📄 $1</span>'
    )
    .replace(
      /\[Per (.*?)\]/g,
      '<span class="inline-flex items-center rounded-md bg-sage-500/15 px-1.5 py-0.5 text-xs font-mono text-sage-400 border border-sage-500/20">📄 $1</span>'
    )
    // Inline code
    .replace(/`(.*?)`/g, '<code class="rounded bg-navy-900/60 px-1 py-0.5 text-xs font-mono text-amber-400">$1</code>');
}
