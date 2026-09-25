import { IngestionResult, ExtractedSection, SourceReference } from '../../types/document';
import { Edition, Mission } from '../../types/mission';
import { generateQuizForMission } from './quizGenerator';
import { generateFlashcardsForMission } from './flashcardGenerator';

// ADHD-focused reading rate: ~130 words per minute
export function calculateReadingTimeMinutes(wordCount: number): number {
  return Math.max(1, Math.ceil(wordCount / 130));
}

// Extract key factual takeaways directly from the source text
export function extractKeyTakeaways(text: string): string[] {
  const sentences = text
    .split(/(?<=[.?!])\s+(?=[A-Z0-9])/)
    .map(s => s.trim())
    .filter(s => s.length > 20 && s.length < 250);

  const highValueSentences = sentences.filter(s => {
    const lower = s.toLowerCase();
    return (
      /\b(must|requires|covers|capped|qualifies|entitled|eligible|deadline|guideline|points|duty|grant|standard|enhanced|step|never|not)\b/.test(lower) ||
      /\b[0-9]+(\.[0-9]+)?%?\b/.test(s) ||
      /[£$€][0-9]/.test(s)
    );
  });

  const selected = (highValueSentences.length >= 2 ? highValueSentences : sentences).slice(0, 3);
  return selected.length > 0 ? selected : [text.slice(0, 150) + '...'];
}

export function generateMissionsFromIngestion(
  ingestion: IngestionResult,
  options: {
    editionTitle?: string;
    editionDescription?: string;
    coverEmoji?: string;
    themeColor?: string;
  } = {}
): Edition {
  if (!ingestion.success || ingestion.sections.length === 0) {
    throw new Error('Cannot generate missions from an empty or unsuccessful document extraction.');
  }

  const editionId = `ed_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const missions: Mission[] = [];

  let missionOrder = 1;

  for (const section of ingestion.sections) {
    const words = section.text.split(/\s+/).filter(Boolean);
    const wordCount = words.length;

    if (wordCount > 450) {
      const paragraphs = section.text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
      let currentChunkParas: string[] = [];
      let currentChunkWordCount = 0;
      let subIndex = 1;

      for (let pIdx = 0; pIdx < paragraphs.length; pIdx++) {
        const para = paragraphs[pIdx];
        const paraWords = para.split(/\s+/).filter(Boolean).length;
        currentChunkParas.push(para);
        currentChunkWordCount += paraWords;

        const isLast = pIdx === paragraphs.length - 1;
        if (currentChunkWordCount >= 220 || isLast) {
          const body = currentChunkParas.join('\n\n');
          const chunkWords = body.split(/\s+/).filter(Boolean).length;
          const startChar = ingestion.fullText.indexOf(body);
          const endChar = startChar >= 0 ? startChar + body.length : section.charEnd;

          const sourceRef: SourceReference = {
            pageNumber: section.pageNumber,
            sectionTitle: `${section.title} (Part ${subIndex})`,
            charStart: Math.max(0, startChar),
            charEnd,
            rawSnippet: body.slice(0, 200),
            sourceLocator: section.pageNumber
              ? `Page ${section.pageNumber} > ${section.title} (Part ${subIndex})`
              : `${section.title} (Part ${subIndex}) [chars ${Math.max(0, startChar)}-${endChar}]`
          };

          const rawMission: Mission = {
            id: `${editionId}_m${missionOrder}`,
            editionId,
            order: missionOrder,
            title: `${section.title} — Part ${subIndex}`,
            readingEstimateMinutes: calculateReadingTimeMinutes(chunkWords),
            wordCount: chunkWords,
            body,
            keyTakeaways: extractKeyTakeaways(body),
            done: false,
            sourceReference: sourceRef,
            quizQuestions: [],
            flashcards: []
          };

          rawMission.quizQuestions = generateQuizForMission(rawMission, 3);
          rawMission.flashcards = generateFlashcardsForMission(rawMission, 3);
          missions.push(rawMission);

          missionOrder++;
          subIndex++;
          currentChunkParas = [];
          currentChunkWordCount = 0;
        }
      }
    } else {
      const rawMission: Mission = {
        id: `${editionId}_m${missionOrder}`,
        editionId,
        order: missionOrder,
        title: section.title,
        readingEstimateMinutes: calculateReadingTimeMinutes(wordCount),
        wordCount,
        body: section.text,
        keyTakeaways: extractKeyTakeaways(section.text),
        done: false,
        sourceReference: section.sourceReference,
        quizQuestions: [],
        flashcards: []
      };

      rawMission.quizQuestions = generateQuizForMission(rawMission, 3);
      rawMission.flashcards = generateFlashcardsForMission(rawMission, 3);
      missions.push(rawMission);

      missionOrder++;
    }
  }

  const totalTimeMinutes = missions.reduce((acc, m) => acc + m.readingEstimateMinutes, 0);

  const colors = ['bg-[#6D4AFF]', 'bg-[#0FA968]', 'bg-[#FF7A45]', 'bg-[#1E293B]', 'bg-[#2563EB]', 'bg-[#0D9488]'];
  const emojis = ['🧭', '📚', '🎯', '💡', '📋', '🔍', '🎓', '💼'];

  const cleanFileName = ingestion.metadata.fileName.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
  const title = options.editionTitle || `${cleanFileName} — Focus Edition`;
  const description =
    options.editionDescription ||
    `Deconstructed from ${ingestion.metadata.fileName} into ${missions.length} source-grounded missions for ADHD focus.`;

  return {
    id: editionId,
    title,
    description,
    sourceFileName: ingestion.metadata.fileName,
    sourceType: ingestion.metadata.fileType,
    status: 'draft',
    progress: 0,
    totalMissions: missions.length,
    totalTimeEstimateMinutes: totalTimeMinutes,
    createdAt: new Date().toISOString().slice(0, 10),
    updatedAt: new Date().toISOString().slice(0, 10),
    tags: [ingestion.metadata.fileType, 'accessible'],
    coverEmoji: options.coverEmoji || emojis[Math.floor(Math.random() * emojis.length)],
    themeColor: options.themeColor || colors[Math.floor(Math.random() * colors.length)],
    missions,
    rawSourceText: ingestion.fullText
  };
}
