import { ExtractedSection, IngestionResult, SourceReference } from '../../../types/document';

export function extractFromTxt(text: string, fileName: string): IngestionResult {
  if (!text || text.trim().length === 0) {
    throw new Error(`Cannot process empty text file: "${fileName}". Please ensure the file contains readable text.`);
  }

  // Normalize line endings and strip BOM
  const normalized = text.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const lines = normalized.split('\n');

  const sections: ExtractedSection[] = [];
  let currentTitle = 'Document Introduction';
  let currentLines: string[] = [];
  let sectionStartChar = 0;
  let runningChar = 0;

  // Heading matchers:
  // - SECTION 1: ... or CHAPTER 1: ... or PART 1: ...
  // - Uppercase titles of length >= 3 and <= 80
  // - Numbered headings like 1.0 or 1.1 or 1)
  const isHeadingLine = (line: string): boolean => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.length > 90) return false;
    if (/^(SECTION|CHAPTER|PART|ARTICLE|MODULE)\s+[0-9IVXLCDM]+/i.test(trimmed)) return true;
    if (/^[0-9]+(\.[0-9]+)*\s+[A-Z]/.test(trimmed)) return true;
    if (trimmed.length >= 4 && trimmed === trimmed.toUpperCase() && /[A-Z]/.test(trimmed) && !trimmed.endsWith('.')) return true;
    return false;
  };

  const pushCurrentSection = (endChar: number) => {
    const sectionBody = currentLines.join('\n').trim();
    if (sectionBody.length > 0) {
      const sourceRef: SourceReference = {
        sectionTitle: currentTitle,
        charStart: sectionStartChar,
        charEnd: endChar,
        rawSnippet: sectionBody.slice(0, 200),
        sourceLocator: `Section: "${currentTitle}" [chars ${sectionStartChar}-${endChar}]`
      };

      sections.push({
        id: `sec_${sections.length + 1}`,
        title: currentTitle,
        level: 1,
        text: sectionBody,
        charStart: sectionStartChar,
        charEnd: endChar,
        sourceReference: sourceRef
      });
    }
    currentLines = [];
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineLen = line.length + 1; // including newline

    if (isHeadingLine(line)) {
      if (currentLines.length > 0) {
        pushCurrentSection(runningChar);
      }
      currentTitle = line.trim();
      sectionStartChar = runningChar;
    } else {
      currentLines.push(line);
    }

    runningChar += lineLen;
  }

  // Push final section
  if (currentLines.length > 0) {
    pushCurrentSection(normalized.length);
  }

  // Fallback if no explicit headings found: chunk by paragraphs
  if (sections.length === 0 || (sections.length === 1 && sections[0].text.length > 1200)) {
    const paragraphs = normalized.split(/\n\s*\n/).filter(p => p.trim().length > 0);
    if (paragraphs.length > 1) {
      sections.length = 0; // reset
      let offset = 0;
      paragraphs.forEach((p, idx) => {
        const start = normalized.indexOf(p, offset);
        const end = start + p.length;
        offset = end;
        const firstWords = p.trim().slice(0, 50).split(' ').slice(0, 5).join(' ');
        const title = `Part ${idx + 1}: ${firstWords}...`;
        
        sections.push({
          id: `sec_${idx + 1}`,
          title,
          level: 1,
          text: p.trim(),
          charStart: start,
          charEnd: end,
          sourceReference: {
            sectionTitle: title,
            charStart: start,
            charEnd: end,
            rawSnippet: p.slice(0, 200),
            sourceLocator: `Part ${idx + 1} [chars ${start}-${end}]`
          }
        });
      });
    }
  }

  const wordCount = normalized.split(/\s+/).filter(Boolean).length;

  return {
    success: true,
    metadata: {
      fileName,
      fileType: 'txt',
      fileSizeBytes: Buffer.byteLength(normalized, 'utf8'),
      wordCount,
      charCount: normalized.length,
      extractedAt: new Date().toISOString(),
      ocrApplied: false
    },
    fullText: normalized,
    sections
  };
}
