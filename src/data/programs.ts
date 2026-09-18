import type { Region, StudyField } from "@/domain/profile";

/**
 * DEMO CATALOGUE — NOT VERIFIED ADMISSION DATA.
 *
 * Per AGENTS.md section 4 we never publish unsourced admission facts about real
 * institutions. Every entry below is a deliberately fictional institution built
 * to exercise the recommendation rules, and every surface that renders it must
 * show the `Демо-данные` label exported here.
 */
export const DEMO_DATA_NOTICE =
  "Демо-данные: вузы вымышленные, проверяйте требования на сайте вуза.";

export const DEMO_DATA_BADGE = "Демо-данные";

export type TeachingLanguage = "en" | "ru" | "en-ru";

export interface Program {
  id: string;
  university: string;
  programName: string;
  country: string;
  city: string;
  region: Region;
  field: StudyField;
  /** Annual tuition in USD; 0 means the programme is offered on a full grant track. */
  annualTuitionUsd: number;
  hasFullGrant: boolean;
  teachingLanguage: TeachingLanguage;
  /** Minimum five-point school average the programme expects. */
  minGpa: number;
  requiresEnglishCertificate: boolean;
  hasFoundationYear: boolean;
  /** Whether a graduate of an 11-year CIS school can enrol without a bridging year. */
  acceptsAfterGrade11: boolean;
  applicationWindow: string;
  durationYears: number;
  highlights: string[];
}

export const DEMO_PROGRAMS: readonly Program[] = [
  {
    id: "ca-tech-cs",
    university: "Центрально-Азиатский технологический университет",
    programName: "Компьютерные науки",
    country: "Казахстан",
    city: "Астана",
    region: "cis",
    field: "it",
    annualTuitionUsd: 0,
    hasFullGrant: true,
    teachingLanguage: "en",
    minGpa: 4.6,
    requiresEnglishCertificate: true,
    hasFoundationYear: true,
    acceptsAfterGrade11: true,
    applicationWindow: "Январь — март",
    durationYears: 4,
    highlights: [
      "Полный грант покрывает обучение и общежитие",
      "Год Foundation для тех, кто не добрал язык",
    ],
  },
  {
    id: "innotech-it",
    university: "Университет Иннотех",
    programName: "Программная инженерия",
    country: "Казахстан",
    city: "Алматы",
    region: "cis",
    field: "it",
    annualTuitionUsd: 0,
    hasFullGrant: true,
    teachingLanguage: "ru",
    minGpa: 4.7,
    requiresEnglishCertificate: false,
    hasFoundationYear: false,
    acceptsAfterGrade11: true,
    applicationWindow: "Февраль — апрель",
    durationYears: 4,
    highlights: [
      "Отбор по олимпиадам и вступительному экзамену",
      "Обучение на русском — сертификат не нужен",
    ],
  },
  {
    id: "tashkent-eng",
    university: "Ташкентский политехнический институт",
    programName: "Промышленная инженерия",
    country: "Узбекистан",
    city: "Ташкент",
    region: "cis",
    field: "engineering",
    annualTuitionUsd: 1200,
    hasFullGrant: false,
    teachingLanguage: "ru",
    minGpa: 4,
    requiresEnglishCertificate: false,
    hasFoundationYear: false,
    acceptsAfterGrade11: true,
    applicationWindow: "Май — июль",
    durationYears: 4,
    highlights: [
      "Низкая стоимость и близко к дому",
      "Партнёрские заводы для практики со второго курса",
    ],
  },
  {
    id: "almaty-med",
    university: "Алматинский университет наук о здоровье",
    programName: "Общая медицина",
    country: "Казахстан",
    city: "Алматы",
    region: "cis",
    field: "medicine",
    annualTuitionUsd: 0,
    hasFullGrant: true,
    teachingLanguage: "ru",
    minGpa: 4.8,
    requiresEnglishCertificate: false,
    hasFoundationYear: false,
    acceptsAfterGrade11: true,
    applicationWindow: "Июнь — август",
    durationYears: 6,
    highlights: [
      "Грантовые места по результатам профильных экзаменов",
      "Клиническая практика с третьего курса",
    ],
  },
  {
    id: "prague-it",
    university: "Пражский институт прикладных наук",
    programName: "Информационные системы",
    country: "Чехия",
    city: "Прага",
    region: "europe",
    field: "it",
    annualTuitionUsd: 2200,
    hasFullGrant: false,
    teachingLanguage: "en",
    minGpa: 4.2,
    requiresEnglishCertificate: true,
    hasFoundationYear: true,
    acceptsAfterGrade11: true,
    applicationWindow: "Ноябрь — февраль",
    durationYears: 3,
    highlights: [
      "Недорогая Европа с обучением на английском",
      "Подготовительный год заменяет языковой сертификат",
    ],
  },
  {
    id: "warsaw-business",
    university: "Варшавская школа бизнеса и технологий",
    programName: "Международный бизнес",
    country: "Польша",
    city: "Варшава",
    region: "europe",
    field: "business",
    annualTuitionUsd: 2800,
    hasFullGrant: false,
    teachingLanguage: "en",
    minGpa: 4,
    requiresEnglishCertificate: false,
    hasFoundationYear: true,
    acceptsAfterGrade11: true,
    applicationWindow: "Октябрь — июнь",
    durationYears: 3,
    highlights: [
      "Вместо IELTS — внутреннее языковое собеседование",
      "Длинное окно подачи и несколько наборов",
    ],
  },
  {
    id: "krakow-hum",
    university: "Краковский университет гуманитарных наук",
    programName: "Международные отношения",
    country: "Польша",
    city: "Краков",
    region: "europe",
    field: "humanities",
    annualTuitionUsd: 2400,
    hasFullGrant: false,
    teachingLanguage: "en-ru",
    minGpa: 3.9,
    requiresEnglishCertificate: false,
    hasFoundationYear: true,
    acceptsAfterGrade11: true,
    applicationWindow: "Ноябрь — июль",
    durationYears: 3,
    highlights: [
      "Лояльные требования к среднему баллу",
      "Часть курсов первого года дублируется на русском",
    ],
  },
  {
    id: "berlin-eng",
    university: "Берлинский университет инженерии",
    programName: "Мехатроника",
    country: "Германия",
    city: "Берлин",
    region: "europe",
    field: "engineering",
    annualTuitionUsd: 800,
    hasFullGrant: false,
    teachingLanguage: "en",
    minGpa: 4.7,
    requiresEnglishCertificate: true,
    hasFoundationYear: true,
    acceptsAfterGrade11: false,
    applicationWindow: "Ноябрь — январь",
    durationYears: 4,
    highlights: [
      "Почти бесплатное обучение, оплачивается только семестровый взнос",
      "После 11 класса СНГ требуется подготовительный год",
    ],
  },
  {
    id: "budapest-med",
    university: "Будапештский университет наук о здоровье",
    programName: "Медицина",
    country: "Венгрия",
    city: "Будапешт",
    region: "europe",
    field: "medicine",
    annualTuitionUsd: 7500,
    hasFullGrant: false,
    teachingLanguage: "en",
    minGpa: 4.6,
    requiresEnglishCertificate: true,
    hasFoundationYear: true,
    acceptsAfterGrade11: true,
    applicationWindow: "Декабрь — апрель",
    durationYears: 6,
    highlights: [
      "Диплом признаётся в Евросоюзе",
      "Вступительные экзамены по биологии и химии",
    ],
  },
  {
    id: "istanbul-eng",
    university: "Стамбульский инженерный университет",
    programName: "Компьютерная инженерия",
    country: "Турция",
    city: "Стамбул",
    region: "asia",
    field: "engineering",
    annualTuitionUsd: 0,
    hasFullGrant: true,
    teachingLanguage: "en",
    minGpa: 4.5,
    requiresEnglishCertificate: true,
    hasFoundationYear: true,
    acceptsAfterGrade11: true,
    applicationWindow: "Январь — февраль",
    durationYears: 4,
    highlights: [
      "Стипендия покрывает обучение, жильё и питание",
      "Год подготовки английского внутри университета",
    ],
  },
  {
    id: "kuala-business",
    university: "Университет бизнеса Куала-Лумпура",
    programName: "Бизнес-аналитика",
    country: "Малайзия",
    city: "Куала-Лумпур",
    region: "asia",
    field: "business",
    annualTuitionUsd: 2900,
    hasFullGrant: false,
    teachingLanguage: "en",
    minGpa: 4,
    requiresEnglishCertificate: false,
    hasFoundationYear: true,
    acceptsAfterGrade11: true,
    applicationWindow: "Три набора в год",
    durationYears: 3,
    highlights: [
      "Три набора в год — можно не ждать сентября",
      "Низкая стоимость жизни для студента",
    ],
  },
  {
    id: "singapore-cs",
    university: "Сингапурский институт вычислительных наук",
    programName: "Наука о данных",
    country: "Сингапур",
    city: "Сингапур",
    region: "asia",
    field: "it",
    annualTuitionUsd: 12000,
    hasFullGrant: false,
    teachingLanguage: "en",
    minGpa: 4.7,
    requiresEnglishCertificate: true,
    hasFoundationYear: false,
    acceptsAfterGrade11: true,
    applicationWindow: "Сентябрь — декабрь",
    durationYears: 4,
    highlights: [
      "Сильные связи с технологическими компаниями региона",
      "Оплачиваемая стажировка в программе",
    ],
  },
  {
    id: "midwest-it",
    university: "Университет штата Мидвест",
    programName: "Информатика",
    country: "США",
    city: "Коламбус",
    region: "usa",
    field: "it",
    annualTuitionUsd: 16000,
    hasFullGrant: false,
    teachingLanguage: "en",
    minGpa: 4.5,
    requiresEnglishCertificate: true,
    hasFoundationYear: false,
    acceptsAfterGrade11: true,
    applicationWindow: "Ноябрь — январь",
    durationYears: 4,
    highlights: [
      "Частичные стипендии за академические успехи",
      "Возможность сменить специализацию на втором курсе",
    ],
  },
  {
    id: "hillside-arts",
    university: "Колледж свободных искусств Хиллсайд",
    programName: "Политология и коммуникации",
    country: "США",
    city: "Портленд",
    region: "usa",
    field: "humanities",
    annualTuitionUsd: 0,
    hasFullGrant: true,
    teachingLanguage: "en",
    minGpa: 4.8,
    requiresEnglishCertificate: true,
    hasFoundationYear: false,
    acceptsAfterGrade11: true,
    applicationWindow: "Октябрь — январь",
    durationYears: 4,
    highlights: [
      "Финансовая помощь по потребности вплоть до полной стоимости",
      "Нужны эссе и рекомендательные письма",
    ],
  },
];
