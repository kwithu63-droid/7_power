
export type PowerCategory = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G';

export interface QuestionPair {
  id: number;
  textA: string;
  catA: PowerCategory;
  textB: string;
  catB: PowerCategory;
}

export interface ScoreState {
  [key: number]: {
    scoreA: number;
    scoreB: number;
  };
}

export interface PowerBaseInfo {
  category: PowerCategory;
  name: string;
  description: string;
  color: string;
}
