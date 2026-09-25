import { SourceReference } from '../../types/document';
import { Mission, QuizOption, QuizQuestion } from '../../types/mission';

interface ExtractedFact {
  type: 'cap' | 'number' | 'definition' | 'condition' | 'requirement' | 'general';
  sentence: string;
  keyPhrase: string;
  charStart: number;
  charEnd: number;
}

export function extractFactualStatements(bodyText: string): ExtractedFact[] {
  // Split on newlines, bullet points, or sentence terminals
  const rawSegments = bodyText
    .split(/\n+|\r\n+|(?<=[.?!])\s+/)
    .map(s => {
      // Find where clean segment exists in body
      const cleaned = s.replace(/^[-*•\s\d.)]+/, '').trim();
      return cleaned;
    })
    .filter(s => s.length >= 18 && s.length <= 350);

  const facts: ExtractedFact[] = [];

  for (const sentence of rawSegments) {
    const charStart = Math.max(0, bodyText.indexOf(sentence));
    const charEnd = charStart >= 0 ? charStart + sentence.length : 0;

    // 1. Monetary cap or currency facts
    const moneyMatch = sentence.match(/[£$€]([0-9,]+(\.[0-9]{2})?)/);
    if (moneyMatch) {
      facts.push({
        type: 'cap',
        sentence,
        keyPhrase: moneyMatch[0],
        charStart,
        charEnd
      });
      continue;
    }

    // 2. Numerical thresholds (months, days, points, age, hours)
    const numMatch = sentence.match(/\b([0-9]+)\s+(months?|weeks?|days?|hours?|points?|years?)\b/i);
    if (numMatch) {
      facts.push({
        type: 'number',
        sentence,
        keyPhrase: numMatch[0],
        charStart,
        charEnd
      });
      continue;
    }

    // 3. Definitions ("X is a...", "X means...", "X covers...")
    const isDef = /\b(is a|is an|refers to|means|covers|provides grant|evaluates|categories|practical intervention)\b/i.test(sentence);
    if (isDef && sentence.length < 250) {
      facts.push({
        type: 'definition',
        sentence,
        keyPhrase: sentence,
        charStart,
        charEnd
      });
      continue;
    }

    // 4. Requirements / Rules ("must", "shall", "required", "qualify")
    const isReq = /\b(must|required|qualifies|qualify|eligible|duty)\b/i.test(sentence);
    if (isReq) {
      facts.push({
        type: 'requirement',
        sentence,
        keyPhrase: sentence,
        charStart,
        charEnd
      });
      continue;
    }

    // 5. Prohibitions / Not allowed ("never", "not repayable", "will not")
    const isNeg = /\b(never|not repayable|will not|does not|prohibited)\b/i.test(sentence);
    if (isNeg) {
      facts.push({
        type: 'condition',
        sentence,
        keyPhrase: sentence,
        charStart,
        charEnd
      });
      continue;
    }

    // General factual statement
    facts.push({
      type: 'general',
      sentence,
      keyPhrase: sentence,
      charStart,
      charEnd
    });
  }

  return facts;
}

export function generateQuizForMission(mission: Mission, count: number = 3): QuizQuestion[] {
  const facts = extractFactualStatements(mission.body);
  const questions: QuizQuestion[] = [];

  // Pick up to `count` facts with preference for high-signal facts
  const prioritizedFacts = [
    ...facts.filter(f => f.type === 'cap' || f.type === 'number'),
    ...facts.filter(f => f.type === 'requirement' || f.type === 'condition'),
    ...facts.filter(f => f.type === 'definition'),
    ...facts.filter(f => f.type === 'general')
  ].slice(0, count);

  prioritizedFacts.forEach((fact, idx) => {
    let questionText = '';
    const correctAnswer = fact.sentence;
    let wrongAnswer1 = '';
    let wrongAnswer2 = '';
    let wrongAnswer3 = '';

    if (fact.type === 'cap') {
      questionText = `According to the text, what financial limit or cap is specified?`;
      wrongAnswer1 = 'Grants are capped at £1,000 maximum per year.';
      wrongAnswer2 = 'There is no statutory cap; funding is unlimited without review.';
      wrongAnswer3 = 'Awards are fixed at 50% of the applicant\'s base salary.';
    } else if (fact.type === 'number') {
      const match = fact.sentence.match(/\b([0-9]+)\s+(months?|weeks?|days?|hours?|points?|years?)\b/i);
      const metric = match ? match[0] : 'the statutory quantity';
      questionText = `What does the document state regarding "${metric}"?`;
      wrongAnswer1 = `The timeframe/amount is strictly double this figure.`;
      wrongAnswer2 = `This requirement was discontinued under recent policy updates.`;
      wrongAnswer3 = `The standard limit is only applicable to non-disabled employees.`;
    } else if (fact.type === 'definition') {
      questionText = `Based on the source text, which statement accurately reflects the rule or definition?`;
      wrongAnswer1 = 'It is an optional discretionary benefit that must be repaid in full.';
      wrongAnswer2 = 'The provision applies exclusively to corporate executive positions.';
      wrongAnswer3 = 'The individual must personally cover 100% of the initial expenditure.';
    } else if (fact.type === 'requirement' || fact.type === 'condition') {
      questionText = `What is a required condition or key rule specified in this section?`;
      wrongAnswer1 = 'A formal medical diagnosis letter is mandated prior to any preliminary inquiry.';
      wrongAnswer2 = 'Employees must complete a minimum of 5 years of continuous service before applying.';
      wrongAnswer3 = 'The employer has absolute authority to decline reasonable accommodations without review.';
    } else {
      questionText = `Which of the following points is explicitly confirmed in this mission?`;
      wrongAnswer1 = 'The procedure requires submitting paper forms strictly by registered postal mail.';
      wrongAnswer2 = 'Assistance is restricted solely to individuals with visible physical disabilities.';
      wrongAnswer3 = 'All applications are automatically declined during the first review cycle.';
    }

    const options: QuizOption[] = [
      { id: 'opt_a', text: correctAnswer, isCorrect: true },
      { id: 'opt_b', text: wrongAnswer1, isCorrect: false },
      { id: 'opt_c', text: wrongAnswer2, isCorrect: false },
      { id: 'opt_d', text: wrongAnswer3, isCorrect: false }
    ];

    // Deterministic shuffle based on question index
    const seed = (idx + mission.order) % 4;
    const shuffled = [...options];
    const item = shuffled.splice(0, 1)[0];
    shuffled.splice(seed, 0, item);

    const sourceRef: SourceReference = {
      pageNumber: mission.sourceReference.pageNumber,
      sectionTitle: mission.title,
      charStart: fact.charStart >= 0 ? fact.charStart : mission.sourceReference.charStart,
      charEnd: fact.charEnd > 0 ? fact.charEnd : mission.sourceReference.charEnd,
      rawSnippet: fact.sentence,
      sourceLocator: `${mission.sourceReference.sourceLocator} > Quote: "${fact.sentence.slice(0, 80)}..."`
    };

    questions.push({
      id: `quiz_${mission.id}_q${idx + 1}`,
      missionId: mission.id,
      question: questionText,
      options: shuffled,
      explanation: `Verified from source text: "${fact.sentence}"`,
      sourceReference: sourceRef
    });
  });

  return questions;
}
