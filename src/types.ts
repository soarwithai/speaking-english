export enum AppMode {
  FREE_TALK = 'FREE_TALK',
  SCENARIO_PRACTICE = 'SCENARIO_PRACTICE'
}

export enum ScenarioDifficulty {
  BEGINNER = 'Beginner',
  INTERMEDIATE = 'Intermediate',
  ADVANCED = 'Advanced'
}

export type VoiceName = 'Puck' | 'Charon' | 'Kore' | 'Fenrir' | 'Zephyr';

export interface FreeTalkResponse {
  simple: string;
  formal: string;
  slang: string;
}

export interface ScenarioEvaluation {
  critique: string;
  betterExample: string;
  culturalNote: string;
  score: number;
}

export interface ScenarioSetup {
  topic: string;
  description: string;
  question: string;
}

export const SCENARIO_TOPICS = [
  "Campus Life & Lectures",
  "Mathematics Department",
  "Grocery Shopping",
  "Travel & Transport",
  "Socializing & Pubs",
  "News & Current Affairs",
  "Politics",
  "Economy",
  "Banking & Finance",
  "Healthcare (NHS)"
];