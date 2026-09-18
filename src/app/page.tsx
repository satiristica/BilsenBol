import { Cpu, Languages, ListChecks, type LucideIcon, Route, Sparkles, Trophy } from "lucide-react";
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

const journeySteps = [
  {
    number: "01",
    title: "Профиль",
    caption: "6 коротких вопросов",
    image: "/images/step-profile.jpg",
    imageAlt: "Рука заполняет анкету за столом",
  },
  {
    number: "02",
    title: "Подборка",
    caption: "Программы под ваши условия",
    image: "/images/step-match.jpg",
    imageAlt: "Студент идёт между книжными стеллажами",
  },
  {
    number: "03",
    title: "План",
    caption: "Шаги по сезонам",
    image: "/images/step-plan.jpg",
    imageAlt: "Студенты вместе работают за ноутбуком",
  },
] as const;

export default function HomePage() {
  return (
    <>
      <LivingBackground />

      <main>
        <header className="site-header">
          <Link className="brand" href="/" aria-label="Главная BilsenBol">
            <BrandMark />
            <span>BilsenBol</span>
          </Link>
          <span className="status-pill">Первая версия</span>
        </header>

        <section className="hero" id="top">
          <div className="hero-copy">
            <p className="eyebrow rise-in">Путь в университет</p>
            <h1 className="rise-in" style={{ "--delay": "90ms" } as React.CSSProperties}>
              Поймите, куда поступать.{" "}
              <span className="accent-word">Знайте, что дальше.</span>
            </h1>
            <p
              className="hero-description rise-in"
              style={{ "--delay": "180ms" } as React.CSSProperties}
            >
              Шесть вопросов — и у вас подборка программ и план поступления.
            </p>
            <div
              className="hero-actions rise-in"
              style={{ "--delay": "260ms" } as React.CSSProperties}
            >
              <ActionLink href="/journey" withArrow>
                Начать
              </ActionLink>
              <ActionLink href="#journey" variant="ghost">
                Как это работает
              </ActionLink>
            </div>

            <div
              className="quick-start rise-in"
              style={{ "--delay": "340ms" } as React.CSSProperties}
            >
              <p className="quick-start-label" id="presets-title">
                <Sparkles aria-hidden="true" size={14} strokeWidth={2.4} />
                Или в один клик
              </p>
              <ul aria-labelledby="presets-title" className="preset-chips">
                {PROFILE_PRESETS.map((preset) => {
                  const Icon = PRESET_ICONS[preset.id] ?? Sparkles;
                  return (
                    <li key={preset.id}>
                      <Link className="preset-chip" href={`/journey?preset=${preset.id}`}>
                        <Icon aria-hidden="true" size={17} strokeWidth={2.2} />
                        {preset.title}
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
              План по сезонам
            </div>
          </div>
        </section>

        <section className="journey" id="journey" aria-labelledby="journey-title">
          <Reveal className="section-heading">
            <p className="eyebrow">Как это работает</p>
            <h2 id="journey-title">Три шага до плана</h2>
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

        <footer className="site-footer">
          <strong>BilsenBol</strong>
          <span className="footer-note">Демо-данные · фото Unsplash</span>
        </footer>
      </main>
    </>
  );
}
