import { ExtractedSection, IngestionResult, SourceReference } from '../../../types/document';

export function extractFromMarkdown(mdContent: string, fileName: string): IngestionResult {
  if (!mdContent || mdContent.trim().length === 0) {
    throw new Error(`Cannot process empty Markdown file: "${fileName}". Please ensure the file contains valid Markdown.`);
  }

  const normalized = mdContent.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const lines = normalized.split('\n');

  const sections: ExtractedSection[] = [];
  let currentTitle = 'Document Overview';
  let currentLevel = 1;
  let currentLines: string[] = [];
  let sectionStartChar = 0;
  let runningChar = 0;
  let parentHeading = '';

  const pushSection = (endChar: number) => {
    const textBody = currentLines.join('\n').trim();
    if (textBody.length > 0) {
      const fullTitle = parentHeading && currentLevel > 2 && !currentTitle.startsWith(parentHeading)
        ? `${parentHeading} — ${currentTitle}`
        : currentTitle;

      const sourceRef: SourceReference = {
        sectionTitle: fullTitle,
        charStart: sectionStartChar,
        charEnd: endChar,
        rawSnippet: textBody.slice(0, 200),
        sourceLocator: `Markdown Section (H${currentLevel}): "${fullTitle}" [chars ${sectionStartChar}-${endChar}]`
      };

      sections.push({
        id: `sec_md_${sections.length + 1}`,
        title: fullTitle,
        level: currentLevel,
        text: textBody,
        charStart: sectionStartChar,
        charEnd: endChar,
        sourceReference: sourceRef
      });
    }
    currentLines = [];
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineLen = line.length + 1;

    // Detect ATX headings: # Heading, ## Heading, ### Heading
    const headingMatch = line.match(/^(#{1,6})\s+(.*)$/);
    if (headingMatch) {
      if (currentLines.length > 0) {
        pushSection(runningChar);
      }
      const newLevel = headingMatch[1].length;
      const newTitle = headingMatch[2].trim();

      if (newLevel <= 2) {
        parentHeading = newTitle;
      }
      currentLevel = newLevel;
      currentTitle = newTitle;
      sectionStartChar = runningChar;
    } else {
      currentLines.push(line);
    }

    runningChar += lineLen;
  }

  if (currentLines.length > 0) {
    pushSection(normalized.length);
  }

  if (sections.length === 0) {
    const fallbackTxt = normalized.trim();
    sections.push({
      id: 'sec_md_1',
      title: 'Full Document',
      level: 1,
      text: fallbackTxt,
      charStart: 0,
      charEnd: fallbackTxt.length,
      sourceReference: {
        sectionTitle: 'Full Document',
        charStart: 0,
        charEnd: fallbackTxt.length,
        rawSnippet: fallbackTxt.slice(0, 200),
        sourceLocator: `Full Document [chars 0-${fallbackTxt.length}]`
      }
    });
  }

  const wordCount = normalized.split(/\s+/).filter(Boolean).length;

  return {
    success: true,
    metadata: {
      fileName,
      fileType: 'md',
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
