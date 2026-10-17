import type { Grammar, Level, Unit } from "@/lib/types";
import { unit1 } from "./unit1";
import { unit2 } from "./unit2";
import { unit3 } from "./unit3";
import { unit4 } from "./unit4";
import { unit5 } from "./unit5";
import { unit6 } from "./unit6";
import { unit7 } from "./unit7";
import { unit8 } from "./unit8";
import { unit9 } from "./unit9";
import { unit10 } from "./unit10";
import { unit11 } from "./unit11";
import { unit12 } from "./unit12";
import { unit13 } from "./unit13";
import { unit14 } from "./unit14";
import { unit15 } from "./unit15";
import { unit16 } from "./unit16";
import { unit17 } from "./unit17";
import { unit18 } from "./unit18";
import { unit19 } from "./unit19";
import { unit20 } from "./unit20";

/**
 * A "set" (the `Unit` type) = 5 grammar points + 1 combined speaking exam that mixes all 5.
 * Order is unchanged for sets 1–14 so existing progress keeps working; new sets are appended.
 */
export const units: Unit[] = [
  unit1, unit2, unit3, unit4, unit5, unit6, unit7, unit8, unit9, unit10,
  unit11, unit12, unit13, unit14, unit15, unit16, unit17, unit18, unit19, unit20,
];

/** A study "Unit" groups several consecutive sets (each with its own combined exam). */
export interface UnitGroup {
  id: number;
  title: string;
  level: Level;
  blurb: string;
  sets: number[]; // ids of consecutive sets
}

export const unitGroups: UnitGroup[] = [
  { id: 1, title: "N4 Foundations", level: "N4", blurb: "Experience, permission, te-form helpers, giving/receiving, conditions, passive & causative", sets: [1, 2, 3, 4] },
  { id: 2, title: "N3 Starter", level: "N3", blurb: "Expectation, timing, reasons and decisions", sets: [5, 6] },
  { id: 3, title: "N4 Skills", level: "N4", blurb: "Ability, time & sequence, comparison, connecting sentences, advice and commands", sets: [7, 8, 9, 10] },
  { id: 4, title: "N3 Advanced", level: "N3", blurb: "Duty, cause & time, result & neglect, exam-logic patterns", sets: [11, 12, 13, 14] },
  { id: 5, title: "N4 Plus", level: "N4", blurb: "Reporting & guessing, polite Japanese & requests, change & frequency", sets: [15, 16, 17] },
  { id: 6, title: "N3 Plus", level: "N3", blurb: "Attempt, impossibility & necessity, strong feelings & 'although', topic / source / comparison", sets: [18, 19, 20] },
];

export const allGrammar: (Grammar & { unit: number; index: number })[] = units
  .flatMap((u) => u.grammar.map((g) => ({ ...g, unit: u.id, index: 0 })))
  .map((g, i) => ({ ...g, index: i }));

export function getGrammar(id: string) {
  return allGrammar.find((g) => g.id === id);
}

export function getUnit(id: number) {
  return units.find((u) => u.id === id);
}

export function getGroupOf(setId: number) {
  return unitGroups.find((g) => g.sets.includes(setId));
}
