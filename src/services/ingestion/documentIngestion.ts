import path from 'path';
import { FileInput, IngestionResult, SupportedFileType } from '../../types/document';
import { extractFromTxt } from './extractors/txtExtractor';
import { extractFromMarkdown } from './extractors/markdownExtractor';
import { extractFromHtml } from './extractors/htmlExtractor';
import { extractFromPdf } from './extractors/pdfExtractor';
import { extractFromDocx } from './extractors/docxExtractor';
import { extractFromImage, extractFromScannedPdf } from './extractors/ocrExtractor';

export function detectFileType(fileName: string, mimeType?: string): SupportedFileType {
  const ext = path.extname(fileName).toLowerCase();

  if (ext === '.txt') return 'txt';
  if (ext === '.md' || ext === '.markdown') return 'md';
  if (ext === '.html' || ext === '.htm') return 'html';
  if (ext === '.pdf') return 'pdf';
  if (ext === '.docx') return 'docx';
  if (['.png', '.jpg', '.jpeg', '.webp', '.bmp', '.tiff'].includes(ext)) return 'image';

  if (mimeType) {
    if (mimeType.includes('text/plain')) return 'txt';
    if (mimeType.includes('text/markdown')) return 'md';
    if (mimeType.includes('text/html')) return 'html';
    if (mimeType.includes('application/pdf')) return 'pdf';
    if (mimeType.includes('application/vnd.openxmlformats-officedocument.wordprocessingml.document')) return 'docx';
    if (mimeType.startsWith('image/')) return 'image';
  }

  throw new Error(
    `Unsupported file format for "${fileName}". Focus Edition supports TXT, Markdown, HTML, PDF, Scanned PDF, DOCX, and images (PNG/JPG/WEBP).`
  );
}

export async function ingestDocument(file: FileInput): Promise<IngestionResult> {
  const { name, buffer, text, mimeType } = file;

  if (!name || name.trim().length === 0) {
    throw new Error('A valid file name must be provided for document ingestion.');
  }

  const fileType = detectFileType(name, mimeType);

  // If raw text is provided directly (e.g. from paste or plain text file)
  if (text !== undefined && text !== null) {
    if (fileType === 'md') {
      return extractFromMarkdown(text, name);
    }
    if (fileType === 'html') {
      return extractFromHtml(text, name);
    }
    return extractFromTxt(text, name);
  }

  if (!buffer) {
    throw new Error(`No file content provided for "${name}". Please select or upload a valid file.`);
  }

  const nodeBuf = Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer as ArrayBuffer);

  switch (fileType) {
    case 'txt':
      return extractFromTxt(nodeBuf.toString('utf8'), name);

    case 'md':
      return extractFromMarkdown(nodeBuf.toString('utf8'), name);

    case 'html':
      return extractFromHtml(nodeBuf.toString('utf8'), name);

    case 'pdf':
      return await extractFromPdf(nodeBuf, name);

    case 'scanned_pdf':
      return await extractFromScannedPdf(nodeBuf, name);

    case 'docx':
      return await extractFromDocx(nodeBuf, name);

    case 'image':
      return await extractFromImage(nodeBuf, name);

    default:
      throw new Error(`Unsupported document type "${fileType}" for file "${name}".`);
  }
}
