import path from 'path';
import zlib from 'zlib';
import { createWorker } from 'tesseract.js';
import { ExtractedSection, IngestionResult, SourceReference } from '../../../types/document';

function getLangPath(): string {
  return path.resolve(process.cwd(), 'node_modules/@tesseract.js-data/eng/4.0.0_best_int');
}

export async function extractFromImage(imageBuffer: Buffer, fileName: string): Promise<IngestionResult> {
  if (!imageBuffer || imageBuffer.length === 0) {
    throw new Error(`Cannot run OCR on empty image buffer for "${fileName}".`);
  }

  let worker;
  try {
    worker = await createWorker('eng', 1, {
      langPath: getLangPath(),
      gzip: true,
      errorHandler: err => console.warn('Tesseract worker warning:', err)
    });
  } catch (err: any) {
    throw new Error(`Failed to initialize OCR engine: ${err?.message || err}`);
  }

  try {
    const result = await worker.recognize(imageBuffer);
    const text = result.data.text.trim();
    const confidence = result.data.confidence;

    if (!text || text.length === 0) {
      throw new Error(`OCR was unable to detect any text in "${fileName}". Please ensure the image is clear and contains readable text.`);
    }

    const sections: ExtractedSection[] = [];
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);

    let offset = 0;
    paragraphs.forEach((p, idx) => {
      const trimmed = p.trim();
      const start = text.indexOf(trimmed, offset);
      const end = start + trimmed.length;
      offset = end;

      const lines = trimmed.split('\n');
      const firstLine = lines[0].replace(/[^a-zA-Z0-9\s]/g, '').trim().slice(0, 45);
      const title = firstLine.length > 5 ? firstLine : `Scanned Section ${idx + 1}`;

      const sourceRef: SourceReference = {
        sectionTitle: title,
        charStart: start,
        charEnd: end,
        rawSnippet: trimmed.slice(0, 200),
        sourceLocator: `Image OCR: "${title}" (Confidence: ${Math.round(confidence)}%) [chars ${start}-${end}]`
      };

      sections.push({
        id: `sec_ocr_${idx + 1}`,
        title,
        level: 1,
        text: trimmed,
        charStart: start,
        charEnd: end,
        sourceReference: sourceRef
      });
    });

    const wordCount = text.split(/\s+/).filter(Boolean).length;

    return {
      success: true,
      metadata: {
        fileName,
        fileType: 'image',
        fileSizeBytes: imageBuffer.length,
        wordCount,
        charCount: text.length,
        extractedAt: new Date().toISOString(),
        ocrApplied: true,
        ocrConfidence: confidence
      },
      fullText: text,
      sections
    };
  } finally {
    if (worker) {
      await worker.terminate();
    }
  }
}

export async function extractFromScannedPdf(pdfBuffer: Buffer, fileName: string): Promise<IngestionResult> {
  if (!pdfBuffer || pdfBuffer.length === 0) {
    throw new Error(`Cannot process empty scanned PDF: "${fileName}".`);
  }

  const { PDFDocument, PDFName, PDFDict } = await import('pdf-lib');
  const pdfDoc = await PDFDocument.load(pdfBuffer);
  const pages = pdfDoc.getPages();

  let worker;
  try {
    worker = await createWorker('eng', 1, {
      langPath: getLangPath(),
      gzip: true
    });
  } catch (err: any) {
    throw new Error(`Failed to initialize OCR engine for scanned PDF: ${err?.message || err}`);
  }

  const sections: ExtractedSection[] = [];
  let combinedFullText = '';
  let totalConfidence = 0;
  let ocrPagesCount = 0;

  try {
    for (let pIdx = 0; pIdx < pages.length; pIdx++) {
      const pageNum = pIdx + 1;
      const page = pages[pIdx];
      const resources = page.node.Resources();

      let imageBufferToOcr: Buffer | null = null;

      if (resources) {
        const xObjects = resources.lookupMaybe(PDFName.of('XObject'), PDFDict);
        if (xObjects) {
          for (const [, ref] of xObjects.entries()) {
            const stream: any = pdfDoc.context.lookup(ref);
            if (stream && stream.dict && stream.dict.get(PDFName.of('Subtype'))?.toString() === '/Image') {
              const filter = stream.dict.get(PDFName.of('Filter'))?.toString();
              const width = Number(stream.dict.get(PDFName.of('Width'))?.toString() || '0');
              const height = Number(stream.dict.get(PDFName.of('Height'))?.toString() || '0');

              if (filter === '/DCTDecode') {
                // Direct JPEG container
                imageBufferToOcr = Buffer.from(stream.contents);
                break;
              } else if (filter === '/FlateDecode' && width > 0 && height > 0) {
                // Deflated RGB or Grayscale pixels
                try {
                  const rawBytes = zlib.inflateSync(Buffer.from(stream.contents));
                  let cleanRgb = rawBytes;
                  // Handle PNG scanline filter byte if present
                  if (rawBytes.length === height * (width * 3 + 1)) {
                    cleanRgb = Buffer.alloc(width * height * 3);
                    for (let y = 0; y < height; y++) {
                      const rowSrc = y * (width * 3 + 1) + 1;
                      rawBytes.copy(cleanRgb, y * width * 3, rowSrc, rowSrc + width * 3);
                    }
                  } else if (rawBytes.length === height * (width + 1)) {
                    // Grayscale with filter bytes
                    cleanRgb = Buffer.alloc(width * height);
                    for (let y = 0; y < height; y++) {
                      const rowSrc = y * (width + 1) + 1;
                      rawBytes.copy(cleanRgb, y * width, rowSrc, rowSrc + width);
                    }
                  }

                  const isGrayscale = cleanRgb.length === width * height;
                  const ppmHeader = isGrayscale
                    ? Buffer.from(`P5\n${width} ${height}\n255\n`)
                    : Buffer.from(`P6\n${width} ${height}\n255\n`);

                  imageBufferToOcr = Buffer.concat([ppmHeader, cleanRgb]);
                  break;
                } catch (zErr) {
                  console.warn('Decompressing flate image stream failed:', zErr);
                }
              } else if (stream.contents && stream.contents.length > 0) {
                imageBufferToOcr = Buffer.from(stream.contents);
                break;
              }
            }
          }
        }
      }

      if (!imageBufferToOcr) {
        continue;
      }

      const rec = await worker.recognize(imageBufferToOcr);
      const pageText = rec.data.text.trim();
      const pageConfidence = rec.data.confidence;

      if (pageText.length > 0) {
        ocrPagesCount++;
        totalConfidence += pageConfidence;
        const startChar = combinedFullText.length;
        combinedFullText += (combinedFullText ? '\n\n' : '') + pageText;
        const endChar = combinedFullText.length;

        const firstLine = pageText.split('\n')[0].replace(/[^a-zA-Z0-9\s]/g, '').trim().slice(0, 45);
        const title = firstLine.length > 5 ? firstLine : `Page ${pageNum} (OCR)`;

        sections.push({
          id: `sec_scanned_p${pageNum}`,
          title,
          level: 1,
          text: pageText,
          charStart: startChar,
          charEnd: endChar,
          pageNumber: pageNum,
          sourceReference: {
            pageNumber: pageNum,
            sectionTitle: title,
            charStart: startChar,
            charEnd: endChar,
            rawSnippet: pageText.slice(0, 200),
            sourceLocator: `Scanned PDF Page ${pageNum}: "${title}" (OCR Confidence: ${Math.round(pageConfidence)}%)`
          }
        });
      }
    }

    if (sections.length === 0 || combinedFullText.trim().length === 0) {
      throw new Error(`Scanned PDF "${fileName}" could not be transcribed. OCR did not find readable characters on any page.`);
    }

    const avgConfidence = ocrPagesCount > 0 ? Math.round(totalConfidence / ocrPagesCount) : 0;
    const wordCount = combinedFullText.split(/\s+/).filter(Boolean).length;

    return {
      success: true,
      metadata: {
        fileName,
        fileType: 'scanned_pdf',
        fileSizeBytes: pdfBuffer.length,
        pageCount: pages.length,
        wordCount,
        charCount: combinedFullText.length,
        extractedAt: new Date().toISOString(),
        ocrApplied: true,
        ocrConfidence: avgConfidence
      },
      fullText: combinedFullText,
      sections
    };
  } finally {
    if (worker) {
      await worker.terminate();
    }
  }
}
