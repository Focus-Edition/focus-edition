import JSZip from 'jszip';
import mammoth from 'mammoth';
import { ExtractedSection, IngestionResult, SourceReference } from '../../../types/document';

export async function extractFromDocx(buffer: Buffer, fileName: string): Promise<IngestionResult> {
  if (!buffer || buffer.length === 0) {
    throw new Error(`Cannot process empty DOCX file: "${fileName}". Please provide a valid .docx file.`);
  }

  // Mammoth raw text
  let mammothText = '';
  try {
    const rawRes = await mammoth.extractRawText({ buffer });
    mammothText = rawRes.value.trim();
  } catch (err: any) {
    throw new Error(`Failed to parse DOCX structure for "${fileName}": ${err?.message || err}`);
  }

  if (!mammothText) {
    throw new Error(`The DOCX file "${fileName}" contains no readable text content.`);
  }

  // Inspect XML for structural headings and paragraphs
  const sections: ExtractedSection[] = [];
  try {
    const zip = await JSZip.loadAsync(buffer);
    const docXmlFile = zip.file('word/document.xml');
    
    if (docXmlFile) {
      const xmlStr = await docXmlFile.async('string');
      // Match paragraph blocks: <w:p>...</w:p>
      const pMatches = xmlStr.match(/<w:p\b[\s\S]*?<\/w:p>/g) || [];
      
      let currentHeading = 'Document Overview';
      let currentLevel = 1;
      let currentBodyParas: string[] = [];
      let fullTextAcc = '';
      
      const flushSection = () => {
        if (currentBodyParas.length > 0) {
          const body = currentBodyParas.join('\n\n').trim();
          const start = fullTextAcc.length;
          fullTextAcc += (fullTextAcc ? '\n\n' : '') + body;
          const end = fullTextAcc.length;
          
          sections.push({
            id: `sec_docx_${sections.length + 1}`,
            title: currentHeading,
            level: currentLevel,
            text: body,
            charStart: start,
            charEnd: end,
            sourceReference: {
              sectionTitle: currentHeading,
              charStart: start,
              charEnd: end,
              rawSnippet: body.slice(0, 200),
              sourceLocator: `DOCX Heading: "${currentHeading}" [chars ${start}-${end}]`
            }
          });
          currentBodyParas = [];
        }
      };

      for (const pXml of pMatches) {
        // Extract paragraph text: all <w:t> tags
        const tMatches = pXml.match(/<w:t\b[^>]*>([\s\S]*?)<\/w:t>/g) || [];
        const pText = tMatches.map(t => t.replace(/<[^>]+>/g, '')).join('').trim();
        if (!pText) continue;

        // Check if paragraph is styled as a heading
        const isHeading1 = /<w:pStyle\s+[^>]*w:val="Heading1"/i.test(pXml);
        const isHeading2 = /<w:pStyle\s+[^>]*w:val="Heading2"/i.test(pXml);
        const isHeading3 = /<w:pStyle\s+[^>]*w:val="Heading3"/i.test(pXml);

        if (isHeading1 || isHeading2 || isHeading3) {
          flushSection();
          currentHeading = pText;
          currentLevel = isHeading1 ? 1 : isHeading2 ? 2 : 3;
        } else {
          currentBodyParas.push(pText);
        }
      }

      flushSection();
    }
  } catch (zipErr) {
    console.warn('XML hierarchy parsing fallback to paragraph chunking:', zipErr);
  }

  // Fallback if no sections extracted from XML
  if (sections.length === 0) {
    const paragraphs = mammothText.split(/\n\s*\n/).filter(p => p.trim().length > 0);
    let offset = 0;
    paragraphs.forEach((p, idx) => {
      const trimmed = p.trim();
      const start = mammothText.indexOf(trimmed, offset);
      const end = start + trimmed.length;
      offset = end;

      const lines = trimmed.split('\n');
      const title = lines[0].slice(0, 50);

      sections.push({
        id: `sec_docx_${idx + 1}`,
        title: title.length > 5 ? title : `Section ${idx + 1}`,
        level: 1,
        text: trimmed,
        charStart: start,
        charEnd: end,
        sourceReference: {
          sectionTitle: title,
          charStart: start,
          charEnd: end,
          rawSnippet: trimmed.slice(0, 200),
          sourceLocator: `DOCX Section ${idx + 1}: "${title}" [chars ${start}-${end}]`
        }
      });
    });
  }

  const wordCount = mammothText.split(/\s+/).filter(Boolean).length;

  return {
    success: true,
    metadata: {
      fileName,
      fileType: 'docx',
      fileSizeBytes: buffer.length,
      wordCount,
      charCount: mammothText.length,
      extractedAt: new Date().toISOString(),
      ocrApplied: false
    },
    fullText: mammothText,
    sections
  };
}
