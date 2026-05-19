export type MockTestPart = 1 | 2 | 3;

export type RecordedMockAnswer = {
  part: MockTestPart;
  question: string;
  uri: string;
  duration: number;
  transcript: string | null;
};

export type MockTestData = {
  part1: string[];
  part2: {
    topic: string;
    points: string[];
    preparationTime: number;
    speakingTime: number;
  };
  part3: string[];
  limits: {
    part1Question: number;
    part3Question: number;
  };
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

export const normalizeMockTestData = (data?: Partial<MockTestData> | null): MockTestData => {
  const fallback = {
    part1: [...MOCK_TEST.part1],
    part2: {
      topic: MOCK_TEST.part2.topic,
      points: [...MOCK_TEST.part2.points],
      preparationTime: MOCK_TEST.part2.preparationTime,
      speakingTime: MOCK_TEST.part2.speakingTime,
    },
    part3: [...MOCK_TEST.part3],
    limits: { ...MOCK_TEST_LIMITS },
  };

  if (!data) return fallback;

  const part2 = data.part2 || fallback.part2;

  return {
    part1: Array.isArray(data.part1) && data.part1.length > 0 ? data.part1 : fallback.part1,
    part2: {
      topic: part2.topic || fallback.part2.topic,
      points: Array.isArray(part2.points) && part2.points.length > 0 ? part2.points : fallback.part2.points,
      preparationTime: part2.preparationTime || fallback.part2.preparationTime,
      speakingTime: part2.speakingTime || fallback.part2.speakingTime,
    },
    part3: Array.isArray(data.part3) && data.part3.length > 0 ? data.part3 : fallback.part3,
    limits: {
      part1Question: data.limits?.part1Question || fallback.limits.part1Question,
      part3Question: data.limits?.part3Question || fallback.limits.part3Question,
    },
  };
};
