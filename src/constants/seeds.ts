import { Edition } from '../types/mission';

export const INITIAL_SEEDS: Edition[] = [
  {
    id: 'ed_atw',
    title: 'Access to Work — Focus Edition',
    description: 'DWP Access to Work factsheet rebuilt as 13 short missions for ADHD brains.',
    sourceFileName: 'DWP factsheet.pdf',
    sourceType: 'government',
    status: 'in_progress',
    progress: 9,
    totalMissions: 13,
    totalTimeEstimateMinutes: 52,
    createdAt: '2026-09-10',
    updatedAt: '2026-09-16',
    tags: ['government', 'ADHD'],
    coverEmoji: '🧭',
    themeColor: 'bg-[#6D4AFF]',
    missions: [
      {
        id: 'atw_m1',
        editionId: 'ed_atw',
        order: 1,
        title: 'What Access to Work actually is',
        readingEstimateMinutes: 4,
        wordCount: 42,
        done: true,
        body: 'Access to Work is a publicly funded grant that pays for practical support so you can start work, stay in work, or move into self-employment. It never has to be paid back. Key: support worker, not employer.',
        keyTakeaways: ['Non-repayable public grant', 'Supports starting, staying, or moving to self-employment'],
        sourceReference: {
          sectionTitle: 'Overview',
          pageNumber: 1,
          charStart: 0,
          charEnd: 195,
          rawSnippet: 'Access to Work is a publicly funded grant that pays for practical support so you can start work, stay in work, or move into self-employment. It never has to be paid back.',
          sourceLocator: 'Page 1, Paragraph 1'
        },
        quizQuestions: [
          {
            id: 'quiz_atw_m1_1',
            missionId: 'atw_m1',
            question: 'What is Access to Work?',
            options: [
              { id: '1', text: 'A publicly funded grant that never has to be paid back', isCorrect: true },
              { id: '2', text: 'A commercial bank loan requiring interest repayments', isCorrect: false },
              { id: '3', text: 'An employer funded salary deduction scheme', isCorrect: false },
              { id: '4', text: 'A volunteer matching service with no financial aid', isCorrect: false }
            ],
            explanation: 'Access to Work is a publicly funded grant that pays for practical support and never has to be paid back.',
            sourceReference: {
              charStart: 0,
              charEnd: 150,
              rawSnippet: 'Access to Work is a publicly funded grant that pays for practical support so you can start work. It never has to be paid back.',
              sourceLocator: 'DWP Factsheet Page 1'
            }
          }
        ],
        flashcards: [
          {
            id: 'card_atw_m1_1',
            missionId: 'atw_m1',
            front: 'What is Access to Work?',
            back: 'A publicly funded grant that never has to be paid back, for practical workplace support.',
            sourceReference: {
              charStart: 0,
              charEnd: 120,
              rawSnippet: 'Access to Work is a publicly funded grant.',
              sourceLocator: 'Page 1'
            }
          }
        ]
      },
      {
        id: 'atw_m2',
        editionId: 'ed_atw',
        order: 2,
        title: 'What it can pay for',
        readingEstimateMinutes: 5,
        wordCount: 48,
        done: true,
        body: 'It can pay for: specialist equipment (noise-cancelling headphones, screen readers), travel costs if public transport is hard, support workers, job coaches, note takers, and a dedicated mental health support plan with flexible hours and mentoring.',
        keyTakeaways: ['Specialist assistive equipment', 'Travel costs and taxi assistance', 'Support workers and job coaching'],
        sourceReference: {
          sectionTitle: 'Funded Support Types',
          pageNumber: 2,
          charStart: 196,
          charEnd: 420,
          rawSnippet: 'It can pay for: specialist equipment (noise-cancelling headphones, screen readers), travel costs if public transport is hard, support workers, job coaches, note takers.',
          sourceLocator: 'Page 2, Section 3'
        },
        quizQuestions: [],
        flashcards: []
      },
      {
        id: 'atw_m3',
        editionId: 'ed_atw',
        order: 3,
        title: 'What it will NOT pay for',
        readingEstimateMinutes: 3,
        wordCount: 38,
        done: true,
        body: 'Two hard limits: (1) Reasonable adjustments are the employer legal duty under Equality Act — AtW will not pay for what employer must do. (2) Never business start-up costs — AtW advises employer instead.',
        keyTakeaways: ['Will not pay for employer statutory reasonable adjustments', 'Never pays business start-up costs'],
        sourceReference: {
          sectionTitle: 'Exclusions',
          pageNumber: 2,
          charStart: 421,
          charEnd: 600,
          rawSnippet: 'Reasonable adjustments are the employer legal duty under Equality Act — AtW will not pay for what employer must do.',
          sourceLocator: 'Page 2, Section 4'
        },
        quizQuestions: [],
        flashcards: []
      },
      {
        id: 'atw_m8',
        editionId: 'ed_atw',
        order: 8,
        title: 'How much you can get (Cap 2026)',
        readingEstimateMinutes: 4,
        wordCount: 42,
        done: true,
        body: 'No set amount — case by case. Grants since April 2026 capped at £69,260 a year. Cap depends on award date, not application date. You claim back what you spend.',
        keyTakeaways: ['Grants capped at £69,260 a year since April 2026', 'You spend then claim back reimbursement'],
        sourceReference: {
          sectionTitle: 'Grant Caps',
          pageNumber: 4,
          charStart: 601,
          charEnd: 790,
          rawSnippet: 'Grants since April 2026 capped at £69,260 a year. Cap depends on award date, not application date.',
          sourceLocator: 'Page 4, Section 8'
        },
        quizQuestions: [
          {
            id: 'quiz_atw_m8_1',
            missionId: 'atw_m8',
            question: 'What is the maximum annual Access to Work grant cap since April 2026?',
            options: [
              { id: '1', text: '£69,260 a year', isCorrect: true },
              { id: '2', text: '£10,000 a year', isCorrect: false },
              { id: '3', text: '£30,000 a year', isCorrect: false },
              { id: '4', text: 'There is no cap', isCorrect: false }
            ],
            explanation: 'Grants since April 2026 are capped at £69,260 a year based on award date.',
            sourceReference: {
              charStart: 601,
              charEnd: 700,
              rawSnippet: 'Grants since April 2026 capped at £69,260 a year.',
              sourceLocator: 'Page 4'
            }
          }
        ],
        flashcards: []
      }
    ]
  },
  {
    id: 'ed_pip',
    title: 'PIP Handbook — Focus Edition',
    description: 'PIP guide turned into short, manageable missions.',
    sourceFileName: 'PIP booklet photo.png',
    sourceType: 'image',
    status: 'in_progress',
    progress: 2,
    totalMissions: 4,
    totalTimeEstimateMinutes: 16,
    createdAt: '2026-09-14',
    updatedAt: '2026-09-15',
    tags: ['benefits'],
    coverEmoji: '💷',
    themeColor: 'bg-[#0FA968]',
    missions: [
      {
        id: 'pip_m1',
        editionId: 'ed_pip',
        order: 1,
        title: 'What PIP is',
        readingEstimateMinutes: 4,
        wordCount: 28,
        done: true,
        body: 'PIP is Personal Independence Payment for daily living and mobility needs. Not means-tested. 16 to State Pension age. Two parts, each standard/enhanced.',
        keyTakeaways: ['Personal Independence Payment', 'Not means-tested', 'Covers Daily Living and Mobility'],
        sourceReference: {
          sectionTitle: 'What PIP is',
          charStart: 0,
          charEnd: 150,
          rawSnippet: 'PIP is Personal Independence Payment for daily living and mobility needs.',
          sourceLocator: 'Page 1, Heading 1'
        },
        quizQuestions: [],
        flashcards: []
      }
    ]
  }
];
