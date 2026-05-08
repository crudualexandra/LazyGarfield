export default function App() {
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
            <span className="hero-badge">TV Series journal</span>
            <h2>Your cinematic watchlist, organized in one place.</h2>
            <p>
              LazyGarfield app for tracking TV
              series directly in the browser.
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
      </main>
    </div>
  );
}