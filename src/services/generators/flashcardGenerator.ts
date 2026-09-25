import { SourceReference } from '../../types/document';
import { Flashcard, Mission } from '../../types/mission';
import { extractFactualStatements } from './quizGenerator';

export function generateFlashcardsForMission(mission: Mission, count: number = 3): Flashcard[] {
  const facts = extractFactualStatements(mission.body);
  const flashcards: Flashcard[] = [];

  const selectedFacts = facts.slice(0, count);

  selectedFacts.forEach((fact, idx) => {
    let front = '';
    let back = fact.sentence;

    if (fact.type === 'cap') {
      const match = fact.sentence.match(/[£$€][0-9,]+(\.[0-9]{2})?/);
      front = `Statutory Financial Cap (${match ? match[0] : 'Limit'})`;
      back = fact.sentence;
    } else if (fact.type === 'number') {
      const match = fact.sentence.match(/\b([0-9]+)\s+(months?|weeks?|days?|hours?|points?|years?)\b/i);
      const metric = match ? match[0] : 'Timeframe';
      front = `Key Threshold / Timeframe (${metric})`;
      back = fact.sentence;
    } else if (fact.type === 'definition') {
      const words = fact.sentence.split(/\s+/).slice(0, 5).join(' ');
      front = `Core Definition: ${words}...`;
      back = fact.sentence;
    } else if (fact.type === 'requirement' || fact.type === 'condition') {
      front = `Mandatory Rule / Condition #${idx + 1}`;
      back = fact.sentence;
    } else {
      const firstFew = fact.sentence.split(/\s+/).slice(0, 4).join(' ');
      front = `Key Point: ${firstFew}...`;
      back = fact.sentence;
    }

    const sourceRef: SourceReference = {
      pageNumber: mission.sourceReference.pageNumber,
      sectionTitle: mission.title,
      charStart: fact.charStart >= 0 ? fact.charStart : mission.sourceReference.charStart,
      charEnd: fact.charEnd > 0 ? fact.charEnd : mission.sourceReference.charEnd,
      rawSnippet: fact.sentence,
      sourceLocator: `${mission.sourceReference.sourceLocator} [Card ${idx + 1}]`
    };

    flashcards.push({
      id: `card_${mission.id}_c${idx + 1}`,
      missionId: mission.id,
      front,
      back,
      sourceReference: sourceRef
    });
  });

  return flashcards;
}

export function populateMissionInteractiveItems(mission: Mission): Mission {
  const quizQuestions = generateQuizForMission(mission, 3);
  const flashcards = generateFlashcardsForMission(mission, 3);
  return {
    ...mission,
    quizQuestions,
    flashcards
  };
}
