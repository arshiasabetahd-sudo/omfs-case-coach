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

const SUPPORTED_EXTENSIONS = [".txt", ".md", ".mdx"];

function readFilesFromDir(dirPath: string, folder: string): CourseFile[] {
  const files: CourseFile[] = [];

  if (!fs.existsSync(dirPath)) return files;

  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (
      entry.isFile() &&
      SUPPORTED_EXTENSIONS.includes(path.extname(entry.name).toLowerCase())
    ) {
      try {
        const content = fs.readFileSync(fullPath, "utf-8");
        files.push({
          filename: entry.name,
          folder,
          content: content.trim(),
        });
      } catch {
        // skip unreadable files
      }
    }
  }

  return files;
}

export function loadCourseContext(): string {
  const projectRoot = process.cwd();
  const allFiles: CourseFile[] = [];

  for (const dir of DATA_DIRS) {
    const dirPath = path.join(projectRoot, dir);
    const files = readFilesFromDir(dirPath, dir);
    allFiles.push(...files);
  }

  if (allFiles.length === 0) {
    return "";
  }

  const sections = allFiles.map((f) => {
    const label = `[Source: ${f.folder}/${f.filename}]`;
    return `${label}\n${f.content}`;
  });

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
