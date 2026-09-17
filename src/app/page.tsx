import Link from "next/link";

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

export default function HomePage() {
  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="Главная BilsenBol">
          <span className="brand-mark" aria-hidden="true">
            B
          </span>
          <span>BilsenBol</span>
        </a>
        <span className="status-pill">Первая версия</span>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="eyebrow">Понятный путь в университет</p>
          <h1>Поймите, куда поступать. Знайте, что делать дальше.</h1>
          <p className="hero-description">
            BilsenBol помогает школьникам 9–11 классов и выпускникам из стран СНГ
            превратить свой профиль и цели в понятные рекомендации, сравнение программ
            и персональную дорожную карту поступления.
          </p>
          <div className="hero-actions">
            <Link className="primary-action" href="/journey">
              Построить мой маршрут
              <span aria-hidden="true">→</span>
            </Link>
            <a className="secondary-action" href="#journey">
              Как это работает
            </a>
          </div>
        </div>

        <aside className="preview-card" aria-labelledby="presets-title">
          <div className="preview-header">
            <span id="presets-title">Быстрый старт</span>
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
        <div className="section-heading">
          <p className="eyebrow">Единый маршрут</p>
          <h2 id="journey-title">От сомнений — к понятному плану</h2>
        </div>
        <div className="journey-grid">
          {journeySteps.map((step) => (
            <article className="journey-card" key={step.number}>
              <span>{step.number}</span>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </article>
          ))}
        </div>
      </section>

      <footer>
        <span>BilsenBol</span>
        <span>Демо-данные каталога программ</span>
      </footer>
    </main>
  );
}
