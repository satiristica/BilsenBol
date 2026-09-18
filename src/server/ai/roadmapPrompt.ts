import { buildDiagnosis } from "@/domain/diagnosis";
import { rankPrograms } from "@/domain/matching";
import {
  FIELD_OPTIONS,
  GRANT_COMPETITIVE_GPA,
  REGION_OPTIONS,
  labelOf,
  type ApplicantProfile,
} from "@/domain/profile";
import { buildRoadmap, listSteps, type RoadmapSeason } from "@/domain/roadmap";
import { ADVICE_LIMITS } from "@/features/roadmap/roadmapAdvice";

/**
 * Builds the model request for one profile. The skeleton always comes from
 * the rules; the model only annotates it. Every fact the model sees is
 * described in words, because a model shown "4.6" or "$3 000" tends to
 * repeat the number, and numbers are rejected on the way back.
 */

const SEASON_NAMES: Record<RoadmapSeason, string> = {
  autumn: "осень",
  winter: "зима",
  spring: "весна",
};

const GRADE_WORDS = {
  "grade-9-10": "учится в девятом или десятом классе и готовится заранее",
  "grade-11": "учится в выпускном классе и подаётся в этом сезоне",
  graduate: "уже окончил школу",
} as const;

const ENGLISH_WORDS = {
  school: "только школьный английский, сертификата нет",
  duolingo: "сдан Duolingo English Test",
  toefl: "сдан TOEFL",
  ielts: "сдан IELTS",
} as const;

const BUDGET_WORDS = {
  "grant-only": "семья не может платить, нужен полный грант",
  "up-to-3k": "скромный семейный бюджет",
  "up-to-8k": "средний семейный бюджет",
  "from-15k": "бюджет не ограничивает выбор",
} as const;

function describeGpa(gpa: number): string {
  if (gpa >= 4.7) {
    return "высокий средний балл";
  }
  if (gpa >= GRANT_COMPETITIVE_GPA) {
    return "хороший средний балл на уровне грантовых конкурсов";
  }
  return "средний балл ниже уровня грантовых конкурсов";
}

const hasDigits = (text: string) => /\p{Nd}/u.test(text);

export const ROADMAP_SYSTEM_INSTRUCTION = `Ты — консультант по поступлению в сервисе BilsenBol для школьников из стран СНГ.
Тебе передают профиль абитуриента, подобранные для него программы и шаги его плана поступления.
Твоя задача — персонализировать этот план.

Строгие правила:
1. Опирайся только на переданные данные. Не придумывай требования вузов, сроки, даты, цены, баллы, проценты, шансы поступления и названия реальных вузов или сайтов.
2. Не используй цифры совсем, ни в каком виде. Если нужно количество — пиши словами без точных чисел («несколько», «пара»).
3. Для каждого шага из списка напиши совет: как именно этому абитуриенту выполнить шаг и почему он важен для его программ. Используй только id из списка.
4. summary — общая стратегия для этого абитуриента в одном-двух предложениях.
5. extras — до трёх дополнительных полезных шагов, которых нет в плане, каждый с сезоном.
6. Пиши по-русски, обращайся на «вы», коротко и конкретно. Без markdown.
7. Совет к шагу — не длиннее ${ADVICE_LIMITS.stepAdvice} символов, summary — не длиннее ${ADVICE_LIMITS.summary}.`;

export interface RoadmapPrompt {
  user: string;
  jsonSchema: Record<string, unknown>;
  allowedStepIds: Set<string>;
}

export function buildRoadmapPrompt(profile: ApplicantProfile): RoadmapPrompt {
  const result = rankPrograms(profile);
  const diagnosis = buildDiagnosis(profile, result);
  const steps = listSteps(buildRoadmap(profile, result));
  const stepIds = steps.map((step) => step.id);

  const payload = {
    абитуриент: {
      учёба: GRADE_WORDS[profile.grade],
      успеваемость: describeGpa(profile.gpa),
      английский: ENGLISH_WORDS[profile.english],
      бюджет: BUDGET_WORDS[profile.budget],
      интересы: profile.fields.map((field) => labelOf(FIELD_OPTIONS, field)),
      регионы: profile.regions.map((region) => labelOf(REGION_OPTIONS, region)),
      статус_готовности: diagnosis.statusLabel,
      выводы: diagnosis.insights
        .map((insight) => `${insight.label}: ${insight.title}`)
        .filter((line) => !hasDigits(line)),
    },
    программы: result.matches.slice(0, 3).map((match) => ({
      название: match.program.programName,
      город: match.program.city,
      страна: match.program.country,
      формат: match.programBadges.map((badge) => badge.label).filter((label) => !hasDigits(label)),
      может_помешать: match.blocker && !hasDigits(match.blocker) ? match.blocker : null,
    })),
    шаги_плана: steps.map((step) => ({
      id: step.id,
      сезон: SEASON_NAMES[step.season],
      шаг: step.title,
    })),
  };

  return {
    user: `Данные абитуриента в JSON:\n${JSON.stringify(payload, null, 2)}\n\nВерни ответ строго по JSON-схеме.`,
    allowedStepIds: new Set(stepIds),
    jsonSchema: {
      type: "object",
      properties: {
        summary: {
          type: "string",
          description: "Общая стратегия для абитуриента, одно-два предложения, без цифр.",
        },
        steps: {
          type: "array",
          maxItems: ADVICE_LIMITS.maxSteps,
          items: {
            type: "object",
            properties: {
              // The enum confines the model to steps the rules produced.
              id: { type: "string", enum: stepIds },
              advice: { type: "string", description: "Персональный совет к шагу, без цифр." },
            },
            required: ["id", "advice"],
          },
        },
        extras: {
          type: "array",
          maxItems: ADVICE_LIMITS.maxExtras,
          items: {
            type: "object",
            properties: {
              // The payload names seasons in Russian, so spell out the mapping:
              // without it Groq's strict mode sometimes rejected the reply.
              season: {
                type: "string",
                enum: ["autumn", "winter", "spring"],
                description: "autumn — осень, winter — зима, spring — весна.",
              },
              title: { type: "string", description: "Короткое название шага, без цифр." },
              detail: { type: "string", description: "Зачем и как это сделать, без цифр." },
            },
            required: ["season", "title", "detail"],
          },
        },
      },
      required: ["summary", "steps", "extras"],
    },
  };
}
