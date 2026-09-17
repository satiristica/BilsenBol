import Link from "next/link";

import { ActionLink } from "@/components/ActionButton";
import { Reveal } from "@/components/Reveal";
import { DEMO_PROGRAMS } from "@/data/programs";
import { PROFILE_PRESETS } from "@/domain/profile";

const journeySteps = [
  {
    number: "01",
    title: "Заполните профиль",
    description:
      "Класс, средний балл, английский, бюджет и направление — шесть простых ответов.",
  },
  {
    number: "02",
    title: "Получите разбор и подборку",
    description:
      "Честная диагностика профиля и программы, которые проходят ваши обязательные условия.",
  },
  {
    number: "03",
    title: "Следуйте дорожной карте",
    description:
      "План по сезонам, одно ближайшее действие и растущая шкала готовности.",
  },
] as const;

const heroStats = [
  { value: `${DEMO_PROGRAMS.length}`, label: "программ в каталоге" },
  { value: "4", label: "шага до плана" },
  { value: "0", label: "выдуманных вероятностей" },
] as const;

export default function HomePage() {
  return (
    <main>
      <div aria-hidden="true" className="aurora">
        <span />
        <span />
        <span />
      </div>

      <header className="site-header">
        <Link className="brand" href="/" aria-label="Главная BilsenBol">
          <span className="brand-mark" aria-hidden="true">
            B
          </span>
          <span>BilsenBol</span>
        </Link>
        <span className="status-pill">Первая версия</span>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="eyebrow rise-in">Понятный путь в университет</p>
          <h1 className="rise-in" style={{ "--delay": "90ms" } as React.CSSProperties}>
            Поймите, куда поступать.{" "}
            <span className="accent-word">Знайте, что дальше.</span>
          </h1>
          <p
            className="hero-description rise-in"
            style={{ "--delay": "180ms" } as React.CSSProperties}
          >
            BilsenBol помогает школьникам 9–11 классов и выпускникам из стран СНГ
            превратить свой профиль и цели в понятные рекомендации, сравнение программ
            и персональную дорожную карту поступления.
          </p>
          <div
            className="hero-actions rise-in"
            style={{ "--delay": "260ms" } as React.CSSProperties}
          >
            <ActionLink href="/journey" withArrow>
              Построить мой маршрут
            </ActionLink>
            <ActionLink href="#journey" variant="ghost">
              Как это работает
            </ActionLink>
          </div>
          <ul
            className="hero-stats rise-in"
            style={{ "--delay": "340ms" } as React.CSSProperties}
          >
            {heroStats.map((stat) => (
              <li key={stat.label}>
                <span className="hero-stat-value">{stat.value}</span>
                <span className="hero-stat-label">{stat.label}</span>
              </li>
            ))}
          </ul>
        </div>

        <aside
          className="preset-panel rise-in"
          aria-labelledby="presets-title"
          style={{ "--delay": "320ms" } as React.CSSProperties}
        >
          <div className="preset-header">
            <strong id="presets-title">Быстрый старт</strong>
            <span>1 клик</span>
          </div>
          <p className="preset-lead">
            Выберите ситуацию, похожую на вашу, — профиль заполнится сам, и сразу
            откроется результат.
          </p>
          <ul className="preset-list">
            {PROFILE_PRESETS.map((preset) => (
              <li key={preset.id}>
                <Link className="preset-card" href={`/journey?preset=${preset.id}`}>
                  <span aria-hidden="true" className="preset-emoji">
                    {preset.emoji}
                  </span>
                  <span className="preset-body">
                    <span className="preset-title">{preset.title}</span>
                    <span className="preset-description">{preset.description}</span>
                  </span>
                  <span aria-hidden="true" className="preset-arrow">
                    →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </aside>
      </section>

      <section className="journey" id="journey" aria-labelledby="journey-title">
        <Reveal className="section-heading">
          <p className="eyebrow">Единый маршрут</p>
          <h2 id="journey-title">От сомнений — к понятному плану</h2>
        </Reveal>
        <div className="journey-grid">
          {journeySteps.map((step, index) => (
            <Reveal delay={index * 110} key={step.number}>
              <article className="journey-card">
                <span className="journey-number">{step.number}</span>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      <footer className="site-footer">
        <strong>BilsenBol</strong>
        <span className="footer-note">Демо-данные каталога программ</span>
      </footer>
    </main>
  );
}
