"use client";

import { useState } from "react";
import { Stethoscope, MessageSquare, BookOpen, ChevronRight } from "lucide-react";
import CaseCoach from "@/components/CaseCoach";
import SocraticMode from "@/components/SocraticMode";
import ExamMode from "@/components/ExamMode";

type Tab = "case-coach" | "socratic" | "exam";

const TABS: { id: Tab; label: string; icon: React.ElementType; color: string; description: string }[] = [
  {
    id: "case-coach",
    label: "Case Coach",
    icon: Stethoscope,
    color: "steel",
    description: "Full case analysis with findings, red flags, and differential",
  },
  {
    id: "socratic",
    label: "Socratic Mode",
    icon: MessageSquare,
    color: "sage",
    description: "Guided step-by-step reasoning through a case",
  },
  {
    id: "exam",
    label: "Exam Mode",
    icon: BookOpen,
    color: "amber",
    description: "Practice questions from course material with feedback",
  },
];

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>("case-coach");

  const activeTabData = TABS.find((t) => t.id === activeTab)!;

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(160deg, #0d1b2a 0%, #1b2e45 50%, #0d1b2a 100%)" }}>
      {/* Background texture */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, #8fa8c8 1px, transparent 1px), radial-gradient(circle at 75% 75%, #8fa8c8 1px, transparent 1px)`,
          backgroundSize: "48px 48px",
        }}
      />

      <div className="relative mx-auto max-w-2xl px-4 py-6 pb-24">
        {/* Header */}
        <header className="mb-8 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-steel-500/20 border border-steel-500/30">
              <Stethoscope className="h-5 w-5 text-steel-400" />
            </div>
            <div>
              <h1 className="font-display text-xl font-bold text-bone-50 leading-tight">
                OMFS Case Coach
              </h1>
              <p className="text-xs text-steel-400/70 font-mono">
                Oral & Maxillofacial Surgery Study Tool
              </p>
            </div>
          </div>

          {/* Safety banner */}
          <div className="mt-4 rounded-xl border border-amber-400/20 bg-amber-400/5 px-4 py-2.5 flex items-center gap-2">
            <span className="text-amber-400 text-sm">⚠</span>
            <p className="text-xs text-amber-400/80">
              For educational use only. Not for real patient care decisions. Always confirm with your instructor or supervisor.
            </p>
          </div>
        </header>

        {/* Tab navigation */}
        <nav className="mb-6 grid grid-cols-3 gap-2 animate-slide-up">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative rounded-xl border p-3 text-left transition-all ${
                  isActive
                    ? tab.id === "case-coach"
                      ? "border-steel-500/50 bg-steel-500/15 shadow-lg shadow-steel-500/10"
                      : tab.id === "socratic"
                      ? "border-sage-500/50 bg-sage-500/15 shadow-lg shadow-sage-500/10"
                      : "border-amber-400/50 bg-amber-400/15 shadow-lg shadow-amber-400/10"
                    : "border-navy-600/40 bg-navy-800/30 hover:border-navy-600/70 hover:bg-navy-800/60"
                }`}
              >
                <Icon
                  className={`h-4 w-4 mb-1.5 ${
                    isActive
                      ? tab.id === "case-coach"
                        ? "text-steel-400"
                        : tab.id === "socratic"
                        ? "text-sage-400"
                        : "text-amber-400"
                      : "text-steel-400/50"
                  }`}
                />
                <div
                  className={`text-sm font-medium leading-tight ${
                    isActive ? "text-bone-50" : "text-bone-100/85"
                  }`}
                >
                  {tab.label}
                </div>
                <p className="mt-0.5 hidden sm:block text-xs leading-tight text-bone-100/70 line-clamp-2">
                  {tab.description}
                </p>
                {isActive && (
                  <ChevronRight
                    className={`absolute right-2 top-2 h-3 w-3 ${
                      tab.id === "case-coach"
                        ? "text-steel-400/60"
                        : tab.id === "socratic"
                        ? "text-sage-400/60"
                        : "text-amber-400/60"
                    }`}
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Mode description */}
        <div className="mb-4 animate-fade-in">
          <p className="text-xs text-steel-400/60">{activeTabData.description}</p>
        </div>

        {/* Active Panel */}
        <main key={activeTab} className="animate-slide-up">
          {activeTab === "case-coach" && <CaseCoach />}
          {activeTab === "socratic" && <SocraticMode />}
          {activeTab === "exam" && <ExamMode />}
        </main>
      </div>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 border-t border-navy-600/30 bg-navy-900/80 backdrop-blur-sm">
        <div className="mx-auto max-w-2xl px-4 py-2 flex items-center justify-between">
          <span className="text-xs text-steel-400/40 font-mono">OMFS Case Coach v1.0</span>
          <span className="text-xs text-steel-400/40">Educational use only · Not for clinical decisions</span>
        </div>
      </footer>
    </div>
  );
}
