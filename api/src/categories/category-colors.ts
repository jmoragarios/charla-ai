export const CATEGORY_COLORS = [
  '#e5534b',
  '#f0883e',
  '#d4a72c',
  '#57ab5a',
  '#39c5cf',
  '#539bf5',
  '#986ee2',
  '#768390',
] as const;

export type CategoryColor = (typeof CATEGORY_COLORS)[number];
