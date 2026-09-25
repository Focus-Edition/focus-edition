import { ExtractedSection, IngestionResult, SourceReference } from '../../../types/document';
import { extractFromScannedPdf } from './ocrExtractor';

export async function extractFromPdf(pdfBuffer: Buffer, fileName: string): Promise<IngestionResult> {
  if (!pdfBuffer || pdfBuffer.length === 0) {
    throw new Error(`Cannot process empty PDF: "${fileName}". Please provide a valid PDF document.`);
  }

  // Load via pdfjs-dist
  const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.js');
  const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(pdfBuffer) });
  const pdf = await loadingTask.promise;
  const numPages = pdf.numPages;

  let fullDocumentText = '';
  const pageTexts: { pageNum: number; text: string; lines: string[] }[] = [];

  for (let i = 1; i <= numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const strings = content.items.map((item: any) => item.str || '');
    const pageRawText = strings.join(' ').replace(/\s+/g, ' ').trim();

    // Group into approximate lines
    const lineMap: string[] = [];
    let currentLine = '';
    content.items.forEach((item: any) => {
      const s = (item.str || '').trim();
      if (!s) return;
      if (item.hasEOL) {
        currentLine += (currentLine ? ' ' : '') + s;
        lineMap.push(currentLine.trim());
        currentLine = '';
      } else {
        currentLine += (currentLine ? ' ' : '') + s;
      }
    });
    if (currentLine) lineMap.push(currentLine.trim());

    pageTexts.push({
      pageNum: i,
      text: pageRawText,
      lines: lineMap.length > 0 ? lineMap : [pageRawText]
    });

    fullDocumentText += (fullDocumentText ? '\n\n' : '') + pageRawText;
  }

  // Check if PDF has no/minimal embedded text -> scanned PDF!
  const nonWhitespaceChars = fullDocumentText.replace(/\s/g, '').length;
  if (nonWhitespaceChars < 25) {
    // Scanned PDF! Fall back to OCR
    return await extractFromScannedPdf(pdfBuffer, fileName);
  }

  // Structure sections per page or per chapter/heading inside pages
  const sections: ExtractedSection[] = [];
  let runningChar = 0;

  for (const p of pageTexts) {
    if (!p.text) continue;
    const pageStartChar = runningChar;
    const pageEndChar = pageStartChar + p.text.length;
    runningChar = pageEndChar + 2; // +2 for newline separation

    // Check lines for headings
    const potentialHeadings = p.lines.filter(l => 
      /^(Chapter|Section|Part|Module)\s+[0-9IVXLCDM]+/i.test(l) ||
      (l.length < 60 && l === l.toUpperCase() && /[A-Z]/.test(l)) ||
      (l.length < 50 && !l.endsWith('.') && l.length > 5)
    );

    const sectionTitle = potentialHeadings.length > 0 
      ? potentialHeadings[0] 
      : `Page ${p.pageNum}`;

    const sourceRef: SourceReference = {
      pageNumber: p.pageNum,
      sectionTitle,
      charStart: pageStartChar,
      charEnd: pageEndChar,
      rawSnippet: p.text.slice(0, 200),
      sourceLocator: `PDF Page ${p.pageNum}: "${sectionTitle}" [chars ${pageStartChar}-${pageEndChar}]`
    };

    sections.push({
      id: `sec_pdf_p${p.pageNum}`,
      title: sectionTitle,
      level: 1,
      text: p.text,
      charStart: pageStartChar,
      charEnd: pageEndChar,
      pageNumber: p.pageNum,
      sourceReference: sourceRef
    });
  }

  const wordCount = fullDocumentText.split(/\s+/).filter(Boolean).length;

  return {
    success: true,
    metadata: {
      fileName,
      fileType: 'pdf',
      fileSizeBytes: pdfBuffer.length,
      pageCount: numPages,
      wordCount,
      charCount: fullDocumentText.length,
      extractedAt: new Date().toISOString(),
      ocrApplied: false
    },
    fullText: fullDocumentText,
    sections
  };
}
