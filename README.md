# OMFS Case Coach

**AI-powered oral and maxillofacial surgery study tool for dental students.**

Built with Next.js, Tailwind CSS, and the Anthropic Claude API.

---

## Features

### 🩺 Case Coach
Paste a clinical case and receive a structured analysis:
- Case summary
- Key findings
- Missing information
- Red flags
- Differential diagnosis
- Treatment planning considerations
- Complications
- Postoperative considerations
- Questions an instructor may ask

### 💬 Socratic Mode
AI guides you through a case one question at a time, providing feedback on each answer before moving forward.

### 📝 Exam Mode
Generate practice questions (MCQ, short answer, case-based) from your course material, with explanations after you answer.

---

## Setup

### 1. Clone the repository

```bash
git clone https://github.com/your-username/omfs-case-coach.git
cd omfs-case-coach
```

### 2. Install dependencies

```bash
npm install
```

### 3. Add your Anthropic API key

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your key:
```
ANTHROPIC_API_KEY=sk-ant-...
```

### 4. Add your course files

Place `.txt` or `.md` files in:
```
data/lectures/         ← Lecture notes
data/course-materials/ ← Handouts, syllabi
data/textbook/         ← Textbook excerpts (with permission)
```

The AI will automatically load and cite these files.

### 5. Run locally

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

---

## Deployment (Vercel)

1. Push to GitHub
2. Import the repo at [vercel.com](https://vercel.com)
3. Add `ANTHROPIC_API_KEY` in Vercel → Settings → Environment Variables
4. Deploy

---

## Adding Course Material

Files must be `.txt` or `.md` format. No PDFs directly (convert to text first).

Example structure:
```
data/
  lectures/
    dentoalveolar-surgery.md
    infections-fascial-spaces.md
    third-molars.md
    orthognathic-surgery.md
  course-materials/
    syllabus.md
    study-guide-midterm.md
  textbook/
    peterson-ch7-extractions.md
    peterson-ch12-infections.md
```

The AI will cite files as: `[lectures/third-molars.md]`

---

## Safety Notice

This tool is for **educational and study purposes only**.
- Do not enter real patient identifiers.
- Do not use AI responses as definitive clinical guidance.
- Always confirm with your instructor or clinical supervisor.

---

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **AI**: Anthropic Claude API (claude-opus-4-5)
- **Language**: TypeScript
- **Deployment**: Vercel
