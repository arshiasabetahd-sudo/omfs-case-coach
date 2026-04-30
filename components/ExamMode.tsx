"use client";

import { useState, useRef } from "react";
import { Send, RotateCcw, BookOpen } from "lucide-react";
import MarkdownRenderer from "./MarkdownRenderer";
import LoadingDots from "./LoadingDots";
import type { Message } from "@/app/api/chat/route";

const TOPIC_SUGGESTIONS = [
  "Dentoalveolar surgery & extractions",
  "Odontogenic infections & fascial spaces",
  "Third molar surgery & complications",
  "Perioperative medical management",
  "Local anesthesia & nerve blocks",
  "Orthognathic surgery principles",
  "Facial trauma & fractures",
  "Oral pathology & biopsies",
  "Implant surgery fundamentals",
  "Hemostasis & bleeding disorders",
];

type QuestionType = "random" | "mcq" | "short-answer" | "case-based";

export default function ExamMode() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(false);
  const [awaitingAnswer, setAwaitingAnswer] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  async function send(userContent: string) {
    if (!userContent.trim() || loading) return;

    const newMessages: Message[] = [
      ...messages,
      { role: "user", content: userContent },
    ];
    setMessages(newMessages);
    setInput("");
    setLoading(true);
    setAwaitingAnswer(false);
    scrollToBottom();

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "exam", messages: newMessages }),
      });
      const data = await res.json();
      if (data.content) {
        setMessages([...newMessages, { role: "assistant", content: data.content }]);
        // After a question is asked, we're awaiting the answer
        if (newMessages[newMessages.length - 1].content.includes("question") ||
          newMessages.length === 1) {
          setAwaitingAnswer(true);
        }
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

  function startWithTopic(topic: string, type: QuestionType = "random") {
    setStarted(true);
    const typeInstruction =
      type === "random" ? "any question type (MCQ, short answer, or case-based)" :
      type === "mcq" ? "a multiple choice question (4 options)" :
      type === "short-answer" ? "a short answer question" :
      "a case-based vignette question";

    send(`Please give me ${typeInstruction} about: ${topic}`);
  }

  function handleNextQuestion() {
    send("Give me another question, different from the last one.");
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (input.trim()) {
        setAwaitingAnswer(false);
        send(input);
      }
    }
  }

  function handleReset() {
    setMessages([]);
    setStarted(false);
    setAwaitingAnswer(false);
    setInput("");
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Topic picker */}
      {!started && (
        <div className="card p-5 animate-slide-up">
          <span className="section-label">Choose a Topic</span>
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
            {TOPIC_SUGGESTIONS.map((topic) => (
              <button
                key={topic}
                className="rounded-xl border border-navy-600/50 bg-navy-900/30 p-3 text-left text-sm text-bone-100/75 hover:border-steel-500/50 hover:text-bone-100 hover:bg-steel-500/10 transition-all"
                onClick={() => startWithTopic(topic)}
              >
                <BookOpen className="inline mr-1.5 mb-0.5 h-3.5 w-3.5 text-steel-400" />
                {topic}
              </button>
            ))}
          </div>

          <div className="mt-4 border-t border-navy-600/40 pt-4">
            <span className="section-label">Or specify your own</span>
            <div className="mt-2 flex gap-2">
              <input
                type="text"
                className="input-area flex-1 py-2"
                placeholder="e.g. Le Fort fractures, or paste a question…"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && input.trim()) {
                    setStarted(true);
                    send(input);
                    setInput("");
                  }
                }}
              />
              <button
                className="btn-primary"
                onClick={() => {
                  if (input.trim()) {
                    setStarted(true);
                    send(input);
                    setInput("");
                  }
                }}
                disabled={!input.trim()}
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Session header */}
      {started && (
        <div className="flex items-center justify-between rounded-xl border border-amber-400/20 bg-amber-400/5 px-4 py-2.5">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-xs font-medium text-amber-400">Exam Mode Active</span>
          </div>
          <button className="btn-ghost py-1 text-xs" onClick={handleReset}>
            <RotateCcw className="h-3 w-3" />
            Reset
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
            >
              {msg.role === "user" ? (
                <div className="max-w-[80%] rounded-2xl rounded-tr-sm bg-amber-400/10 border border-amber-400/20 px-4 py-3 text-sm text-bone-100/90">
                  {msg.content}
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

      {/* Answer input */}
      {started && !loading && (
        <div className="sticky bottom-4 card p-3 border-amber-400/20 animate-fade-in">
          {awaitingAnswer && (
            <p className="text-xs text-amber-400/70 mb-2 pl-1">💡 Type your answer below and submit</p>
          )}
          <div className="flex gap-2 items-end">
            <textarea
              ref={inputRef}
              className="input-area flex-1 min-h-[44px] max-h-[120px] py-2.5"
              placeholder={awaitingAnswer ? "Your answer…" : "Ask for another question or specify a topic…"}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
            />
            <button
              className="btn-primary h-10 w-10 shrink-0 p-0 flex items-center justify-center"
              onClick={() => { if (input.trim()) { setAwaitingAnswer(false); send(input); }}}
              disabled={!input.trim() || loading}
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
          {messages.length >= 2 && !awaitingAnswer && (
            <button
              className="mt-2 w-full btn-ghost justify-center text-xs text-amber-400/70 border-amber-400/20 hover:border-amber-400/40"
              onClick={handleNextQuestion}
            >
              Next Question →
            </button>
          )}
        </div>
      )}
    </div>
  );
}
