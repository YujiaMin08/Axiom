
export enum LearningCategory {
  LANGUAGE = 'LANGUAGE',
  SCIENCE = 'SCIENCE',
  LIBERAL_ARTS = 'LIBERAL_ARTS',
  DIALOGUE = 'DIALOGUE'
}

export interface LearningSession {
  topic: string;
  category: LearningCategory;
  timestamp: number;
}

export interface WordData {
  word: string;
  phonetic: string;
  definition: string;
  usage: string[];
  etymology: string;
  story: string;
  keySentence: string;
}

export interface ScienceData {
  concept: string;
  intuition: string;
  variables: {
    name: string;
    label: string;
    min: number;
    max: number;
    current: number;
    unit: string;
  }[];
  formula: string;
  explanation: string;
  scenarios: string[];
}

export interface QuizQuestion {
  question: string;
  options: string[];
  answerIndex: number;
  explanation: string;
}
