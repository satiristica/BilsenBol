const russianPlurals = new Intl.PluralRules("ru-RU");

export interface RussianForms {
  /** 1, 21, 101 … */
  one: string;
  /** 2–4, 22–24 … (also used for fractions) */
  few: string;
  /** 0, 5–20, 25 … */
  many: string;
}

/** Picks the grammatical form that agrees with `count` in Russian. */
export function pluralRu(count: number, forms: RussianForms): string {
  const category = russianPlurals.select(count);
  if (category === "one") {
    return forms.one;
  }
  return category === "many" ? forms.many : forms.few;
}

export const YEARS: RussianForms = { one: "год", few: "года", many: "лет" };
