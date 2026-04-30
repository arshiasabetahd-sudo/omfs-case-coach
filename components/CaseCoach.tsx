"use client";

import { useState, useRef } from "react";
import { Send, RotateCcw, HelpCircle, AlertTriangle, GraduationCap } from "lucide-react";
import MarkdownRenderer from "./MarkdownRenderer";
import LoadingDots from "./LoadingDots";
import type { Message } from "@/app/api/chat/route";

const SAMPLE_CASE = `27-year-old male presents with swelling in the right lower jaw that has been present for 3 weeks. He reports mild pain and difficulty opening his mouth. He had his lower right wisdom tooth partially erupted for the past 2 years. He smokes half a pack per day and takes ibuprofen occasionally. No significant medical history reported. Vital signs normal.`;

const QUICK_PROMPTS = [
  { label: "What am I missing?", icon: HelpCircle, prompt: "What critical information am I missing from this case?" },
  { label: "What can go wrong?", icon: AlertTriangle, prompt: "What are the main complications and risks I should warn the patient about?" },
  { label: "Ask me like an examiner", icon: GraduationCap, prompt: "Ask me a tough examiner-style question about this case." },
];

export default function CaseCoach() {
  const [caseText, setCaseText] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  async function sendMessage(userContent: string) {
    if (!userContent.trim() || loading) return;

    const newMessages: Message[] = [
      ...messages,
      { role: "user", content: userContent },
    ];
    setMessages(newMessages);
    setLoading(true);
    scrollToBottom();

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "case-coach", messages: newMessages }),
      });
      const data = await res.json();
      if (data.content) {
        setMessages([...newMessages, { role: "assistant", content: data.content }]);
      }
    } catch {
      setMessages([...newMessages, { role: "assistant", content: "An error occurred. Please check your API key and try again." }]);
    } finally {
      setLoading(false);
      scrollToBottom();
    }
  }

  function handleSubmitCase() {
    if (!caseText.trim()) return;
    setSubmitted(true);
    sendMessage(`Please analyze this case:\n\n${caseText}`);
  }

  function handleQuickPrompt(prompt: string) {
    sendMessage(prompt);
  }

  function handleReset() {
    setMessages([]);
    setCaseText("");
    setSubmitted(false);
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Case Input */}
      {!submitted && (
        <div className="card p-5 animate-slide-up">
          <div className="mb-3 flex items-center justify-between">
            <span className="section-label">Case Presentation</span>
            <button
              onClick={() => setCaseText(SAMPLE_CASE)}
              className="text-xs text-steel-400/70 hover:text-steel-300 transition-colors"
            >
              Load sample case
            </button>
          </div>
          <textarea
            className="input-area min-h-[140px]"
            placeholder="Paste your clinical case here — patient demographics, chief complaint, medical history, examination findings, imaging results…"
            value={caseText}
            onChange={(e) => setCaseText(e.target.value)}
            rows={6}
          />
          <div className="mt-3 flex items-center justify-between gap-3">
            <p className="text-xs text-steel-400/60">
              For study purposes only. No patient identifiers.
            </p>
            <button
              className="btn-primary"
              onClick={handleSubmitCase}
              disabled={!caseText.trim()}
            >
              <Send className="h-3.5 w-3.5" />
              Analyze Case
            </button>
          </div>
        </div>
      )}

      {/* Case header when submitted */}
      {submitted && (
        <div className="card p-4 border-steel-500/20">
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="section-label">Active Case</span>
              <p className="mt-1 text-sm text-bone-100/70 line-clamp-2">{caseText}</p>
            </div>
            <button onClick={handleReset} className="btn-ghost shrink-0">
              <RotateCcw className="h-3.5 w-3.5" />
              New Case
            </button>
          </div>
        </div>
      )}

      {/* Messages */}
      {messages.length > 0 && (
        <div className="flex flex-col gap-3">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`animate-slide-up ${
                msg.role === "user"
                  ? "flex justify-end"
                  : "flex justify-start"
              }`}
              style={{ animationDelay: `${idx * 0.05}s` }}
            >
              {msg.role === "user" ? (
                <div className="max-w-[80%] rounded-2xl rounded-tr-sm bg-steel-500/20 border border-steel-500/30 px-4 py-3 text-sm text-bone-100/90">
                  {msg.content.replace(/^Please analyze this case:\n\n/, "")}
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

      {/* Quick action buttons */}
      {submitted && !loading && messages.length > 0 && (
        <div className="flex flex-wrap gap-2 animate-fade-in">
          {QUICK_PROMPTS.map(({ label, icon: Icon, prompt }) => (
            <button
              key={label}
              className="btn-ghost text-xs"
              onClick={() => handleQuickPrompt(prompt)}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
