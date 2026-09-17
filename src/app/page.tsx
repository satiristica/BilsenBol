const journeySteps = [
  {
    number: "01",
    title: "Заполните профиль",
    description:
      "Укажите свои цели, сильные стороны, бюджет и важные ограничения.",
  },
  {
    number: "02",
    title: "Найдите подходящие варианты",
    description:
      "Получите понятные рекомендации и сравните программы по важным для вас критериям.",
  },
  {
    number: "03",
    title: "Следуйте дорожной карте",
    description:
      "Превратите свой выбор в конкретные этапы, следующие действия и видимый прогресс.",
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
            BilsenBol поможет абитуриентам и студентам из стран СНГ превратить
            свой профиль и цели в понятные рекомендации, удобное сравнение
            программ и персональную дорожную карту поступления.
          </p>
          <a className="primary-action" href="#journey">
            Посмотреть, как это работает
            <span aria-hidden="true">→</span>
          </a>
        </div>

        <aside className="preview-card" aria-label="Пример пути поступления">
          <div className="preview-header">
            <span>Ваш путь</span>
            <span>0% выполнено</span>
          </div>
          <div className="progress-track" aria-hidden="true">
            <span />
          </div>
          <div className="preview-content">
            <span className="preview-step">Первый шаг</span>
            <h2>Расскажите, на каком этапе вы сейчас</h2>
            <p>
              Ваш профиль станет основой для каждой рекомендации и всех
              обновлений дорожной карты.
            </p>
            <div className="preview-meta">
              <span>Профиль</span>
              <span>Следующий этап</span>
            </div>
          </div>
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
        <span>Первая версия продукта</span>
      </footer>
    </main>
  );
}
