export type Level = "N4" | "N3";

/** [japanese (kanji), reading (hiragana, spaced), english] */
export type Example = [string, string, string];

/** [question, options, correctIndex, explanation] */
export type QuizQ = [string, string[], number, string];

/** [english prompt, japanese (kanji), reading (hiragana, spaced)] */
export type SpeakItem = [string, string, string];

export interface Grammar {
  id: string;
  level: Level;
  title: string; // e.g. 〜たことがある
  meaning: string; // English meaning
  formation: string[];
  explanation: string[];
  /**
   * Grammar pattern check in hiragana. Groups separated by "&" (all required),
   * alternatives separated by "|" (any one).
   */
  check: string;
  tamil: { pattern: string; example: string; note: string };
  tips?: string[];
  examples: Example[];
  quiz: QuizQ[];
  speaking: SpeakItem[];
}

export interface Unit {
  id: number;
  level: Level;
  title: string;
  grammar: Grammar[];
  /** Combined sentences that use all (or most) of the unit's grammar */
  review: SpeakItem[];
}
