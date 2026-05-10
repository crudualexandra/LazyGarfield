import { useEffect, useMemo, useState } from "react";
import mascotImage from "./mascot1.png";
import mascotAddImage from "./mascot2.png";

const STORAGE_KEYS = {
  series: "lazygarfield_series",
  theme: "lazygarfield_theme",
  filters: "lazygarfield_filters",
  page: "lazygarfield_page",
  apiMode: "lazygarfield_api_mode"
};

const API_BASE_URL = "http://localhost:4000";

const demoSeries = [
  {
    id: crypto.randomUUID(),
    title: "Dark",
    genres: ["Sci-Fi", "Thriller"],
    status: "Completed",
    rating: 5,
    seasons: 3,
    description:
      "A mind-bending mystery about time, family secrets, and consequences.",
    poster: "🕰️",
    episodes: [],
    isFavorite: true,
    createdAt: new Date().toISOString()
  },
  {
    id: crypto.randomUUID(),
    title: "Gossip Girl",
    genres: ["Drama", "Romance"],
    status: "Completed",
    rating: 4,
    seasons: 6,
    description:
      "A glossy teen drama about friendships, rivalries, and secrets on the Upper East Side.",
    poster: "💋",
    episodes: [],
    isFavorite: false,
    createdAt: new Date().toISOString()
  },
  {
    id: crypto.randomUUID(),
    title: "The Crown",
    genres: ["Drama", "Documentary"],
    status: "Completed",
    rating: 4,
    seasons: 6,
    description:
      "A royal historical drama tracing the reign of Queen Elizabeth II and the politics around the crown.",
    poster: "👑",
    episodes: [],
    isFavorite: false,
    createdAt: new Date().toISOString()
  },
  {
    id: crypto.randomUUID(),
    title: "The Queen's Gambit",
    genres: ["Drama"],
    status: "Completed",
    rating: 5,
    seasons: 1,
    description:
      "A stylish, character-driven drama following a chess prodigy navigating ambition, addiction, and fame.",
    poster: "♟️",
    episodes: [],
    isFavorite: true,
    createdAt: new Date().toISOString()
  },
  {
    id: crypto.randomUUID(),
    title: "Game of Thrones",
    genres: ["Fantasy", "Drama"],
    status: "Completed",
    rating: 5,
    seasons: 8,
    description:
      "A sprawling fantasy epic of rival houses, shifting alliances, and power games across Westeros.",
    poster: "🐉",
    episodes: [],
    isFavorite: true,
    createdAt: new Date().toISOString()
  },
  {
    id: crypto.randomUUID(),
    title: "The Vampire Diaries",
    genres: ["Fantasy", "Romance"],
    status: "Completed",
    rating: 4,
    seasons: 8,
    description:
      "A supernatural romance packed with small-town mysteries, rivalries, and centuries-old secrets.",
    poster: "🩸",
    episodes: [],
    isFavorite: false,
    createdAt: new Date().toISOString()
  },
  {
    id: crypto.randomUUID(),
    title: "Sherlock",
    genres: ["Thriller", "Drama"],
    status: "Completed",
    rating: 5,
    seasons: 4,
    description:
      "A modern detective thriller with sharp cases, fast dialogue, and iconic partnership dynamics.",
    poster: "🔎",
    episodes: [],
    isFavorite: true,
    createdAt: new Date().toISOString()
  },
  {
    id: crypto.randomUUID(),
    title: "House of Cards",
    genres: ["Drama", "Thriller"],
    status: "Completed",
    rating: 4,
    seasons: 1,
    description:
      "A sharp political thriller about power, loyalty, and manipulation. Only one season watched so far.",
    poster: "🏛️",
    episodes: [],
    isFavorite: false,
    createdAt: new Date().toISOString()
  },
  {
    id: crypto.randomUUID(),
    title: "Black Mirror",
    genres: ["Sci-Fi", "Thriller"],
    status: "Completed",
    rating: 5,
    seasons: 6,
    description:
      "A dark anthology of tech-driven what-ifs that feel uncomfortably close to real life.",
    poster: "🪞",
    episodes: [],
    isFavorite: true,
    createdAt: new Date().toISOString()
  },
  {
    id: crypto.randomUUID(),
    title: "Severance",
    genres: ["Sci-Fi", "Thriller"],
    status: "Plan to Watch",
    rating: 5,
    seasons: 2,
    description:
      "A stylish corporate mystery where work and personal memories are split, and nothing is as it seems.",
    poster: "🏢",
    episodes: [],
    isFavorite: false,
    createdAt: new Date().toISOString()
  },
  {
    id: crypto.randomUUID(),
    title: "The Last of Us",
    genres: ["Drama", "Thriller"],
    status: "Plan to Watch",
    rating: 5,
    seasons: 2,
    description:
      "A tense survival drama about found family and hard choices in a world changed forever.",
    poster: "🌿",
    episodes: [],
    isFavorite: false,
    createdAt: new Date().toISOString()
  },
  {
    id: crypto.randomUUID(),
    title: "Stranger Things",
    genres: ["Sci-Fi", "Fantasy"],
    status: "Plan to Watch",
    rating: 4,
    seasons: 4,
    description:
      "A nostalgic supernatural adventure mixing small-town mystery, friendship, and otherworldly threats.",
    poster: "🚲",
    episodes: [],
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
  genres: ["Drama"],
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

function clampRating(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return 3;
  }

  return Math.min(5, Math.max(1, number));
}

function renderStars(rating) {
  const safeRating = clampRating(rating);
  return "★".repeat(safeRating) + "☆".repeat(5 - safeRating);
}

function isImagePoster(value) {
  if (!value || typeof value !== "string") {
    return false;
  }

  return (
    value.startsWith("/") ||
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.endsWith(".png") ||
    value.endsWith(".jpg") ||
    value.endsWith(".jpeg") ||
    value.endsWith(".webp")
  );
}

function normalizeSeriesItem(item) {
  return {
    ...item,
    genres: Array.isArray(item.genres)
      ? item.genres
      : item.genre
        ? [item.genre]
        : ["Drama"],
    episodes: Array.isArray(item.episodes) ? item.episodes : [],
    rating: clampRating(item.rating),
    seasons: Number(item.seasons || 1),
    isFavorite: Boolean(item.isFavorite),
    description: item.description || "No description added yet.",
    poster: item.poster || "🎬",
    createdAt: item.createdAt || new Date().toISOString()
  };
}

export default function App() {
  const [apiToken, setApiToken] = useState("");
  const [apiStatus, setApiStatus] = useState("");
  const [isApiLoading, setIsApiLoading] = useState(false);
  const [apiMode, setApiMode] = useState(() => {
    return localStorage.getItem(STORAGE_KEYS.apiMode) === "true";
  });
  const [hasAutoLoadedApi, setHasAutoLoadedApi] = useState(false);

  const [authToken, setAuthToken] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [authMode, setAuthMode] = useState("login");
  const [authMessage, setAuthMessage] = useState("");
  const [authForm, setAuthForm] = useState({
    name: "",
    email: "",
    password: ""
  });

  async function getApiToken() {
    try {
      setIsApiLoading(true);

      const response = await fetch(`${API_BASE_URL}/token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          role: "ADMIN",
          permissions: ["READ", "WRITE", "DELETE"]
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not generate JWT token");
      }

      setApiToken(data.token);
      setApiMode(true);
      setApiStatus("Connected to backend API. Token expires in 1 minute.");

      return data.token;
    } catch (error) {
      setApiStatus(error.message);
      return "";
    } finally {
      setIsApiLoading(false);
    }
  }

  async function getValidApiToken() {
    if (apiToken) {
      return apiToken;
    }

    return await getApiToken();
  }

  async function apiRequest(endpoint, options = {}) {
    let token = await getValidApiToken();

    if (!token) {
      throw new Error("No API token available");
    }

    const makeRequest = async (jwtToken) => {
      return fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwtToken}`,
          ...(options.headers || {})
        }
      });
    };

    let response = await makeRequest(token);
    let data = await response.json().catch(() => ({}));

    if (response.status === 401) {
      const freshToken = await getApiToken();

      if (!freshToken) {
        throw new Error("Token expired and could not be refreshed");
      }

      response = await makeRequest(freshToken);
      data = await response.json().catch(() => ({}));
    }

    if (!response.ok) {
      throw new Error(data.message || "API request failed");
    }

    return data;
  }

  async function loadSeriesFromApi() {
    try {
      setIsApiLoading(true);

      const data = await apiRequest("/api/series?limit=100&skip=0");

      setSeries((data.data || []).map(normalizeSeriesItem));
      setApiMode(true);
      setApiStatus(`Loaded ${data.data?.length || 0} series from backend API.`);
    } catch (error) {
      setApiStatus(error.message);
    } finally {
      setIsApiLoading(false);
    }
  }

  async function connectToApi() {
    const token = await getApiToken();

    if (token) {
      setApiMode(true);
      await loadSeriesFromApi();
    }
  }

  function disconnectFromApi() {
    setApiMode(false);
    setApiToken("");
    setApiStatus("Switched to local mode. The app is using localStorage fallback.");
    setHasAutoLoadedApi(false);
  }

  function updateAuthForm(field, value) {
    setAuthForm((current) => ({
      ...current,
      [field]: value
    }));
  }

  async function loginUser(event) {
    event.preventDefault();

    try {
      setAuthMessage("");

      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: authForm.email,
          password: authForm.password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      setAuthToken(data.token);
      setApiToken(data.token);
      setCurrentUser(data.user);
      setApiMode(true);
      setAuthMessage(`Logged in as ${data.user.name}`);
      setApiStatus(`Authenticated as ${data.user.role}.`);
      setActivePage("dashboard");
    } catch (error) {
      setAuthMessage(error.message);
    }
  }

  async function registerUser(event) {
    event.preventDefault();

    try {
      setAuthMessage("");

      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: authForm.name,
          email: authForm.email,
          password: authForm.password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      setAuthToken(data.token);
      setApiToken(data.token);
      setCurrentUser(data.user);
      setApiMode(true);
      setAuthMessage(`Account created for ${data.user.name}`);
      setApiStatus(`Authenticated as ${data.user.role}.`);
      setActivePage("dashboard");
    } catch (error) {
      setAuthMessage(error.message);
    }
  }

  function logoutUser() {
    setAuthToken("");
    setApiToken("");
    setCurrentUser(null);
    setApiMode(false);
    setAuthMessage("Logged out successfully.");
    setApiStatus("Logged out. Local mode is available as fallback.");
    setActivePage("auth");
  }

  const [series, setSeries] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.series);

    if (saved) {
      const parsed = JSON.parse(saved);

      return parsed.map(normalizeSeriesItem);
    }

    return demoSeries.map(normalizeSeriesItem);
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

  const [activePage, setActivePage] = useState(() => {
    return localStorage.getItem(STORAGE_KEYS.page) || "dashboard";
  });

  const isAuthenticated = Boolean(authToken && currentUser);
  const isAdmin = currentUser?.role === "ADMIN";
  const visiblePage = !isAuthenticated
    ? "auth"
    : !isAdmin && activePage === "add"
      ? "dashboard"
      : activePage;

  const [selectedSeriesId, setSelectedSeriesId] = useState(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.apiMode, String(apiMode));
  }, [apiMode]);

  useEffect(() => {
    if (!apiMode || hasAutoLoadedApi || authToken) {
      return;
    }

    async function autoConnectToApi() {
      try {
        setHasAutoLoadedApi(true);
        setIsApiLoading(true);

        const token = await getApiToken();

        if (!token) {
          return;
        }

        const data = await apiRequest("/api/series?limit=100&skip=0");

        setSeries((data.data || []).map(normalizeSeriesItem));
        setApiStatus(`Auto-loaded ${data.data?.length || 0} series from backend API.`);
      } catch (error) {
        setApiStatus(error.message);
      } finally {
        setIsApiLoading(false);
      }
    }

    autoConnectToApi();
  }, [apiMode, hasAutoLoadedApi, authToken]);

  useEffect(() => {
    if (!apiMode) {
      localStorage.setItem(STORAGE_KEYS.series, JSON.stringify(series));
    }
  }, [series, apiMode]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.filters, JSON.stringify(filters));
  }, [filters]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.page, activePage);
  }, [activePage]);

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

  async function saveUpdatedSeries(
    updatedSeries,
    successMessage = "Series updated through backend API."
  ) {
    if (!apiMode) {
      return normalizeSeriesItem(updatedSeries);
    }

    const savedSeries = await apiRequest(`/api/series/${updatedSeries.id}`, {
      method: "PUT",
      body: JSON.stringify(updatedSeries)
    });

    setApiStatus(successMessage);

    return normalizeSeriesItem(savedSeries);
  }

  function replaceSeriesInState(updatedSeries) {
    setSeries((current) =>
      current.map((item) =>
        item.id === updatedSeries.id ? normalizeSeriesItem(updatedSeries) : item
      )
    );
  }

  async function deleteSeries(id) {
    try {
      if (apiMode) {
        await apiRequest(`/api/series/${id}`, {
          method: "DELETE"
        });

        setApiStatus("Series deleted through backend API.");
      }

      setSeries((current) => current.filter((item) => item.id !== id));

      if (selectedSeriesId === id) {
        closeSeriesDetails();
      }
    } catch (error) {
      setApiStatus(error.message);
      alert(error.message);
    }
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

  async function toggleFavorite(id) {
    const currentSeries = series.find((item) => item.id === id);

    if (!currentSeries) {
      return;
    }

    const updatedSeries = {
      ...currentSeries,
      isFavorite: !currentSeries.isFavorite
    };

    try {
      if (apiMode) {
        const savedSeries = await saveUpdatedSeries(
          updatedSeries,
          "Favorite updated through backend API."
        );
        replaceSeriesInState(savedSeries);
        return;
      }

      replaceSeriesInState(updatedSeries);
    } catch (error) {
      setApiStatus(error.message);
      alert(error.message);
    }
  }

  async function changeRating(id, rating) {
    const currentSeries = series.find((item) => item.id === id);

    if (!currentSeries) {
      return;
    }

    const updatedSeries = {
      ...currentSeries,
      rating: clampRating(rating)
    };

    try {
      if (apiMode) {
        const savedSeries = await saveUpdatedSeries(
          updatedSeries,
          "Series rating updated through backend API."
        );
        replaceSeriesInState(savedSeries);
        return;
      }

      replaceSeriesInState(updatedSeries);
    } catch (error) {
      setApiStatus(error.message);
      alert(error.message);
    }
  }

  function openSeriesDetails(id) {
    setSelectedSeriesId(id);
  }

  function closeSeriesDetails() {
    setSelectedSeriesId(null);
  }

  const selectedSeries = series.find((item) => item.id === selectedSeriesId);
  const selectedEpisodeForm = selectedSeries
    ? getEpisodeForm(selectedSeries.id)
    : emptyEpisodeForm;

  function updateForm(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value
    }));
  }

  function toggleFormGenre(genre) {
    setForm((current) => {
      const alreadySelected = current.genres.includes(genre);

      return {
        ...current,
        genres: alreadySelected
          ? current.genres.filter((item) => item !== genre)
          : [...current.genres, genre]
      };
    });
  }

  const filteredSeries = useMemo(() => {
    return series.filter((item) => {
      const matchesSearch = item.title
        .toLowerCase()
        .includes(filters.search.toLowerCase());

      const matchesStatus =
        filters.status === "All" || item.status === filters.status;

      const itemGenres = Array.isArray(item.genres)
        ? item.genres
        : item.genre
          ? [item.genre]
          : [];

      const matchesGenre =
        filters.genre === "All" || itemGenres.includes(filters.genre);

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

  async function addEpisode(seriesId) {
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
      rating: clampRating(currentForm.rating),
      watched: true,
      createdAt: new Date().toISOString()
    };

    const currentSeries = series.find((item) => item.id === seriesId);

    if (!currentSeries) {
      return;
    }

    const updatedSeries = {
      ...currentSeries,
      episodes: [newEpisode, ...(currentSeries.episodes || [])]
    };

    try {
      if (apiMode) {
        const savedSeries = await saveUpdatedSeries(
          updatedSeries,
          "Episode added through backend API."
        );
        replaceSeriesInState(savedSeries);
      } else {
        replaceSeriesInState(updatedSeries);
      }

      setEpisodeForms((current) => ({
        ...current,
        [seriesId]: emptyEpisodeForm
      }));
    } catch (error) {
      setApiStatus(error.message);
      alert(error.message);
    }
  }

  async function changeEpisodeRating(seriesId, episodeId, rating) {
    const currentSeries = series.find((item) => item.id === seriesId);

    if (!currentSeries) {
      return;
    }

    const updatedSeries = {
      ...currentSeries,
      episodes: (currentSeries.episodes || []).map((episode) =>
        episode.id === episodeId
          ? {
              ...episode,
              rating: clampRating(rating)
            }
          : episode
      )
    };

    try {
      if (apiMode) {
        const savedSeries = await saveUpdatedSeries(
          updatedSeries,
          "Episode rating updated through backend API."
        );
        replaceSeriesInState(savedSeries);
        return;
      }

      replaceSeriesInState(updatedSeries);
    } catch (error) {
      setApiStatus(error.message);
      alert(error.message);
    }
  }

  async function toggleEpisodeWatched(seriesId, episodeId) {
    const currentSeries = series.find((item) => item.id === seriesId);

    if (!currentSeries) {
      return;
    }

    const updatedSeries = {
      ...currentSeries,
      episodes: (currentSeries.episodes || []).map((episode) =>
        episode.id === episodeId
          ? {
              ...episode,
              watched: !episode.watched
            }
          : episode
      )
    };

    try {
      if (apiMode) {
        const savedSeries = await saveUpdatedSeries(
          updatedSeries,
          "Episode watch status updated through backend API."
        );
        replaceSeriesInState(savedSeries);
        return;
      }

      replaceSeriesInState(updatedSeries);
    } catch (error) {
      setApiStatus(error.message);
      alert(error.message);
    }
  }

  async function deleteEpisode(seriesId, episodeId) {
    const currentSeries = series.find((item) => item.id === seriesId);

    if (!currentSeries) {
      return;
    }

    const updatedSeries = {
      ...currentSeries,
      episodes: (currentSeries.episodes || []).filter(
        (episode) => episode.id !== episodeId
      )
    };

    try {
      if (apiMode) {
        const savedSeries = await saveUpdatedSeries(
          updatedSeries,
          "Episode deleted through backend API."
        );
        replaceSeriesInState(savedSeries);
        return;
      }

      replaceSeriesInState(updatedSeries);
    } catch (error) {
      setApiStatus(error.message);
      alert(error.message);
    }
  }

  async function addSeries(event) {
    event.preventDefault();

    if (!form.title.trim()) {
      alert("Please enter a series title.");
      return;
    }

    if (!Array.isArray(form.genres) || form.genres.length === 0) {
      alert("Please select at least one genre.");
      return;
    }

    const newSeries = {
      id: crypto.randomUUID(),
      title: form.title.trim(),
      genres: form.genres,
      status: form.status,
      rating: clampRating(form.rating),
      seasons: Number(form.seasons),
      description: form.description.trim() || "No description added yet.",
      poster: form.poster.trim() || "🎬",
      episodes: [],
      isFavorite: false,
      createdAt: new Date().toISOString()
    };

    if (apiMode) {
      try {
        const createdSeries = await apiRequest("/api/series", {
          method: "POST",
          body: JSON.stringify(newSeries)
        });

        setSeries((current) => [normalizeSeriesItem(createdSeries), ...current]);
        setApiStatus("Series created through backend API.");
        setForm(emptyForm);
      } catch (error) {
        setApiStatus(error.message);
        alert(error.message);
      }

      return;
    }

    setSeries((current) => [newSeries, ...current]);
    setForm(emptyForm);
  }

  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="brand-block">
          <img
            src={mascotImage}
            alt="LazyGarfield mascot"
            className="topbar-mascot"
          />

          <div className="brand-text">
            <p className="eyebrow">Personal TV tracking dashboard</p>
            <h1>LazyGarfield</h1>
            <p className="slogan">
              Track what you watch, love, finish, drop, and plan to start next.
            </p>
          </div>
        </div>

        <button
          className="theme-toggle"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          {theme === "dark" ? "☀️ " : "🌙 "}
        </button>
      </header>

      <div className="app-layout">
        <aside className="sidebar">
          <div className="sidebar-card">
            <p className="eyebrow">Menu</p>

            <nav className="sidebar-nav" aria-label="Sidebar navigation">
              {!isAuthenticated ? (
                <button
                  className={
                    activePage === "auth" ? "sidebar-link active" : "sidebar-link"
                  }
                  onClick={() => setActivePage("auth")}
                >
                  <span>👤</span>
                  Account
                </button>
              ) : (
                <>
                  <button
                    className={
                      activePage === "dashboard"
                        ? "sidebar-link active"
                        : "sidebar-link"
                    }
                    onClick={() => setActivePage("dashboard")}
                  >
                    <span>🏠</span>
                    Dashboard
                  </button>

                  <button
                    className={
                      activePage === "library"
                        ? "sidebar-link active"
                        : "sidebar-link"
                    }
                    onClick={() => setActivePage("library")}
                  >
                    <span>📚</span>
                    Library
                  </button>

                  {isAdmin && (
                    <button
                      className={
                        activePage === "add"
                          ? "sidebar-link active"
                          : "sidebar-link"
                      }
                      onClick={() => setActivePage("add")}
                    >
                      <span>➕</span>
                      Add Series
                    </button>
                  )}

                  <button
                    className={
                      activePage === "insights"
                        ? "sidebar-link active"
                        : "sidebar-link"
                    }
                    onClick={() => setActivePage("insights")}
                  >
                    <span>📊</span>
                    Insights
                  </button>

                  <button
                    className={
                      activePage === "auth" ? "sidebar-link active" : "sidebar-link"
                    }
                    onClick={() => setActivePage("auth")}
                  >
                    <span>👤</span>
                    Account
                  </button>
                </>
              )}
            </nav>
          </div>
        </aside>

        <main className="page-content">
        {visiblePage === "dashboard" && (
          <>
            <section className="hero-section">
              <div className="hero-content">
                <span className="hero-badge">TV Series Personal Journal</span>
                <h2>Your cinematic watchlist, organized in one place.</h2>
                <p>
                  LazyGarfield is a client-side only React app where users can manage
                  series, filter by status or genre, rate shows, mark favorites, rate
                  individual episodes, and keep everything saved locally in the
                  browser.
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
                          <span>{renderStars(item.rating)}</span>
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
          </>
        )}

        {visiblePage === "library" && (
          <>
            <section className="filters-section" aria-label="Search and filters">
              <div className="section-title">
                <div>
                  <p className="eyebrow">Search and filters</p>
                  
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

                <button
                  type="button"
                  className="reset-button"
                  onClick={resetFilters}
                >
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
                    return (
                      <article className="series-card" key={item.id}>
                        <PosterDisplay poster={item.poster} className="poster" />

                        <div className="card-content">
                          <div className="card-top">
                            <div>
                              <h3>{item.title}</h3>
                              <p>{item.description}</p>
                            </div>

                            <button
                              type="button"
                              className={`favorite-button${
                                item.isFavorite ? " active" : ""
                              }`}
                              onClick={() => toggleFavorite(item.id)}
                              aria-label={
                                item.isFavorite
                                  ? "Unfavorite series"
                                  : "Favorite series"
                              }
                            >
                              {item.isFavorite ? "♥" : "♡"}
                            </button>
                          </div>

                          <div className="meta-row">
                            {(item.genres || []).map((genre) => (
                              <span key={genre}>{genre}</span>
                            ))}
                            <span>{item.status}</span>
                            <span>{item.seasons} seasons</span>
                            <span>{item.episodes?.length || 0} episodes</span>
                          </div>

                          <div className="compact-rating">
                            <span>
                              {renderStars(item.rating)}
                            </span>
                            <strong>{item.rating}/5</strong>
                          </div>

                          <button
                            type="button"
                            className="details-toggle-button"
                            onClick={() => openSeriesDetails(item.id)}
                          >
                            View Details
                          </button>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>
          </>
        )}

        {visiblePage === "add" && (
          <>
            <div className="add-page-layout">
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

                  <div className="genre-picker full-field">
                    <span>Genres</span>
                    <p className="genre-helper">
                      Select one or more genres that match this series.
                    </p>

                    <div className="genre-chip-grid">
                      {genres.map((genre) => (
                        <button
                          key={genre}
                          type="button"
                          className={
                            form.genres.includes(genre)
                              ? "genre-chip active"
                              : "genre-chip"
                          }
                          onClick={() => toggleFormGenre(genre)}
                        >
                          {genre}
                        </button>
                      ))}
                    </div>
                  </div>

                  <label className="full-field">
                    Description
                    <textarea
                      rows="4"
                      placeholder="Short description..."
                      value={form.description}
                      onChange={(event) =>
                        updateForm("description", event.target.value)
                      }
                    />
                  </label>

                  <button className="submit-button" type="submit">
                    Add Series
                  </button>
                </form>
              </section>

              <aside className="add-help-panel">
                <p className="eyebrow">Guide</p>
                <h3>How to organize your library</h3>

                <img
                  src={mascotAddImage}
                  alt="LazyGarfield guide mascot"
                  className="add-page-mascot"
                />

                <ul>
                  <li>Use status to separate current shows from future plans.</li>
                  <li>Add a rating after you watch enough episodes.</li>
                  <li>Use favorites for shows you want to recommend.</li>
                </ul>

                
              </aside>
            </div>
          </>
        )}

        {visiblePage === "insights" && (
          <section className="insights-section">
            <div className="section-title">
              <p className="eyebrow">Insights</p>
              <h2>Your watching activity</h2>
              <p className="insights-description">
                A quick overview of your personal LazyGarfield library, based only
                on data saved in your browser.
              </p>
            </div>

            <div className="insights-grid">
              <div className="insight-card">
                <span>📺</span>
                <h3>{stats.total}</h3>
                <p>Total tracked series</p>
              </div>

              <div className="insight-card">
                <span>♥</span>
                <h3>{stats.favorites}</h3>
                <p>Favorite series</p>
              </div>

              <div className="insight-card">
                <span>✅</span>
                <h3>{stats.completed}</h3>
                <p>Completed series</p>
              </div>

              <div className="insight-card">
                <span>★</span>
                <h3>{stats.average}/5</h3>
                <p>Average series rating</p>
              </div>

              <div className="insight-card">
                <span>🎞️</span>
                <h3>{stats.totalEpisodes}</h3>
                <p>Total rated episodes</p>
              </div>

              <div className="insight-card">
                <span>👀</span>
                <h3>{stats.watchedEpisodes}</h3>
                <p>Watched episodes</p>
              </div>
            </div>

            <section className="api-panel">
              <div className="section-title">
                <p className="eyebrow">Backend API</p>
                <h2>Lab 7 Full Integration</h2>
                <p className="insights-description">
                  LazyGarfield can connect to the protected Express API and load the series library using JWT authorization.
                </p>
              </div>

              <div className="api-actions">
                <button
                  className="submit-button"
                  type="button"
                  onClick={connectToApi}
                  disabled={isApiLoading}
                >
                  {isApiLoading ? "Connecting..." : "Connect to Backend API"}
                </button>

                <button
                  className="details-toggle-button"
                  type="button"
                  onClick={loadSeriesFromApi}
                  disabled={isApiLoading || !apiMode}
                >
                  Reload Series from API
                </button>

                <button
                  className="details-toggle-button"
                  type="button"
                  onClick={disconnectFromApi}
                >
                  Switch to Local Mode
                </button>
              </div>

              {apiStatus && <p className="api-message">{apiStatus}</p>}

              {apiMode && (
                <p className="api-message">
                  API mode is active. Series data is loaded from the backend.
                </p>
              )}
            </section>
          </section>
        )}

        {visiblePage === "auth" && (
          <section className="auth-section">
            <div className="section-title">
              <p className="eyebrow">Account</p>
              <h2>
                {currentUser
                  ? "Your profile"
                  : authMode === "login"
                    ? "Login"
                    : "Create account"}
              </h2>
              <p className="insights-description">
                Login to save series to your personal LazyGarfield library.
              </p>

              {!currentUser && (
                <p className="insights-description">
                  Please login or create an account to access your personal series library.
                </p>
              )}
            </div>

            {currentUser ? (
              <div className="auth-profile-card">
                <h3>{currentUser.name}</h3>
                <p>{currentUser.email}</p>
                <p>Role: {currentUser.role}</p>

                <button className="delete-button" type="button" onClick={logoutUser}>
                  Logout
                </button>
              </div>
            ) : (
              <form
                className="auth-form"
                onSubmit={authMode === "login" ? loginUser : registerUser}
              >
                {authMode === "register" && (
                  <label>
                    Name
                    <input
                      type="text"
                      value={authForm.name}
                      onChange={(event) => updateAuthForm("name", event.target.value)}
                      placeholder="Your name"
                    />
                  </label>
                )}

                <label>
                  Email
                  <input
                    type="email"
                    value={authForm.email}
                    onChange={(event) => updateAuthForm("email", event.target.value)}
                    placeholder="you@example.com"
                  />
                </label>

                <label>
                  Password
                  <input
                    type="password"
                    value={authForm.password}
                    onChange={(event) => updateAuthForm("password", event.target.value)}
                    placeholder="At least 6 characters"
                  />
                </label>

                <button className="submit-button" type="submit">
                  {authMode === "login" ? "Login" : "Register"}
                </button>

                <button
                  className="details-toggle-button"
                  type="button"
                  onClick={() =>
                    setAuthMode((current) => (current === "login" ? "register" : "login"))
                  }
                >
                  {authMode === "login"
                    ? "Need an account? Register"
                    : "Already have an account? Login"}
                </button>

                <button
                  className="details-toggle-button"
                  type="button"
                  onClick={() => {
                    setAuthForm({
                      name: "",
                      email: "user@lazygarfield.local",
                      password: "user123"
                    });
                  }}
                >
                  Use Demo User
                </button>

                <button
                  className="details-toggle-button"
                  type="button"
                  onClick={() => {
                    setAuthForm({
                      name: "",
                      email: "admin@lazygarfield.local",
                      password: "admin123"
                    });
                  }}
                >
                  Use Demo Admin
                </button>
              </form>
            )}

            {authMessage && <p className="api-message">{authMessage}</p>}
          </section>
        )}

        {selectedSeries && (
          <div className="modal-overlay" onClick={closeSeriesDetails}>
            <section
              className="series-modal"
              onClick={(event) => event.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-label={`${selectedSeries.title} details`}
            >
              <div className="modal-header">
                <div className="modal-title-row">
                  <PosterDisplay
                    poster={selectedSeries.poster}
                    className="modal-poster"
                  />

                  <div>
                    <p className="eyebrow">Series details</p>
                    <h2>{selectedSeries.title}</h2>
                    <p>{selectedSeries.description}</p>
                  </div>
                </div>

                <button
                  type="button"
                  className="modal-close-button"
                  onClick={closeSeriesDetails}
                  aria-label="Close details"
                >
                  ×
                </button>
              </div>

              <div className="meta-row">
                {(selectedSeries.genres || []).map((genre) => (
                  <span key={genre}>{genre}</span>
                ))}
                <span>{selectedSeries.status}</span>
                <span>{selectedSeries.seasons} seasons</span>
                <span>{selectedSeries.episodes?.length || 0} episodes</span>
              </div>

              <button
                type="button"
                className={`favorite-button ${
                  selectedSeries.isFavorite ? "active" : ""
                }`}
                onClick={() => toggleFavorite(selectedSeries.id)}
                title="Toggle favorite"
              >
                {selectedSeries.isFavorite ? "♥ Favorite" : "♡ Favorite"}
              </button>

              <div className="rating-row">
                <label>
                  Series rating
                  <select
                    value={selectedSeries.rating}
                    onChange={(event) =>
                      changeRating(selectedSeries.id, event.target.value)
                    }
                  >
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <option key={rating} value={rating}>
                        {rating}/5
                      </option>
                    ))}
                  </select>
                </label>

                <div className="stars">
                  {renderStars(selectedSeries.rating)}
                </div>
              </div>

              <div className="episodes-box modal-episodes-box">
                <div className="episodes-header">
                  <h4>Episodes</h4>
                  <span>{selectedSeries.episodes?.length || 0} saved</span>
                </div>

                <div className="episode-form">
                  <input
                    type="text"
                    placeholder="Episode title"
                    value={selectedEpisodeForm.title}
                    onChange={(event) =>
                      updateEpisodeForm(
                        selectedSeries.id,
                        "title",
                        event.target.value
                      )
                    }
                  />

                  <input
                    type="number"
                    min="1"
                    placeholder="S"
                    value={selectedEpisodeForm.season}
                    onChange={(event) =>
                      updateEpisodeForm(
                        selectedSeries.id,
                        "season",
                        event.target.value
                      )
                    }
                  />

                  <input
                    type="number"
                    min="1"
                    placeholder="E"
                    value={selectedEpisodeForm.episode}
                    onChange={(event) =>
                      updateEpisodeForm(
                        selectedSeries.id,
                        "episode",
                        event.target.value
                      )
                    }
                  />

                  <select
                    value={selectedEpisodeForm.rating}
                    onChange={(event) =>
                      updateEpisodeForm(
                        selectedSeries.id,
                        "rating",
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
                    className="add-episode-button"
                    onClick={() => addEpisode(selectedSeries.id)}
                  >
                    Add Episode Rating
                  </button>
                </div>

                {(selectedSeries.episodes || []).length === 0 ? (
                  <p className="episode-empty">No episodes rated yet.</p>
                ) : (
                  <div className="episode-list">
                    {(selectedSeries.episodes || []).map((episode) => (
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
                              toggleEpisodeWatched(selectedSeries.id, episode.id)
                            }
                          >
                            {episode.watched ? "Watched" : "Unwatched"}
                          </button>

                          <select
                            value={episode.rating}
                            onChange={(event) =>
                              changeEpisodeRating(
                                selectedSeries.id,
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
                            onClick={() => deleteEpisode(selectedSeries.id, episode.id)}
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
                onClick={() => {
                  deleteSeries(selectedSeries.id);
                  closeSeriesDetails();
                }}
              >
                Delete Series
              </button>
            </section>
          </div>
        )}

        </main>
      </div>

      <footer className="footer">
        <p>LazyGarfield —  web application.</p>
       
      </footer>
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

function PosterDisplay({ poster, className = "poster" }) {
  const safePoster = poster || "🎬";

  if (isImagePoster(safePoster)) {
    return (
      <div className={className}>
        <img src={safePoster} alt="" />
      </div>
    );
  }

  return <div className={className}>{safePoster}</div>;
}
