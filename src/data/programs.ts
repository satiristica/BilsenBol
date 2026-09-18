import type { Region, StudyField } from "@/domain/profile";

/**
 * CATALOGUE OF REAL PROGRAMMES.
 *
 * Every admission fact below was read on the official page listed in the
 * programme's `sources` on CATALOGUE_CHECKED_AT (AGENTS.md section 4). When a
 * page did not state something, the field is null and the UI says "уточняйте
 * на сайте" instead of guessing. Application windows are copied with the
 * intake year they belong to: a past window is a guide, not a promise.
 */
export const CATALOGUE_CHECKED_AT = "19.09.2026";

export const SOURCE_NOTICE = `Данные с официальных сайтов, проверены ${CATALOGUE_CHECKED_AT}. Перед подачей сверяйтесь с сайтом вуза.`;

export const SOURCE_BADGE = `Проверено ${CATALOGUE_CHECKED_AT}`;

export type Currency = "USD" | "EUR" | "CZK" | "HUF" | "PLN" | "TRY" | "KRW" | "KZT" | "UZS";

/** Certificates the profile can report; "school" in the profile means none. */
export type EnglishTest = "ielts" | "toefl" | "duolingo";

export interface Tuition {
  amount: number;
  currency: Currency;
  period: "year" | "semester";
  /** Which students and which academic year the figure is published for. */
  note: string;
}

export interface FullFunding {
  name: string;
  covers: string;
  eligibility: string;
  /** True when every admitted student receives it, so the contest is for the place, not the money. */
  awardedToAllAdmitted: boolean;
}

export interface EnglishRequirement {
  /**
   * Certificates the page lists. "unlisted" means the page names a CEFR level
   * but no tests, so any certificate is plausible and must be confirmed.
   */
  accepts: readonly EnglishTest[] | "unlisted";
  /** Minimum scores as the source states them. */
  minimum: string;
}

export interface Foundation {
  name: string;
  /** Certificates accepted for entry; null when the page states none is needed. */
  accepts: readonly EnglishTest[] | null;
  requirement: string;
}

export interface SourceLink {
  label: string;
  url: string;
}

export interface Program {
  id: string;
  university: string;
  programName: string;
  country: string;
  city: string;
  region: Region;
  field: StudyField;
  tuition: Tuition;
  fullFunding: FullFunding | null;
  teachingLanguage: string;
  /** Null when the programme is not taught in English and asks for no English certificate. */
  english: EnglishRequirement | null;
  /** Shown when `english` is null: what the page says instead of a certificate rule. */
  englishNote?: string;
  /** The university's own English exam, open to applicants without a certificate. */
  ownEnglishTest: string | null;
  foundation: Foundation | null;
  entranceExam: string | null;
  applicationWindow: string;
  durationYears: number | null;
  highlights: string[];
  sources: SourceLink[];
}

/**
 * Official reference rates, used only to compare tuition with a budget set in
 * dollars. Prices are always shown in the currency the university publishes.
 */
export const EXCHANGE_RATES_SOURCE: SourceLink[] = [
  {
    label: "ECB euro reference rates, 18.09.2026",
    url: "https://www.ecb.europa.eu/stats/eurofxref/eurofxref-daily.xml",
  },
  {
    label: "Нацбанк Казахстана, 19.09.2026",
    url: "https://nationalbank.kz/rss/get_rates.cfm?fdate=19.09.2026",
  },
  {
    label: "ЦБ Узбекистана, 18.09.2026",
    url: "https://cbu.uz/ru/arkhiv-kursov-valyut/json/USD/",
  },
];

const ECB_PER_EUR = { USD: 1.146, CZK: 24.339, HUF: 364.28, PLN: 4.3635, TRY: 55.9077, KRW: 1590.76 };

const UNITS_PER_USD: Record<Currency, number> = {
  USD: 1,
  EUR: 1 / ECB_PER_EUR.USD,
  CZK: ECB_PER_EUR.CZK / ECB_PER_EUR.USD,
  HUF: ECB_PER_EUR.HUF / ECB_PER_EUR.USD,
  PLN: ECB_PER_EUR.PLN / ECB_PER_EUR.USD,
  TRY: ECB_PER_EUR.TRY / ECB_PER_EUR.USD,
  KRW: ECB_PER_EUR.KRW / ECB_PER_EUR.USD,
  KZT: 446.56,
  UZS: 11833.37,
};

/** Approximate yearly tuition in USD, for the budget filter only. */
export function annualTuitionUsd(tuition: Tuition): number {
  const perYear = tuition.period === "semester" ? tuition.amount * 2 : tuition.amount;
  return Math.round(perYear / UNITS_PER_USD[tuition.currency]);
}

const STIPENDIUM_HUNGARICUM_COVERS =
  "обучение, стипендия 43 700 HUF в месяц, общежитие или 40 000 HUF на жильё, медстраховка";

// Türkiye Bursları places students across Turkish universities, so it can
// fund a METU place but never promises one.
const TURKIYE_BURSLARI: FullFunding = {
  name: "Türkiye Bursları",
  covers: "обучение, стипендия, общежитие, медстраховка, год турецкого языка и перелёт",
  eligibility: "до 21 года, средний балл аттестата от 70%; вуз назначает стипендия, METU не гарантирован",
  awardedToAllAdmitted: false,
};

const METU_ENGLISH: EnglishRequirement = {
  accepts: ["toefl"],
  minimum: "TOEFL iBT 75 или экзамен METU EPE 60; IELTS не принимают",
};

const METU_OWN_TEST = "экзамен METU EPE, при неуспехе — год английской подготовки";

const METU_PREP: Foundation = {
  name: "English Preparatory Program, по цене программы",
  accepts: null,
  requirement: "для тех, кто не сдал EPE",
};

const METU_SELECTION = "Отбор по ЕНТ (Казахстан — от 125), ОРТ, SAT, аттестату и другим результатам";

const METU_WINDOW = "1 июня — 12 июля (набор 2026/27); даты 2027 ещё не опубликованы";

const METU_SOURCES: SourceLink[] = [
  {
    label: "METU: tuition fees 2026-2027",
    url: "https://iso.metu.edu.tr/en/system/files/2026-2027_tuition_fees_14092026.pdf",
  },
  { label: "METU: English proficiency", url: "https://iso.metu.edu.tr/en/english-proficiency" },
  { label: "METU: application dates", url: "https://iso.metu.edu.tr/en/application-dates" },
  {
    label: "METU: application requirements",
    url: "https://iso.metu.edu.tr/en/system/files/odtu_iso_requirements.pdf",
  },
  { label: "Türkiye Bursları", url: "https://www.turkiyeburslari.gov.tr/fulltimeprograms" },
];

export const PROGRAMS: readonly Program[] = [
  {
    id: "nu-cs",
    university: "Nazarbayev University",
    programName: "Computer Science",
    country: "Казахстан",
    city: "Астана",
    region: "cis",
    field: "it",
    tuition: {
      amount: 15000,
      currency: "USD",
      period: "year",
      note: "для иностранных студентов",
    },
    fullFunding: {
      name: "Abai Scholarship",
      covers: "обучение, медицинская страховка и ежемесячная стипендия",
      eligibility: "по заслугам, для сильнейших иностранных абитуриентов",
      awardedToAllAdmitted: false,
    },
    teachingLanguage: "Английский",
    english: { accepts: ["ielts", "toefl"], minimum: "IELTS 6.0 (Writing 6.0, остальное 5.5) или TOEFL" },
    ownEnglishTest: null,
    foundation: {
      name: "NU Foundation Year, 12 000 $ в год для иностранцев",
      accepts: ["ielts"],
      requirement: "IELTS от 5.5",
    },
    entranceExam: null,
    applicationWindow: "27 сентября — 17 июля (набор 2026, иностранцам с визой)",
    durationYears: null,
    highlights: [
      "Abai Scholarship для иностранных студентов",
      "Есть Foundation Year для подготовки",
    ],
    sources: [
      {
        label: "NU: international admission",
        url: "https://nu.edu.kz/admissions/international-admission/international-admission_general/",
      },
      {
        label: "NU: regular admissions",
        url: "https://nu.edu.kz/admissions/how-to-apply/foundation-undergraduate/regular-admissions/",
      },
    ],
  },
  {
    id: "bme-cs",
    university: "Budapest University of Technology and Economics (BME)",
    programName: "Computer Science Engineer BSc",
    country: "Венгрия",
    city: "Будапешт",
    region: "europe",
    field: "it",
    tuition: {
      amount: 3200,
      currency: "EUR",
      period: "semester",
      note: "для студентов не из ЕС, 2026/27",
    },
    fullFunding: null,
    teachingLanguage: "Английский",
    english: { accepts: ["ielts", "toefl"], minimum: "IELTS от 5.0 или TOEFL iBT от 72, уровень B2" },
    ownEnglishTest: null,
    foundation: {
      name: "Подготовительная программа BME, 3 200 € за семестр",
      accepts: ["duolingo"],
      requirement: "Duolingo от 60"
    },
    entranceExam: "Онлайн-тест по математике и физике и устное собеседование",
    applicationWindow: "1 апреля — 15 мая (платный набор 2026)",
    durationYears: 3.5,
    highlights: ["Семь семестров на английском", "Есть подготовительная программа"],
    sources: [
      {
        label: "BME: Computer Science Engineer BSc",
        url: "https://xplore.bme.hu/programme/computer-science-engineer-bsc/",
      },
      { label: "BME: tuition fees", url: "https://xplore.bme.hu/tuition-fees/" },
      { label: "BME: admission", url: "https://xplore.bme.hu/admission/" },
    ],
  },
  {
    id: "elte-cs",
    university: "Eötvös Loránd University (ELTE)",
    programName: "BSc Computer Science",
    country: "Венгрия",
    city: "Будапешт",
    region: "europe",
    field: "it",
    tuition: {
      amount: 3200,
      currency: "EUR",
      period: "semester",
      note: "при самостоятельной оплате, набор сентябрь 2026/27",
    },
    fullFunding: {
      name: "Stipendium Hungaricum",
      covers: STIPENDIUM_HUNGARICUM_COVERS,
      eligibility: "гражданам стран-партнёров, среди них Казахстан, Узбекистан и Кыргызстан",
      awardedToAllAdmitted: false,
    },
    teachingLanguage: "Английский",
    english: {
      accepts: "unlisted",
      minimum: "Уровень B2 (страница стипендии) или B1 (страница ELTE), тесты не перечислены",
    },
    ownEnglishTest: null,
    foundation: null,
    entranceExam: "Вступительный экзамен, формат на сайте не описан",
    applicationWindow: "Через Stipendium Hungaricum — до 15 января 2026, 14:00 (набор 2026/27)",
    durationYears: 3,
    highlights: ["Доступна по Stipendium Hungaricum", "Шесть семестров на английском"],
    sources: [
      {
        label: "Stipendium Hungaricum: BSc Computer Science",
        url: "https://apply.stipendiumhungaricum.hu/courses/course/444-bsc-computer-science",
      },
      {
        label: "ELTE: BSc Computer Science",
        url: "https://apply.elte.hu/courses/course/149-bsc-computer-science",
      },
      { label: "Stipendium Hungaricum: о стипендии", url: "https://stipendiumhungaricum.hu/about/" },
    ],
  },
  {
    id: "ctu-fit-informatics",
    university: "Czech Technical University in Prague, FIT",
    programName: "Informatics (Bachelor)",
    country: "Чехия",
    city: "Прага",
    region: "europe",
    field: "it",
    tuition: {
      amount: 64000,
      currency: "CZK",
      period: "semester",
      note: "англоязычная программа, 2026/27",
    },
    fullFunding: null,
    teachingLanguage: "Английский",
    english: {
      accepts: ["ielts", "toefl"],
      minimum: "B2: IELTS от 5.5 или TOEFL iBT от 65, Duolingo нет в списке",
    },
    ownEnglishTest: null,
    foundation: null,
    entranceExam: "Тест по математике в FIT или онлайн-тест SCIO",
    applicationWindow: "1 января — 31 марта (набор 2026)",
    durationYears: 3,
    highlights: ["Шесть специализаций на выбор", "Подготовительные курсы по математике"],
    sources: [
      {
        label: "CTU FIT: admission, bachelor",
        url: "https://fit.cvut.cz/en/applicants/admissions-procedure/bachelor-study-program",
      },
      {
        label: "CTU FIT: tuition fee payment",
        url: "https://fit.cvut.cz/en/studies/study-guide/bachelor-and-master-study-program/tuition-fee-payment",
      },
    ],
  },
  {
    id: "wut-csis",
    university: "Warsaw University of Technology",
    programName: "Computer Science and Information Systems B.Sc.",
    country: "Польша",
    city: "Варшава",
    region: "europe",
    field: "it",
    tuition: {
      amount: 5700,
      currency: "EUR",
      period: "semester",
      note: "для студентов не из ЕС, 2026/27",
    },
    fullFunding: null,
    teachingLanguage: "Английский",
    english: {
      accepts: ["ielts", "toefl"],
      minimum: "IELTS от 6.0 или TOEFL iBT от 87, Duolingo не принимают",
    },
    ownEnglishTest: null,
    foundation: null,
    entranceExam: "Онлайн-собеседование",
    applicationWindow: "11 мая — 21 июля (набор октябрь 2026)",
    durationYears: 3.5,
    highlights: ["Семь семестров на английском", "Факультет математики и информатики"],
    sources: [
      {
        label: "WUT: Computer Science and Information Systems",
        url: "https://www.students.pw.edu.pl/Studies-Offer/B.Sc.-offer/Computer-Science-Information-Systems",
      },
      { label: "WUT: tuition fees", url: "https://ww4.mini.pw.edu.pl/application-process/tuition-fees/" },
      {
        label: "WUT: English proficiency",
        url: "https://www.students.pw.edu.pl/Resources/Application-Glossary/English-Proficiency",
      },
    ],
  },
  {
    id: "semmelweis-md",
    university: "Semmelweis University",
    programName: "General Medicine (MD), на английском",
    country: "Венгрия",
    city: "Будапешт",
    region: "europe",
    field: "medicine",
    tuition: {
      amount: 9340,
      currency: "EUR",
      period: "semester",
      note: "учебный год на странице не указан",
    },
    fullFunding: {
      name: "Stipendium Hungaricum",
      covers: STIPENDIUM_HUNGARICUM_COVERS,
      eligibility: "гражданам стран-партнёров; для Казахстана программа в списке подтверждена",
      awardedToAllAdmitted: false,
    },
    teachingLanguage: "Английский",
    english: { accepts: [], minimum: "Upper-intermediate, проверяют на вступительном экзамене" },
    ownEnglishTest: "английский входит во вступительный экзамен",
    foundation: null,
    entranceExam: "Онлайн-тест: биология, химия, общий и медицинский английский, затем собеседование",
    applicationWindow: "До 31 мая 2027",
    durationYears: 6,
    highlights: ["Двенадцать семестров на английском", "Программа есть в Stipendium Hungaricum"],
    sources: [
      { label: "Semmelweis: General Medicine", url: "https://semmelweis.hu/admission/programs/medicine/" },
      {
        label: "Semmelweis: entrance exam",
        url: "https://semmelweis.hu/admission/process/entrance-exam-medicine-dentistry-and-pharmaceutical-sciences/",
      },
      {
        label: "Stipendium Hungaricum: OTM Medicine",
        url: "https://apply.stipendiumhungaricum.hu/courses/course/1641-otm-medicine",
      },
    ],
  },
  {
    id: "charles-ppe",
    university: "Charles University, Faculty of Social Sciences",
    programName: "Politics, Philosophy and Economics (PPE)",
    country: "Чехия",
    city: "Прага",
    region: "europe",
    field: "humanities",
    tuition: { amount: 7000, currency: "EUR", period: "year", note: "учебный год на странице не указан" },
    fullFunding: null,
    teachingLanguage: "Английский",
    english: {
      accepts: ["ielts", "toefl", "duolingo"],
      minimum: "IELTS 6.5, TOEFL iBT 83 или Duolingo 120",
    },
    ownEnglishTest: null,
    foundation: null,
    entranceExam: null,
    applicationWindow: "Ранний срок 28 февраля 2027, основной — 30 апреля 2027",
    durationYears: 3,
    highlights: ["Построена по модели Oxford PPE", "Отбор по документам, без экзамена"],
    sources: [
      {
        label: "Charles University: PPE",
        url: "https://study.fsv.cuni.cz/study-programs/bachelor-programs/ppe",
      },
      {
        label: "FSV: scholarships and tuition fees",
        url: "https://fsv.cuni.cz/en/study/scholarships-and-tuition-fees",
      },
    ],
  },
  {
    id: "uj-iras",
    university: "Jagiellonian University",
    programName: "International Relations and Area Studies",
    country: "Польша",
    city: "Краков",
    region: "europe",
    field: "humanities",
    tuition: {
      amount: 5000,
      currency: "EUR",
      period: "year",
      note: "по карточке набора 2026; на странице кафедры указано 4 500 €",
    },
    fullFunding: null,
    teachingLanguage: "Английский",
    english: { accepts: [], minimum: "Сертификат не обязателен, язык проверяют на собеседовании" },
    ownEnglishTest: "онлайн-собеседование на английском",
    foundation: null,
    entranceExam: "Онлайн-собеседование на английском — 100% оценки",
    applicationWindow: "Раунды 2026: 23 февраля — 9 марта, 31 марта — 11 мая, 11 июня — 31 августа",
    durationYears: 3,
    highlights: ["Сертификат по английскому не обязателен", "Шесть семестров на английском"],
    sources: [
      {
        label: "UJ: IRAS, набор 2026",
        url: "https://irk.uj.edu.pl/en-gb/offer/IiJM_C_26/programme/intern.rela.area.stud_s1s_C_en/",
      },
      { label: "IRAS: fees", url: "https://iras.uj.edu.pl/admissions/fees" },
      { label: "IRAS: entry requirements", url: "https://iras.uj.edu.pl/admissions/entry-requirements" },
    ],
  },
  {
    id: "metu-ceng",
    university: "Middle East Technical University (METU)",
    programName: "Computer Engineering",
    country: "Турция",
    city: "Анкара",
    region: "asia",
    field: "it",
    tuition: {
      amount: 1200,
      currency: "USD",
      period: "semester",
      note: "для иностранных студентов, 2026/27",
    },
    fullFunding: TURKIYE_BURSLARI,
    teachingLanguage: "Английский",
    english: METU_ENGLISH,
    ownEnglishTest: METU_OWN_TEST,
    foundation: METU_PREP,
    entranceExam: METU_SELECTION,
    applicationWindow: METU_WINDOW,
    durationYears: null,
    highlights: ["Для подачи сертификат не обязателен", "Отдельные места для иностранцев"],
    sources: METU_SOURCES,
  },
  {
    id: "metu-econ",
    university: "Middle East Technical University (METU)",
    programName: "Economics",
    country: "Турция",
    city: "Анкара",
    region: "asia",
    field: "business",
    tuition: {
      amount: 800,
      currency: "USD",
      period: "semester",
      note: "для иностранных студентов, 2026/27",
    },
    fullFunding: TURKIYE_BURSLARI,
    teachingLanguage: "Английский",
    english: METU_ENGLISH,
    ownEnglishTest: METU_OWN_TEST,
    foundation: METU_PREP,
    entranceExam: METU_SELECTION,
    applicationWindow: METU_WINDOW,
    durationYears: null,
    highlights: ["Для подачи сертификат не обязателен", "Отдельные места для иностранцев"],
    sources: METU_SOURCES,
  },
  {
    id: "kaist-undergrad",
    university: "KAIST",
    programName: "Бакалавриат: Computer Science и другие (выбор на втором курсе)",
    country: "Южная Корея",
    city: "Тэджон",
    region: "asia",
    field: "it",
    tuition: {
      amount: 3433000,
      currency: "KRW",
      period: "semester",
      note: "учебный год на странице не указан",
    },
    fullFunding: {
      name: "KAIST Scholarship",
      covers: "полное обучение на восемь семестров, 350 000 KRW в месяц и медстраховка",
      eligibility: "всем зачисленным иностранным студентам при среднем балле в KAIST выше 2.7 из 4.3",
      awardedToAllAdmitted: true,
    },
    teachingLanguage: "Английский",
    english: {
      accepts: ["ielts", "toefl"],
      minimum: "Рекомендуется TOEFL iBT 83 или IELTS 6.5; Duolingo не принимают",
    },
    ownEnglishTest: null,
    foundation: null,
    entranceExam: "Нужен академический результат: SAT, ACT, AP, IB, A-Level или национальный экзамен",
    applicationWindow:
      "Ранний раунд 22 сентября — 22 октября 2026, основной 10 ноября 2026 — 14 января 2027",
    durationYears: null,
    highlights: ["Стипендия всем зачисленным иностранцам", "Специальность выбирают на втором курсе"],
    sources: [
      {
        label: "KAIST: Admissions Guide 2027",
        url: "https://admission.kaist.ac.kr/wz/api/common/files/view/intl-undergraduate/pdf/Admissions_Guide_for_2027_admission.pdf",
      },
      {
        label: "KAIST: timeline",
        url: "https://admission.kaist.ac.kr/intl-undergraduate/application/ApplicationGuide/ApplicationTimeline",
      },
      {
        label: "KAIST: cost of attendance",
        url: "https://admission.kaist.ac.kr/intl-undergraduate/support/coa",
      },
      {
        label: "KAIST: scholarship",
        url: "https://admission.kaist.ac.kr/intl-undergraduate/support/scholarships/kaist",
      },
    ],
  },
  {
    id: "aitu-se",
    university: "Astana IT University",
    programName: "Software Engineering",
    country: "Казахстан",
    city: "Астана",
    region: "cis",
    field: "it",
    tuition: { amount: 2500000, currency: "KZT", period: "year", note: "2026/27" },
    fullFunding: {
      name: "Государственный грант РК",
      covers: "обучение",
      eligibility: "гражданам Казахстана по баллам ЕНТ",
      awardedToAllAdmitted: false,
    },
    teachingLanguage: "Английский",
    english: null,
    englishNote: "Сертификат не указан в условиях поступления; отбор — ЕНТ и тест AET",
    ownEnglishTest: null,
    foundation: null,
    entranceExam: "ЕНТ (платное место — от 70 баллов) и собственный тест AITU Excellence Test",
    applicationWindow: "20 июня — 25 августа (набор 2026)",
    durationYears: 3,
    highlights: ["Обучение на английском", "Три года обучения"],
    sources: [
      { label: "AITU: bachelor", url: "https://astanait.edu.kz/en/bachelor" },
      { label: "AITU: how to apply", url: "https://astanait.edu.kz/en/how-to-apply" },
    ],
  },
  {
    id: "inha-socie",
    university: "Inha University in Tashkent",
    programName: "Computer Science and Engineering (SOCIE)",
    country: "Узбекистан",
    city: "Ташкент",
    region: "cis",
    field: "it",
    tuition: {
      amount: 4000,
      currency: "USD",
      period: "year",
      note: "для иностранцев, 2026/27; сумма может меняться",
    },
    fullFunding: null,
    teachingLanguage: "Английский",
    english: { accepts: ["ielts", "toefl"], minimum: "IELTS от 5.0 или TOEFL iBT от 50" },
    ownEnglishTest: null,
    foundation: {
      name: "Pre-University",
      accepts: null,
      requirement: "итоговый экзамен Pre-University даёт право на зачисление, стоимость уточняйте",
    },
    entranceExam: "Собственный тест: 21 задача по математике и 9 по физике за 60 минут",
    applicationWindow: "Сессии экзамена 2026: 18–19 апреля, 27–28 июня, 1–2 августа",
    durationYears: null,
    highlights: ["Корейская программа в Ташкенте", "Есть Pre-University"],
    sources: [
      { label: "IUT: tuitions", url: "https://inha.uz/prospective-students/admissions/tuitions/" },
      {
        label: "IUT: application guideline",
        url: "https://inha.uz/prospective-students/admissions/application-guideline/",
      },
    ],
  },
  {
    id: "asu-cs",
    university: "Arizona State University",
    programName: "Computer Science, BS",
    country: "США",
    city: "Темпе, Аризона",
    region: "usa",
    field: "it",
    tuition: {
      amount: 39062,
      currency: "USD",
      period: "year",
      note: "базовая стоимость для иностранцев, 2026/27",
    },
    fullFunding: null,
    teachingLanguage: "Английский",
    english: {
      accepts: ["ielts", "toefl", "duolingo"],
      minimum: "IELTS 6.0, TOEFL iBT 61 или Duolingo 95",
    },
    ownEnglishTest: null,
    foundation: null,
    entranceExam: null,
    applicationWindow:
      "Приоритетный срок на осень 2026 был 15 января 2026; на весну 2027 — 1 ноября 2026",
    durationYears: null,
    highlights: ["SAT и ACT не требуются", "120 кредитных часов, кампус Tempe"],
    sources: [
      {
        label: "ASU: Computer Science, BS",
        url: "https://degrees.asu.edu/bachelors/major/ASU00/ESCSEBS/computer-science",
      },
      { label: "ASU: international cost", url: "https://admission.asu.edu/cost-aid/international" },
      {
        label: "ASU: English proficiency",
        url: "https://admission.asu.edu/apply/international/undergrad/english-proficiency",
      },
      {
        label: "ASU: first-year international",
        url: "https://admission.asu.edu/apply/international/first-year",
      },
    ],
  },
  {
    id: "mit-course-6-3",
    university: "Massachusetts Institute of Technology (MIT)",
    programName: "Computer Science and Engineering (Course 6-3)",
    country: "США",
    city: "Кембридж, Массачусетс",
    region: "usa",
    field: "it",
    tuition: { amount: 66720, currency: "USD", period: "year", note: "2026/27" },
    fullFunding: {
      name: "MIT Financial Aid",
      covers:
        "100% подтверждённой финансовой потребности; при доходе семьи до 200 000 $ обучение обычно бесплатно",
      eligibility: "по доходу семьи, в том числе иностранцам; приём need-blind",
      awardedToAllAdmitted: false,
    },
    teachingLanguage: "Английский",
    english: {
      accepts: ["ielts", "toefl", "duolingo"],
      minimum: "Минимум IELTS 7, TOEFL iBT 90 или Duolingo 120",
    },
    ownEnglishTest: null,
    foundation: null,
    entranceExam: "SAT или ACT обязательны",
    applicationWindow: "Early Action — до 1 ноября, Regular Action — до 4 января",
    durationYears: null,
    highlights: ["Приём need-blind и для иностранцев", "Покрывают 100% финансовой потребности"],
    sources: [
      {
        label: "MIT SFS: international students",
        url: "https://sfs.mit.edu/undergraduate-students/apply-for-aid/international/",
      },
      {
        label: "MIT: need-blind admissions",
        url: "https://mitadmissions.org/help/faq/need-blind-admissions/",
      },
      { label: "MIT: tests and scores", url: "https://mitadmissions.org/apply/firstyear/tests-scores/" },
      {
        label: "MIT: deadlines",
        url: "https://mitadmissions.org/apply/firstyear/deadlines-requirements/",
      },
      {
        label: "MIT: Course 6-3",
        url: "https://catalog.mit.edu/degree-charts/computer-science-engineering-course-6-3/",
      },
    ],
  },
];
