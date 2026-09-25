import { ExtractedSection, IngestionResult, SourceReference } from '../../../types/document';

function decodeHtmlEntities(str: string): string {
  const entities: Record<string, string> = {
    '&nbsp;': ' ',
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&pound;': '£',
    '&euro;': '€',
    '&copy;': '©',
    '&mdash;': '—',
    '&ndash;': '–'
  };
  return str.replace(/&[a-zA-Z0-9#]+;/g, match => {
    if (entities[match]) return entities[match];
    if (match.startsWith('&#x')) {
      const hex = match.slice(3, -1);
      return String.fromCharCode(parseInt(hex, 16));
    }
    if (match.startsWith('&#')) {
      const dec = match.slice(2, -1);
      return String.fromCharCode(parseInt(dec, 10));
    }
    return match;
  });
}

export function extractFromHtml(htmlContent: string, fileName: string): IngestionResult {
  if (!htmlContent || htmlContent.trim().length === 0) {
    throw new Error(`Cannot process empty HTML file: "${fileName}". Please ensure the file contains valid HTML markup.`);
  }

  // Strip non-content blocks
  const cleanHtml = htmlContent
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<head\b[^<]*(?:(?!<\/head>)<[^<]*)*<\/head>/gi, '')
    .replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, '');

  const sections: ExtractedSection[] = [];
  // Target headings and paragraph elements
  const tagRegex = /<(h[1-6]|p|li|blockquote)\b[^>]*>([\s\S]*?)<\/\1>/gi;

  let currentTitle = 'Document Overview';
  let currentLevel = 1;
  let currentParagraphs: string[] = [];
  let fullCleanText = '';
  let match: RegExpExecArray | null;

  while ((match = tagRegex.exec(cleanHtml)) !== null) {
    const tagName = match[1].toLowerCase();
    let innerContent = match[2].replace(/<[^>]+>/g, ' '); // strip nested tags
    innerContent = decodeHtmlEntities(innerContent).replace(/\s+/g, ' ').trim();

    if (!innerContent) continue;

    if (tagName.startsWith('h')) {
      if (currentParagraphs.length > 0) {
        const body = currentParagraphs.join('\n\n').trim();
        const start = fullCleanText.length;
        fullCleanText += (fullCleanText ? '\n\n' : '') + body;
        const end = fullCleanText.length;

        sections.push({
          id: `sec_html_${sections.length + 1}`,
          title: currentTitle,
          level: currentLevel,
          text: body,
          charStart: start,
          charEnd: end,
          sourceReference: {
            sectionTitle: currentTitle,
            charStart: start,
            charEnd: end,
            rawSnippet: body.slice(0, 200),
            sourceLocator: `HTML Section <${tagName}>: "${currentTitle}" [chars ${start}-${end}]`
          }
        });
        currentParagraphs = [];
      }

      currentTitle = innerContent;
      currentLevel = parseInt(tagName.charAt(1), 10);
    } else {
      currentParagraphs.push(innerContent);
    }
  }

  // Flush remaining paragraphs
  if (currentParagraphs.length > 0) {
    const body = currentParagraphs.join('\n\n').trim();
    const start = fullCleanText.length;
    fullCleanText += (fullCleanText ? '\n\n' : '') + body;
    const end = fullCleanText.length;

    sections.push({
      id: `sec_html_${sections.length + 1}`,
      title: currentTitle,
      level: currentLevel,
      text: body,
      charStart: start,
      charEnd: end,
      sourceReference: {
        sectionTitle: currentTitle,
        charStart: start,
        charEnd: end,
        rawSnippet: body.slice(0, 200),
        sourceLocator: `HTML Section: "${currentTitle}" [chars ${start}-${end}]`
      }
    });
  }

  if (sections.length === 0) {
    const rawText = decodeHtmlEntities(cleanHtml.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
    if (!rawText) {
      throw new Error(`Failed to extract text from HTML file "${fileName}". The file contained no readable body text.`);
    }
    fullCleanText = rawText;
    sections.push({
      id: 'sec_html_1',
      title: 'HTML Document',
      level: 1,
      text: rawText,
      charStart: 0,
      charEnd: rawText.length,
      sourceReference: {
        sectionTitle: 'HTML Document',
        charStart: 0,
        charEnd: rawText.length,
        rawSnippet: rawText.slice(0, 200),
        sourceLocator: `HTML Document [chars 0-${rawText.length}]`
      }
    });
  }

  const wordCount = fullCleanText.split(/\s+/).filter(Boolean).length;

  return {
    success: true,
    metadata: {
      fileName,
      fileType: 'html',
      fileSizeBytes: Buffer.byteLength(htmlContent, 'utf8'),
      wordCount,
      charCount: fullCleanText.length,
      extractedAt: new Date().toISOString(),
      ocrApplied: false
    },
    fullText: fullCleanText,
    sections
  };
}
