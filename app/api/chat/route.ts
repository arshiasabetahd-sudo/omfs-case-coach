import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { loadCourseContext } from "@/lib/courseLoader";
import {
  buildCaseCoachSystem,
  buildSocraticSystem,
  buildExamSystem,
} from "@/lib/prompts";

const client = new Anthropic();

export type Mode = "case-coach" | "socratic" | "exam";

export interface Message {
  role: "user" | "assistant";
  content: string;
}

export interface ChatRequest {
  mode: Mode;
  messages: Message[];
}

function getSystemPrompt(mode: Mode, courseContext: string): string {
  switch (mode) {
    case "case-coach":
      return buildCaseCoachSystem(courseContext);
    case "socratic":
      return buildSocraticSystem(courseContext);
    case "exam":
      return buildExamSystem(courseContext);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body: ChatRequest = await req.json();
    const { mode, messages } = body;

    if (!mode || !messages || messages.length === 0) {
      return NextResponse.json(
        { error: "Missing mode or messages" },
        { status: 400 }
      );
    }

    const courseContext = await loadCourseContext();
    const systemPrompt = getSystemPrompt(mode, courseContext);

    const response = await client.messages.create({
      model: "claude-opus-4-5",
      max_tokens: 2048,
      system: systemPrompt,
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    });

    const content = response.content
      .filter((b) => b.type === "text")
      .map((b) => (b as { type: "text"; text: string }).text)
      .join("\n");

    return NextResponse.json({ content });
  } catch (error: unknown) {
    console.error("Chat API error:", error);
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
