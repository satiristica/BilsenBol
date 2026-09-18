import {
  CheckCircle2,
  Compass,
  Cpu,
  FileCheck,
  Globe2,
  GitBranch,
  Languages,
  Layers,
  ListChecks,
  type LucideIcon,
  Route,
  ShieldCheck,
  Sparkles,
  Trophy,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { ActionLink } from "@/components/ActionButton";
import { BrandMark } from "@/components/BrandMark";
import { LivingBackground } from "@/components/LivingBackground";
import { Reveal } from "@/components/Reveal";
import { PROFILE_PRESETS } from "@/domain/profile";

const PRESET_ICONS: Record<string, LucideIcon> = {
  "grant-ace": Trophy,
  "it-mid-budget": Cpu,
  "foundation-path": Languages,
};

const PRESET_DESCRIPTIONS: Record<string, string> = {
  "grant-ace": "GPA 4.9 · IELTS · 100% гранты в ЕС/США",
  "it-mid-budget": "IT-направления · До $8 000/год · Европа и Азия",
  "foundation-path": "Без сертификата · До $3 000/год · Языковой путь",
};

const journeySteps = [
  {
    number: "01",
    title: "Профиль и бюджет",
    caption: "6 коротких вопросов за 2 минуты: класс, средний балл, английский и финансовые рамки семьи.",
    image: "/images/step-profile.jpg",
    imageAlt: "Рука заполняет анкету за столом",
  },
  {
    number: "02",
    title: "Честный подбор",
    caption: "Только программы, в которые вы проходите по жестким критериям, с прозрачным скорингом 0–100.",
    image: "/images/step-match.jpg",
    imageAlt: "Студент идёт между книжными стеллажами",
  },
  {
    number: "03",
    title: "Интерактивное древо",
    caption: "Динамический граф задач по сезонам (Осень, Зима, Весна) с дедлайнами и экспортом в PDF.",
    image: "/images/step-plan.jpg",
    imageAlt: "Студенты вместе работают за ноутбуком",
  },
] as const;

const keyFeatures = [
  {
    icon: GitBranch,
    title: "Интерактивное древо",
    text: "Динамический граф поступления с ветками сезонов, узелками дедлайнов и прямым чек-листом готовности.",
  },
  {
    icon: Layers,
    title: "Прозрачный скоринг",
    text: "Каждая программа оценивается по 100-балльной шкале с открытыми факторами совпадения и рисками.",
  },
  {
    icon: Compass,
    title: "Сравнение лицом к лицу",
    text: "Сопоставляйте программы по 10 параметрам: стипендии, стоимость жизни, окна подачи и экзамены.",
  },
  {
    icon: FileCheck,
    title: "PDF-экспорт чеклиста",
    text: "Сохраняйте готовую дорожную карту для печати и совместного обсуждения с семьёй.",
  },
];

export default function HomePage() {
  return (
    <>
      <LivingBackground />

      <main className="landing">
        <header className="site-header">
          <Link className="brand" href="/" aria-label="Главная BilsenBol">
            <BrandMark />
            <span>BilsenBol</span>
          </Link>
          <span className="status-pill">Личный маршрут 2026</span>
        </header>

        <section className="hero" id="top">
          <div className="hero-copy">
            <p className="eyebrow rise-in">Персональный образовательный маршрут</p>
            <h1 className="rise-in" style={{ "--delay": "90ms" } as React.CSSProperties}>
              Поступление в вуз за рубежом.{" "}
              <span className="accent-word">Понятный маршрут шаг за шагом.</span>
            </h1>
            <p
              className="hero-description rise-in"
              style={{ "--delay": "180ms" } as React.CSSProperties}
            >
              Подберите реальные программы под ваш бюджет и балл, разберите узкие места и получите интерактивное древо задач по сезонам. Без выдуманных шансов и скрытых платежей.
            </p>
            <div
              className="hero-actions rise-in"
              style={{ "--delay": "260ms" } as React.CSSProperties}
            >
              <ActionLink href="/journey" withArrow>
                Построить маршрут
              </ActionLink>
              <ActionLink href="/journey?step=recommendations" variant="ghost">
                Смотреть программы
              </ActionLink>
            </div>

            <div
              className="trust-strip rise-in"
              style={{ "--delay": "300ms" } as React.CSSProperties}
            >
              <div className="trust-item">
                <span className="trust-icon" aria-hidden="true"><ShieldCheck size={16} strokeWidth={2.4} /></span>
                <span>15 проверенных программ</span>
              </div>
              <div className="trust-item">
                <span className="trust-icon" aria-hidden="true"><Globe2 size={16} strokeWidth={2.4} /></span>
                <span>8 стран мира</span>
              </div>
              <div className="trust-item">
                <span className="trust-icon" aria-hidden="true"><CheckCircle2 size={16} strokeWidth={2.4} /></span>
                <span>100% официальные данные</span>
              </div>
            </div>

            <div
              className="quick-start rise-in"
              style={{ "--delay": "340ms" } as React.CSSProperties}
            >
              <p className="quick-start-label" id="presets-title">
                <Sparkles aria-hidden="true" size={14} strokeWidth={2.4} />
                Готовые пресеты в один клик
              </p>
              <ul aria-labelledby="presets-title" className="preset-chips">
                {PROFILE_PRESETS.map((preset) => {
                  const Icon = PRESET_ICONS[preset.id] ?? Sparkles;
                  const desc = PRESET_DESCRIPTIONS[preset.id];
                  return (
                    <li key={preset.id}>
                      <Link className="preset-chip-rich" href={`/journey?preset=${preset.id}`}>
                        <span className="preset-head">
                          <Icon aria-hidden="true" size={16} strokeWidth={2.2} />
                          {preset.title}
                        </span>
                        {desc ? <span className="preset-desc">{desc}</span> : null}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          <div
            className="hero-visual rise-in"
            style={{ "--delay": "220ms" } as React.CSSProperties}
          >
            <div className="hero-photo">
              <Image
                alt="Школьники обсуждают поступление за ноутбуками"
                fill
                priority
                sizes="(min-width: 900px) 46vw, 100vw"
                src="/images/hero-students.jpg"
              />
            </div>
            <div className="float-badge float-badge-top" aria-hidden="true">
              <span className="float-badge-icon">
                <ListChecks size={18} strokeWidth={2.4} />
              </span>
              Подборка под профиль
            </div>
            <div className="float-badge float-badge-bottom" aria-hidden="true">
              <span className="float-badge-icon float-badge-icon-warm">
                <Route size={18} strokeWidth={2.4} />
              </span>
              Интерактивное древо
            </div>
          </div>
        </section>

        <section className="features-section" aria-labelledby="features-title">
          <Reveal className="section-heading">
            <p className="eyebrow">Преимущества платформы</p>
            <h2 id="features-title">Точный компас абитуриента</h2>
          </Reveal>
          <div className="features-grid">
            {keyFeatures.map((feat, index) => {
              const Icon = feat.icon;
              return (
                <Reveal delay={index * 90} key={feat.title}>
                  <div className="feature-card">
                    <span className="feature-icon" aria-hidden="true">
                      <Icon size={22} strokeWidth={2.2} />
                    </span>
                    <h3 className="feature-title">{feat.title}</h3>
                    <p className="feature-text">{feat.text}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </section>

        <section className="journey" id="journey" aria-labelledby="journey-title">
          <Reveal className="section-heading">
            <p className="eyebrow">Как это работает</p>
            <h2 id="journey-title">Три шага к вашей цели</h2>
          </Reveal>
          <div className="journey-grid">
            {journeySteps.map((step, index) => (
              <Reveal delay={index * 110} key={step.number}>
                <article className="journey-card">
                  <div className="journey-photo">
                    <Image
                      alt={step.imageAlt}
                      fill
                      sizes="(min-width: 900px) 33vw, 100vw"
                      src={step.image}
                    />
                    <span className="journey-number">{step.number}</span>
                  </div>
                  <div className="journey-body">
                    <h3>{step.title}</h3>
                    <p>{step.caption}</p>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </section>

        <section className="cta-section">
          <Reveal>
            <div className="cta-card">
              <h2 className="cta-title">Начните свой маршрут поступления прямо сейчас</h2>
              <p className="cta-text">
                Ответьте на 6 вопросов анкеты и получите персонализированную стратегию поступления, подборку подходящих программ и чек-лист задач по сезонам.
              </p>
              <ActionLink href="/journey" withArrow>
                Построить мой маршрут
              </ActionLink>
            </div>
          </Reveal>
        </section>

        <footer className="site-footer">
          <strong>BilsenBol</strong>
          <span className="footer-note">Данные программ с официальных сайтов университетов 2026</span>
        </footer>
      </main>
    </>
  );
}
