import fs from "fs";
import path from "path";

export interface CourseFile {
  filename: string;
  folder: string;
  content: string;
}

const DATA_DIRS = [
  "data/lectures",
  "data/course-materials",
  "data/textbook",
];

const SUPPORTED_EXTENSIONS = [".txt", ".md", ".mdx", ".pdf"];

async function extractPdfText(filepath: string): Promise<string> {
  try {
    // Dynamically import pdf-parse only when needed
    const pdfParse = (await import("pdf-parse")).default;
    const buffer = fs.readFileSync(filepath);
    const data = await pdfParse(buffer);
    return data.text || "";
  } catch {
    return "";
  }
}

function readTextFile(filepath: string): string {
  try {
    return fs.readFileSync(filepath, "utf-8").trim();
  } catch {
    return "";
  }
}

export async function loadCourseContext(): Promise<string> {
  const projectRoot = process.cwd();
  const allFiles: CourseFile[] = [];

  for (const dir of DATA_DIRS) {
    const dirPath = path.join(projectRoot, dir);
    if (!fs.existsSync(dirPath)) continue;

    const entries = fs.readdirSync(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      if (!entry.isFile()) continue;
      const ext = path.extname(entry.name).toLowerCase();
      if (!SUPPORTED_EXTENSIONS.includes(ext)) continue;

      const fullPath = path.join(dirPath, entry.name);
      let content = "";

      if (ext === ".pdf") {
        content = await extractPdfText(fullPath);
      } else {
        content = readTextFile(fullPath);
      }

      if (content.trim().length > 50) {
        allFiles.push({
          filename: entry.name,
          folder: dir,
          content: content.trim().slice(0, 8000), // cap per file to avoid token overflow
        });
      }
    }
  }

  if (allFiles.length === 0) return "";

  const sections = allFiles.map(
    (f) => `[Source: ${f.folder}/${f.filename}]\n${f.content}`
  );

  return sections.join("\n\n---\n\n");
}

export function getCourseFileList(): string[] {
  const projectRoot = process.cwd();
  const names: string[] = [];

  for (const dir of DATA_DIRS) {
    const dirPath = path.join(projectRoot, dir);
    if (!fs.existsSync(dirPath)) continue;
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    for (const entry of entries) {
      if (
        entry.isFile() &&
        SUPPORTED_EXTENSIONS.includes(path.extname(entry.name).toLowerCase())
      ) {
        names.push(`${dir}/${entry.name}`);
      }
    }
  }

  return names;
}
