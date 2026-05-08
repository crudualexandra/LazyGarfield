import { useState } from "react";

const demoSeries = [
  {
    id: crypto.randomUUID(),
    title: "Dark",
    genre: "Sci-Fi",
    status: "Completed",
    rating: 5,
    seasons: 3,
    description: "A mind-bending mystery about time, family secrets, and consequences.",
    poster: "🕰️",
    isFavorite: true,
    createdAt: new Date().toISOString()
  },
  {
    id: crypto.randomUUID(),
    title: "The Bear",
    genre: "Drama",
    status: "Watching",
    rating: 4,
    seasons: 3,
    description: "A tense, emotional story about food, pressure, and family.",
    poster: "🍽️",
    isFavorite: false,
    createdAt: new Date().toISOString()
  },
  {
    id: crypto.randomUUID(),
    title: "Arcane",
    genre: "Animation",
    status: "Plan to Watch",
    rating: 5,
    seasons: 1,
    description: "A visually rich animated series with strong characters and conflict.",
    poster: "⚡",
    isFavorite: true,
    createdAt: new Date().toISOString()
  },
  {
    id: crypto.randomUUID(),
    title: "Wednesday",
    genre: "Fantasy",
    status: "Watching",
    rating: 4,
    seasons: 1,
    description: "A gothic mystery series with dark humor and supernatural style.",
    poster: "🖤",
    isFavorite: false,
    createdAt: new Date().toISOString()
  }
];

export default function App() {
  const [series] = useState(demoSeries);

  return (
    <div className="app-shell">
      <header className="site-header">
        <div>
          <p className="eyebrow">Personal TV tracking dashboard</p>
          <h1>LazyGarfield</h1>
          <p className="slogan">
            Track what you watch, love, finish, drop, and plan to start next.
          </p>
        </div>
      </header>

      <main>
        <section className="hero-section">
          <div className="hero-content">
            <span className="hero-badge">TV Series Personal Journal</span>
            <h2>Your cinematic watchlist, organized in one place.</h2>
            <p>
              LazyGarfield is an app where users can
              manage series directly in the browser.
            </p>
          </div>

          <div className="hero-panel">
            <div className="poster-stack">
              <span>🕰️</span>
              <span>⚡</span>
              <span>🖤</span>
            </div>
            <p>Build your personal series archive.</p>
          </div>
        </section>

        <section className="library-section">
          <div className="section-title row-title">
            <div>
              <p className="eyebrow">Series library</p>
              <h2>Your tracked shows</h2>
            </div>
            <p className="result-count">Showing {series.length}</p>
          </div>

          <div className="series-grid">
            {series.map((item) => (
              <article className="series-card" key={item.id}>
                <div className="poster">{item.poster}</div>

                <div className="card-content">
                  <div className="card-top">
                    <div>
                      <h3>{item.title}</h3>
                      <p>{item.description}</p>
                    </div>
                  </div>

                  <div className="meta-row">
                    <span>{item.genre}</span>
                    <span>{item.status}</span>
                    <span>{item.seasons} seasons</span>
                  </div>

                  <div className="stars">
                    {"★".repeat(item.rating)}
                    {"☆".repeat(5 - item.rating)}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}