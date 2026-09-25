export type SupportedFileType =
  | 'txt'
  | 'md'
  | 'html'
  | 'pdf'
  | 'scanned_pdf'
  | 'docx'
  | 'image';

export interface SourceReference {
  pageNumber?: number;
  sectionTitle?: string;
  charStart: number;
  charEnd: number;
  rawSnippet: string;
  sourceLocator: string;
}

export interface ExtractedSection {
  id: string;
  title: string;
  level: number;
  text: string;
  charStart: number;
  charEnd: number;
  pageNumber?: number;
  sourceReference: SourceReference;
}

export interface DocumentMetadata {
  fileName: string;
  fileType: SupportedFileType;
  fileSizeBytes: number;
  pageCount?: number;
  wordCount: number;
  charCount: number;
  extractedAt: string;
  ocrApplied: boolean;
  ocrConfidence?: number;
}

export interface IngestionResult {
  success: boolean;
  metadata: DocumentMetadata;
  fullText: string;
  sections: ExtractedSection[];
  error?: string;
}

export interface FileInput {
  name: string;
  buffer?: Buffer | ArrayBuffer | Uint8Array;
  text?: string;
  size?: number;
  mimeType?: string;
}
