export type MockTestPart = 1 | 2 | 3;

export type RecordedMockAnswer = {
  part: MockTestPart;
  question: string;
  uri: string;
  duration: number;
};

export const MOCK_TEST = {
  part1: [
    'Do you work or study?',
    'Why did you choose your major?',
    'What do you usually do after class?',
    'Do you prefer studying alone or with other people?',
  ],
  part2: {
    topic: 'Describe a mobile application that you find useful.',
    points: [
      'What the application is',
      'When you started using it',
      'What features it has',
      'And explain why you find it useful',
    ],
    preparationTime: 60,
    speakingTime: 120,
  },
  part3: [
    'How have mobile applications changed the way students learn?',
    'Do you think educational apps can replace teachers?',
    'What are the disadvantages of relying too much on mobile apps?',
    'How might learning apps develop in the future?',
  ],
} as const;

export const MOCK_TEST_LIMITS = {
  part1Question: 30,
  part3Question: 45,
} as const;
