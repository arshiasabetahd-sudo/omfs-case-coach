"use client";

import { useState, useRef, useEffect } from "react";
import { Send, RotateCcw, ChevronRight } from "lucide-react";
import MarkdownRenderer from "./MarkdownRenderer";
import LoadingDots from "./LoadingDots";
import type { Message } from "@/app/api/chat/route";

const STARTER_CASES = [
  "A 45-year-old diabetic female presents with a rapidly expanding floor of mouth swelling and fever for 2 days. She recently had a lower molar extracted.",
  "A 19-year-old male needs all four wisdom teeth removed. He reports no medical history but his mother mentions he had a prolonged bleed after a dental extraction as a child.",
  "A 60-year-old male on bisphosphonate therapy for osteoporosis needs extraction of a non-restorable lower molar. He has been on the medication for 5 years.",
];

export default function SocraticMode() {
  const [caseText, setCaseText] = useState("");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  useEffect(() => {
    if (!loading && started) inputRef.current?.focus();
  }, [loading, started]);

  async function send(userContent: string) {
    if (!userContent.trim() || loading) return;

    const newMessages: Message[] = [
      ...messages,
      { role: "user", content: userContent },
    ];
    setMessages(newMessages);
    setInput("");
    setLoading(true);
    scrollToBottom();

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "socratic", messages: newMessages }),
      });
      const data = await res.json();
      if (data.content) {
        setMessages([...newMessages, { role: "assistant", content: data.content }]);
      }
    } catch {
      setMessages([
        ...newMessages,
        { role: "assistant", content: "Something went wrong. Please try again." },
      ]);
    } finally {
      setLoading(false);
      scrollToBottom();
    }
  }

  function startSession() {
    if (!caseText.trim()) return;
    setStarted(true);
    send(`Here is the case I want to work through:\n\n${caseText}\n\nPlease begin guiding me through this case using the Socratic method.`);
  }

  function handleReset() {
    setMessages([]);
    setCaseText("");
    setStarted(false);
    setInput("");
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Case setup */}
      {!started && (
        <div className="card p-5 animate-slide-up">
          <span className="section-label">Choose or Paste a Case</span>

          {/* Starter cases */}
          <div className="mt-3 flex flex-col gap-2">
            {STARTER_CASES.map((c, idx) => (
              <button
                key={idx}
                className="rounded-xl border border-navy-600/50 bg-navy-900/30 p-3 text-left text-xs text-bone-100/70 hover:border-steel-500/40 hover:text-bone-100/90 transition-all"
                onClick={() => setCaseText(c)}
              >
                <ChevronRight className="inline mr-1 h-3 w-3 text-steel-400" />
                {c}
              </button>
            ))}
          </div>

          <div className="mt-3 flex items-center gap-2">
            <div className="h-px flex-1 bg-navy-600/40" />
            <span className="text-xs text-steel-400/50">or type your own</span>
            <div className="h-px flex-1 bg-navy-600/40" />
          </div>

          <textarea
            className="input-area mt-3 min-h-[100px]"
            placeholder="Paste your case here…"
            value={caseText}
            onChange={(e) => setCaseText(e.target.value)}
            rows={4}
          />
          <div className="mt-3 flex justify-end">
            <button className="btn-primary" onClick={startSession} disabled={!caseText.trim()}>
              Start Socratic Session
            </button>
          </div>
        </div>
      )}

      {/* Active session header */}
      {started && (
        <div className="flex items-center justify-between rounded-xl border border-steel-500/20 bg-navy-800/40 px-4 py-2.5">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-sage-400 animate-pulse" />
            <span className="text-xs font-medium text-sage-400">Socratic Session Active</span>
          </div>
          <button className="btn-ghost py-1 text-xs" onClick={handleReset}>
            <RotateCcw className="h-3 w-3" />
            End Session
          </button>
        </div>
      )}

      {/* Messages */}
      {messages.length > 0 && (
        <div className="flex flex-col gap-3">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`animate-slide-up ${
                msg.role === "user" ? "flex justify-end" : "flex justify-start"
              }`}
              style={{ animationDelay: `${Math.min(idx, 3) * 0.05}s` }}
            >
              {msg.role === "user" ? (
                <div className="max-w-[80%] rounded-2xl rounded-tr-sm bg-steel-500/20 border border-steel-500/30 px-4 py-3 text-sm text-bone-100/90 whitespace-pre-wrap">
                  {msg.content.includes("Here is the case")
                    ? msg.content.replace(/^Here is the case.*?\n\n/s, "").replace("\n\nPlease begin guiding me through this case using the Socratic method.", "")
                    : msg.content}
                </div>
              ) : (
                <div className="card w-full p-5">
                  <MarkdownRenderer content={msg.content} />
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div className="card w-full">
              <LoadingDots />
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      )}

      {/* Input */}
      {started && (
        <div className="sticky bottom-4 card p-3 border-steel-500/20 animate-fade-in">
          <div className="flex gap-2 items-end">
            <textarea
              ref={inputRef}
              className="input-area flex-1 min-h-[44px] max-h-[120px] py-2.5"
              placeholder="Type your answer… (Enter to send, Shift+Enter for newline)"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
              rows={1}
            />
            <button
              className="btn-primary h-10 w-10 shrink-0 p-0 flex items-center justify-center"
              onClick={() => send(input)}
              disabled={!input.trim() || loading}
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
