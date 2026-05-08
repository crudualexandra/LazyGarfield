import { useEffect, useMemo, useState } from "react";

const STORAGE_KEYS = {
  series: "lazygarfield_series",
  theme: "lazygarfield_theme",
  filters: "lazygarfield_filters"
};

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
    episodes: [
      createEpisode("Secrets", 1, 1, 5),
      createEpisode("Lies", 1, 2, 4),
      createEpisode("Past and Present", 1, 3, 5)
    ],
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
    episodes: [createEpisode("System", 1, 1, 4), createEpisode("Hands", 1, 2, 5)],
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
    episodes: [
      createEpisode("Welcome to the Playground", 1, 1, 5),
      createEpisode("Some Mysteries Are Better Left Unsolved", 1, 2, 5)
    ],
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
    episodes: [createEpisode("Wednesday's Child Is Full of Woe", 1, 1, 4)],
    isFavorite: false,
    createdAt: new Date().toISOString()
  }
];

const recommendedSeries = [
  {
    id: "rec-1",
    title: "Severance",
    genre: "Sci-Fi",
    rating: 5,
    poster: "🏢",
    note: "Mind-bending mystery"
  },
  {
    id: "rec-2",
    title: "The Last of Us",
    genre: "Drama",
    rating: 5,
    poster: "🌿",
    note: "Emotional survival story"
  },
  {
    id: "rec-3",
    title: "Sherlock",
    genre: "Thriller",
    rating: 4,
    poster: "🔎",
    note: "Smart detective series"
  },
  {
    id: "rec-4",
    title: "House of the Dragon",
    genre: "Fantasy",
    rating: 4,
    poster: "🐉",
    note: "Epic fantasy drama"
  },
  {
    id: "rec-5",
    title: "Stranger Things",
    genre: "Sci-Fi",
    rating: 4,
    poster: "🚲",
    note: "Retro supernatural adventure"
  }
];

const statuses = ["Watching", "Completed", "Plan to Watch", "Dropped"];

const genres = [
  "Drama",
  "Comedy",
  "Sci-Fi",
  "Fantasy",
  "Thriller",
  "Romance",
  "Animation",
  "Documentary"
];

const emptyForm = {
  title: "",
  genre: "Drama",
  status: "Plan to Watch",
  rating: 3,
  seasons: 1,
  description: "",
  poster: "🎬"
};

function createEpisode(title, season, episode, rating = 3) {
  return {
    id: crypto.randomUUID(),
    title,
    season,
    episode,
    rating,
    watched: false,
    createdAt: new Date().toISOString()
  };
}

const emptyEpisodeForm = {
  title: "",
  season: 1,
  episode: 1,
  rating: 3
};

export default function App() {
  const [series, setSeries] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.series);

    if (saved) {
      const parsed = JSON.parse(saved);

      return parsed.map((item) => ({
        ...item,
        episodes: Array.isArray(item.episodes) ? item.episodes : []
      }));
    }

    return demoSeries;
  });

  const [filters, setFilters] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.filters);

    return saved
      ? JSON.parse(saved)
      : {
          search: "",
          status: "All",
          genre: "All"
        };
  });

  const [form, setForm] = useState(emptyForm);
  const [episodeForms, setEpisodeForms] = useState({});
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem(STORAGE_KEYS.theme) || "dark";
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.series, JSON.stringify(series));
  }, [series]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.filters, JSON.stringify(filters));
  }, [filters]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.theme, theme);
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);
  const stats = useMemo(() => {
    const total = series.length;
    const favorites = series.filter((item) => item.isFavorite).length;
    const completed = series.filter((item) => item.status === "Completed").length;
    const totalEpisodes = series.reduce(
      (sum, item) => sum + (item.episodes?.length || 0),
      0
    );

    const watchedEpisodes = series.reduce(
      (sum, item) =>
        sum + (item.episodes || []).filter((episode) => episode.watched).length,
      0
    );
    const average =
      total === 0
        ? 0
        : series.reduce((sum, item) => sum + Number(item.rating), 0) / total;

    return {
      total,
      favorites,
      completed,
      totalEpisodes,
      watchedEpisodes,
      average: average.toFixed(1)
    };
  }, [series]);

  function deleteSeries(id) {
    setSeries((current) => current.filter((item) => item.id !== id));
  }

  function scrollRecommendations(direction) {
    const container = document.querySelector(".recommendations-scroll");

    if (!container) {
      return;
    }

    const scrollAmount = direction === "left" ? -240 : 240;

    container.scrollBy({
      left: scrollAmount,
      behavior: "smooth"
    });
  }

  function handleRecommendationWheel(event) {
    event.preventDefault();
    event.currentTarget.scrollLeft += event.deltaY;
  }

  function toggleFavorite(id) {
    setSeries((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              isFavorite: !item.isFavorite
            }
          : item
      )
    );
  }

  function changeRating(id, rating) {
    setSeries((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              rating: Number(rating)
            }
          : item
      )
    );
  }

  function updateForm(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value
    }));
  }

  const filteredSeries = useMemo(() => {
    return series.filter((item) => {
      const matchesSearch = item.title
        .toLowerCase()
        .includes(filters.search.toLowerCase());

      const matchesStatus =
        filters.status === "All" || item.status === filters.status;

      const matchesGenre = filters.genre === "All" || item.genre === filters.genre;

      return matchesSearch && matchesStatus && matchesGenre;
    });
  }, [series, filters]);

  function resetFilters() {
    setFilters({
      search: "",
      status: "All",
      genre: "All"
    });
  }

  function updateEpisodeForm(seriesId, field, value) {
    setEpisodeForms((current) => ({
      ...current,
      [seriesId]: {
        ...(current[seriesId] || emptyEpisodeForm),
        [field]: value
      }
    }));
  }

  function getEpisodeForm(seriesId) {
    return episodeForms[seriesId] || emptyEpisodeForm;
  }

  function addEpisode(seriesId) {
    const currentForm = getEpisodeForm(seriesId);

    if (!currentForm.title.trim()) {
      alert("Please enter an episode title.");
      return;
    }

    const newEpisode = {
      id: crypto.randomUUID(),
      title: currentForm.title.trim(),
      season: Number(currentForm.season),
      episode: Number(currentForm.episode),
      rating: Number(currentForm.rating),
      watched: true,
      createdAt: new Date().toISOString()
    };

    setSeries((current) =>
      current.map((item) =>
        item.id === seriesId
          ? {
              ...item,
              episodes: [newEpisode, ...(item.episodes || [])]
            }
          : item
      )
    );

    setEpisodeForms((current) => ({
      ...current,
      [seriesId]: emptyEpisodeForm
    }));
  }

  function changeEpisodeRating(seriesId, episodeId, rating) {
    setSeries((current) =>
      current.map((item) =>
        item.id === seriesId
          ? {
              ...item,
              episodes: (item.episodes || []).map((episode) =>
                episode.id === episodeId
                  ? {
                      ...episode,
                      rating: Number(rating)
                    }
                  : episode
              )
            }
          : item
      )
    );
  }

  function toggleEpisodeWatched(seriesId, episodeId) {
    setSeries((current) =>
      current.map((item) =>
        item.id === seriesId
          ? {
              ...item,
              episodes: (item.episodes || []).map((episode) =>
                episode.id === episodeId
                  ? {
                      ...episode,
                      watched: !episode.watched
                    }
                  : episode
              )
            }
          : item
      )
    );
  }

  function deleteEpisode(seriesId, episodeId) {
    setSeries((current) =>
      current.map((item) =>
        item.id === seriesId
          ? {
              ...item,
              episodes: (item.episodes || []).filter(
                (episode) => episode.id !== episodeId
              )
            }
          : item
      )
    );
  }

  function addSeries(event) {
    event.preventDefault();

    if (!form.title.trim()) {
      alert("Please enter a series title.");
      return;
    }

    const newSeries = {
      id: crypto.randomUUID(),
      title: form.title.trim(),
      genre: form.genre,
      status: form.status,
      rating: Number(form.rating),
      seasons: Number(form.seasons),
      description: form.description.trim() || "No description added yet.",
      poster: form.poster.trim() || "🎬",
      episodes: [],
      isFavorite: false,
      createdAt: new Date().toISOString()
    };

    setSeries((current) => [newSeries, ...current]);
    setForm(emptyForm);
  }

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

        <button
          className="theme-toggle"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          {theme === "dark" ? "☀️ Light Mode" : "🌙 Dark Mode"}
        </button>
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

          <div className="hero-panel recommendations-panel">
            <div className="recommendations-header">
              <div>
                <p className="eyebrow">Popular Now</p>
                <h3>Recommended Series</h3>
              </div>

              <div className="recommendation-arrows">
                <button
                  type="button"
                  onClick={() => scrollRecommendations("left")}
                  aria-label="Scroll recommendations left"
                >
                  ←
                </button>

                <button
                  type="button"
                  onClick={() => scrollRecommendations("right")}
                  aria-label="Scroll recommendations right"
                >
                  →
                </button>
              </div>
            </div>

            <div
              className="recommendations-scroll"
              onWheel={handleRecommendationWheel}
            >
              {recommendedSeries.map((item) => (
                <div className="recommendation-card" key={item.id}>
                  <div className="recommendation-poster">{item.poster}</div>

                  <div className="recommendation-info">
                    <h4>{item.title}</h4>
                    <p>{item.note}</p>

                    <div className="recommendation-meta">
                      <span>{item.genre}</span>
                      <span>{"★".repeat(item.rating)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <p className="recommendations-note">Sample series</p>
          </div>
        </section>
        <section className="stats-grid" aria-label="Series statistics">
          <StatCard label="Total Series" value={stats.total} />
          <StatCard label="Favorites" value={stats.favorites} />
          <StatCard label="Completed" value={stats.completed} />
          <StatCard label="Total Episodes" value={stats.totalEpisodes} />
          <StatCard label="Watched Episodes" value={stats.watchedEpisodes} />
          <StatCard label="Average Rating" value={`${stats.average}/5`} />
        </section>

        <section className="filters-section" aria-label="Search and filters">
          <div className="section-title">
            <div>
              <p className="eyebrow">Search and filters</p>
              <h2>Find your next episode mood</h2>
            </div>
          </div>

          <div className="filters-grid">
            <label>
              Search title
              <input
                type="text"
                value={filters.search}
                onChange={(event) =>
                  setFilters((current) => ({
                    ...current,
                    search: event.target.value
                  }))
                }
                placeholder="Search by title..."
              />
            </label>

            <label>
              Status
              <select
                value={filters.status}
                onChange={(event) =>
                  setFilters((current) => ({
                    ...current,
                    status: event.target.value
                  }))
                }
              >
                <option value="All">All</option>
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Genre
              <select
                value={filters.genre}
                onChange={(event) =>
                  setFilters((current) => ({
                    ...current,
                    genre: event.target.value
                  }))
                }
              >
                <option value="All">All</option>
                {genres.map((genre) => (
                  <option key={genre} value={genre}>
                    {genre}
                  </option>
                ))}
              </select>
            </label>

            <button type="button" className="reset-button" onClick={resetFilters}>
              Reset Filters
            </button>
          </div>
        </section>

        <section className="library-section">
          <div className="section-title row-title">
            <div>
              <p className="eyebrow">Series library</p>
              <h2>Your tracked shows</h2>
            </div>
            <p className="result-count">
              Showing {filteredSeries.length} of {series.length}
            </p>
          </div>

          {filteredSeries.length === 0 ? (
            <div className="empty-state">
              <div>📺</div>
              <h3>No series found</h3>
              <p>
                Add a new series or reset the filters to see your full library.
              </p>
            </div>
          ) : (
            <div className="series-grid">
              {filteredSeries.map((item) => {
                const episodeForm = getEpisodeForm(item.id);

                return (
                  <article className="series-card" key={item.id}>
                    <div className="poster">{item.poster}</div>

                    <div className="card-content">
                      <div className="card-top">
                        <div>
                          <h3>{item.title}</h3>
                          <p>{item.description}</p>
                        </div>

                        <button
                          type="button"
                          className={`favorite-button${item.isFavorite ? " active" : ""}`}
                          onClick={() => toggleFavorite(item.id)}
                          aria-label={
                            item.isFavorite ? "Unfavorite series" : "Favorite series"
                          }
                        >
                          {item.isFavorite ? "♥" : "♡"}
                        </button>
                      </div>

                      <div className="meta-row">
                        <span>{item.genre}</span>
                        <span>{item.status}</span>
                        <span>{item.seasons} seasons</span>
                        <span>{item.episodes?.length || 0} episodes</span>
                      </div>

                      <div className="rating-row">
                        <label>
                          Series rating
                          <select
                            value={item.rating}
                            onChange={(event) => changeRating(item.id, event.target.value)}
                          >
                            {[1, 2, 3, 4, 5].map((rating) => (
                              <option key={rating} value={rating}>
                                {rating}/5
                              </option>
                            ))}
                          </select>
                        </label>

                        <div className="stars">
                          {"★".repeat(item.rating)}
                          {"☆".repeat(5 - item.rating)}
                        </div>
                      </div>

                      <div className="episodes-box">
                        <div className="episodes-header">
                          <h4>Episodes</h4>
                          <span>{item.episodes?.length || 0} saved</span>
                        </div>

                        <div className="episode-form">
                          <input
                            type="text"
                            placeholder="Episode title"
                            value={episodeForm.title}
                            onChange={(event) =>
                              updateEpisodeForm(item.id, "title", event.target.value)
                            }
                          />

                          <input
                            type="number"
                            min="1"
                            placeholder="S"
                            value={episodeForm.season}
                            onChange={(event) =>
                              updateEpisodeForm(item.id, "season", event.target.value)
                            }
                          />

                          <input
                            type="number"
                            min="1"
                            placeholder="E"
                            value={episodeForm.episode}
                            onChange={(event) =>
                              updateEpisodeForm(item.id, "episode", event.target.value)
                            }
                          />

                          <select
                            value={episodeForm.rating}
                            onChange={(event) =>
                              updateEpisodeForm(item.id, "rating", event.target.value)
                            }
                          >
                            {[1, 2, 3, 4, 5].map((rating) => (
                              <option key={rating} value={rating}>
                                {rating}/5
                              </option>
                            ))}
                          </select>

                          <button
                            type="button"
                            className="add-episode-button"
                            onClick={() => addEpisode(item.id)}
                          >
                            Add
                          </button>
                        </div>

                        {(item.episodes || []).length === 0 ? (
                          <p className="episode-empty">No episodes rated yet.</p>
                        ) : (
                          <div className="episode-list">
                            {(item.episodes || []).map((episode) => (
                              <div className="episode-item" key={episode.id}>
                                <div>
                                  <strong>{episode.title}</strong>
                                  <span>
                                    S{episode.season} · E{episode.episode}
                                  </span>
                                </div>

                                <div className="episode-actions">
                                  <button
                                    type="button"
                                    className={`watched-button ${
                                      episode.watched ? "active" : ""
                                    }`}
                                    onClick={() =>
                                      toggleEpisodeWatched(item.id, episode.id)
                                    }
                                  >
                                    {episode.watched ? "Watched" : "Unwatched"}
                                  </button>

                                  <select
                                    value={episode.rating}
                                    onChange={(event) =>
                                      changeEpisodeRating(
                                        item.id,
                                        episode.id,
                                        event.target.value
                                      )
                                    }
                                  >
                                    {[1, 2, 3, 4, 5].map((rating) => (
                                      <option key={rating} value={rating}>
                                        {rating}/5
                                      </option>
                                    ))}
                                  </select>

                                  <button
                                    type="button"
                                    className="mini-delete-button"
                                    onClick={() => deleteEpisode(item.id, episode.id)}
                                  >
                                    ×
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <button
                        type="button"
                        className="delete-button"
                        onClick={() => deleteSeries(item.id)}
                      >
                        Delete Series
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <section id="add-series" className="form-section">
          <div className="section-title">
            <p className="eyebrow">Add new series</p>
            <h2>Expand your LazyGarfield</h2>
          </div>

          <form className="series-form" onSubmit={addSeries}>
            <label>
              Title
              <input
                type="text"
                placeholder="Example: Stranger Things"
                value={form.title}
                onChange={(event) => updateForm("title", event.target.value)}
              />
            </label>

            <label>
              Poster emoji/icon
              <input
                type="text"
                maxLength="4"
                value={form.poster}
                onChange={(event) => updateForm("poster", event.target.value)}
              />
            </label>

            <label>
              Genre
              <select
                value={form.genre}
                onChange={(event) => updateForm("genre", event.target.value)}
              >
                {genres.map((genre) => (
                  <option key={genre}>{genre}</option>
                ))}
              </select>
            </label>

            <label>
              Status
              <select
                value={form.status}
                onChange={(event) => updateForm("status", event.target.value)}
              >
                {statuses.map((status) => (
                  <option key={status}>{status}</option>
                ))}
              </select>
            </label>

            <label>
              Rating
              <select
                value={form.rating}
                onChange={(event) => updateForm("rating", event.target.value)}
              >
                {[1, 2, 3, 4, 5].map((rating) => (
                  <option key={rating} value={rating}>
                    {rating}/5
                  </option>
                ))}
              </select>
            </label>

            <label>
              Seasons
              <input
                type="number"
                min="1"
                value={form.seasons}
                onChange={(event) => updateForm("seasons", event.target.value)}
              />
            </label>

            <label className="full-field">
              Description
              <textarea
                rows="4"
                placeholder="Short description..."
                value={form.description}
                onChange={(event) => updateForm("description", event.target.value)}
              />
            </label>

            <button className="submit-button" type="submit">
              Add Series
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}
function StatCard({ label, value }) {
  return (
    <div className="stat-card">
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}
