import { useEffect, useMemo, useState } from "react";
import mascotImage from "./mascot1.png";
import mascotAddImage from "./mascot2.png";

const STORAGE_KEYS = {
  series: "lazygarfield_series",
  theme: "lazygarfield_theme",
  filters: "lazygarfield_filters",
  page: "lazygarfield_page",
  apiMode: "lazygarfield_api_mode",
  authToken: "lazygarfield_auth_token",
  currentUser: "lazygarfield_current_user"
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
    ratedEpisodesCount: Number(
      item.ratedEpisodesCount || item.episodeRatingsCount || 0
    ),
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

  const [authToken, setAuthToken] = useState(() => {
    return localStorage.getItem(STORAGE_KEYS.authToken) || "";
  });
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.currentUser);

    return saved ? JSON.parse(saved) : null;
  });
  const [authMode, setAuthMode] = useState("login");
  const [authMessage, setAuthMessage] = useState("");
  const [authForm, setAuthForm] = useState({
    name: "",
    email: "",
    password: ""
  });

  const [discoverQuery, setDiscoverQuery] = useState("");
  const [discoverResults, setDiscoverResults] = useState([]);
  const [discoverMessage, setDiscoverMessage] = useState("");
  const [isDiscoverLoading, setIsDiscoverLoading] = useState(false);
  const [libraryMessage, setLibraryMessage] = useState("");
  const [myLibraryMessage, setMyLibraryMessage] = useState("");
  const [isMyLibraryLoading, setIsMyLibraryLoading] = useState(false);
  const [publicReviews, setPublicReviews] = useState([]);
  const [publicReviewsMessage, setPublicReviewsMessage] = useState("");
  const [isPublicReviewsLoading, setIsPublicReviewsLoading] = useState(false);

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
      setActivePage("discover");
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
      setActivePage("discover");
    } catch (error) {
      setAuthMessage(error.message);
    }
  }

  function logoutUser() {
    localStorage.removeItem(STORAGE_KEYS.authToken);
    localStorage.removeItem(STORAGE_KEYS.currentUser);
    setAuthToken("");
    setApiToken("");
    setCurrentUser(null);
    setApiMode(false);
    setAuthMessage("Logged out successfully.");
    setApiStatus("Logged out. Local mode is available as fallback.");
    setActivePage("auth");
  }

  async function loadMyLibrary() {
    if (!authToken || !currentUser) {
      setActivePage("auth");
      return;
    }

    try {
      setIsMyLibraryLoading(true);

      const data = await apiRequest("/api/my-library");

      setSeries((data.data || []).map(normalizeSeriesItem));
      setMyLibraryMessage(
        `Loaded ${data.data?.length || 0} saved series from your library.`
      );
    } catch (error) {
      setMyLibraryMessage(error.message);
    } finally {
      setIsMyLibraryLoading(false);
    }
  }

  async function loadPublicReviews() {
    try {
      setIsPublicReviewsLoading(true);

      const response = await fetch(`${API_BASE_URL}/api/reviews?limit=10&skip=0`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not load public reviews");
      }

      setPublicReviews(data.data || []);
      setPublicReviewsMessage(
        `Loaded ${data.data?.length || 0} community reviews.`
      );
    } catch (error) {
      setPublicReviewsMessage(error.message);
    } finally {
      setIsPublicReviewsLoading(false);
    }
  }

  async function searchDiscoverShows(event) {
    if (event) {
      event.preventDefault();
    }

    const query = discoverQuery.trim();

    if (!query) {
      setDiscoverMessage("Enter a series title to search.");
      return;
    }

    try {
      setIsDiscoverLoading(true);
      setDiscoverMessage("");

      const response = await fetch(
        `${API_BASE_URL}/api/discover/search?q=${encodeURIComponent(query)}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Search failed");
      }

      setDiscoverResults(data.data || []);
      setDiscoverMessage(
        `Found ${data.data?.length || 0} results for "${query}".`
      );
    } catch (error) {
      setDiscoverMessage(error.message);
    } finally {
      setIsDiscoverLoading(false);
    }
  }

  function openDiscoverDetails(tvmazeId) {
    const show = discoverResults.find((item) => item.tvmazeId === tvmazeId);

    if (show) {
      alert(`${show.title}\n\n${show.description}`);
    }
  }

  async function getSeasonCountFromTvmaze(tvmazeId) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/discover/shows/${tvmazeId}/episodes`
      );
      const data = await response.json();

      if (!response.ok) {
        return 1;
      }

      const episodes = data.data || [];
      const maxSeason = episodes.reduce((max, episode) => {
        return Math.max(max, Number(episode.season || 1));
      }, 1);

      return maxSeason || 1;
    } catch {
      return 1;
    }
  }

  async function addDiscoveredShowToLibrary(show) {
    if (!isAuthenticated) {
      setLibraryMessage("Please login before adding series to your library.");
      setActivePage("auth");
      return;
    }

    try {
      setLibraryMessage("");
      const seasonCount = await getSeasonCountFromTvmaze(show.tvmazeId);

      await apiRequest("/api/my-library", {
        method: "POST",
        body: JSON.stringify({
          tvmazeId: show.tvmazeId,
          title: show.title,
          genres: show.genres || [],
          status: "Plan to Watch",
          rating: show.rating || 3,
          seasons: seasonCount,
          description: show.description || "No description available.",
          poster: show.poster || "🎬",
          isFavorite: false
        })
      });

      setLibraryMessage(`${show.title} was added to your library.`);
    } catch (error) {
      setLibraryMessage(error.message);
    }
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
      ? "discover"
      : activePage;

  const [selectedSeriesId, setSelectedSeriesId] = useState(null);
  const [modalEpisodes, setModalEpisodes] = useState([]);
  const [modalEpisodeRatings, setModalEpisodeRatings] = useState([]);
  const [episodeMessage, setEpisodeMessage] = useState("");
  const [isEpisodesLoading, setIsEpisodesLoading] = useState(false);
  const [episodeCommentDrafts, setEpisodeCommentDrafts] = useState({});

  useEffect(() => {
    if (authToken) {
      localStorage.setItem(STORAGE_KEYS.authToken, authToken);
    } else {
      localStorage.removeItem(STORAGE_KEYS.authToken);
    }
  }, [authToken]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(STORAGE_KEYS.currentUser, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(STORAGE_KEYS.currentUser);
    }
  }, [currentUser]);

  useEffect(() => {
    if (authToken && !apiToken) {
      setApiToken(authToken);
      setApiMode(true);
    }
  }, [authToken, apiToken]);

  useEffect(() => {
    if (!authToken || !currentUser) {
      return;
    }

    let cancelled = false;

    async function validateSession() {
      try {
        const response = await fetch(`${API_BASE_URL}/auth/me`, {
          headers: {
            Authorization: `Bearer ${authToken}`
          }
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Session expired");
        }

        if (!cancelled) {
          setCurrentUser(data.user);
          setApiToken(authToken);
          setApiMode(true);
        }
      } catch {
        if (!cancelled) {
          setAuthToken("");
          setApiToken("");
          setCurrentUser(null);
          setApiMode(false);
          setActivePage("auth");
          setAuthMessage("Session expired. Please login again.");
        }
      }
    }

    validateSession();

    return () => {
      cancelled = true;
    };
  }, [authToken]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.apiMode, String(apiMode));
  }, [apiMode]);

  useEffect(() => {
    if (visiblePage === "library" && authToken && currentUser) {
      loadMyLibrary();
    }
  }, [visiblePage, authToken, currentUser]);

  useEffect(() => {
    if (visiblePage === "insights" && authToken && currentUser) {
      loadPublicReviews();
    }
  }, [visiblePage, authToken, currentUser]);

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
    if (isAuthenticated) {
      const savedSeries = await apiRequest(`/api/my-library/${updatedSeries.id}`, {
        method: "PUT",
        body: JSON.stringify(updatedSeries)
      });

      setApiStatus(successMessage);

      return normalizeSeriesItem(savedSeries);
    }

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
      if (isAuthenticated) {
        await apiRequest(`/api/my-library/${id}`, {
          method: "DELETE"
        });

        setApiStatus("Series removed from your library.");
      } else if (apiMode) {
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

  function getEpisodeSavedRating(season, episode) {
    return (
      modalEpisodeRatings.find(
        (rating) => rating.season === season && rating.episode === episode
      ) || null
    );
  }

  function updateSelectedSeriesRatedCount(delta) {
    if (!selectedSeriesId) {
      return;
    }

    setSeries((current) =>
      current.map((item) =>
        item.id === selectedSeriesId
          ? {
              ...item,
              ratedEpisodesCount: Math.max(
                0,
                Number(item.ratedEpisodesCount || 0) + delta
              )
            }
          : item
      )
    );
  }

  function getEpisodeKey(episode) {
    return `${episode.season}-${episode.episode}`;
  }

  function updateEpisodeCommentDraft(episode, value) {
    const key = getEpisodeKey(episode);

    setEpisodeCommentDrafts((current) => ({
      ...current,
      [key]: value
    }));
  }

  async function loadEpisodeData(seriesItem) {
    if (!seriesItem?.tvmazeId) {
      return;
    }

    try {
      setIsEpisodesLoading(true);
      setEpisodeMessage("");

      const response = await fetch(
        `${API_BASE_URL}/api/discover/shows/${seriesItem.tvmazeId}/episodes`
      );

      const episodesData = await response.json();

      if (!response.ok) {
        throw new Error(episodesData.message || "Could not load episodes");
      }

      const ratingsData = await apiRequest(
        `/api/my-library/${seriesItem.tvmazeId}/episode-ratings`
      );

      setModalEpisodes(episodesData.data || []);
      setModalEpisodeRatings(ratingsData.data || []);
      const drafts = {};
      (ratingsData.data || []).forEach((rating) => {
        drafts[`${rating.season}-${rating.episode}`] = rating.comment || "";
      });
      setEpisodeCommentDrafts(drafts);
    } catch (error) {
      setEpisodeMessage(error.message);
    } finally {
      setIsEpisodesLoading(false);
    }
  }

  async function rateTvmazeEpisode(episode, ratingValue) {
    if (!selectedSeries?.tvmazeId) {
      return;
    }

    const key = getEpisodeKey(episode);
    const comment = episodeCommentDrafts[key] || "";
    const existingRating = getEpisodeSavedRating(episode.season, episode.episode);

    try {
      setEpisodeMessage("");

      const savedRating = await apiRequest("/api/episode-ratings", {
        method: "POST",
        body: JSON.stringify({
          tvmazeId: selectedSeries.tvmazeId,
          episodeTitle: episode.title,
          season: episode.season,
          episode: episode.episode,
          rating: clampRating(ratingValue),
          watched: true,
          comment
        })
      });

      setModalEpisodeRatings((current) => {
        const next = [...current];
        const byIdIndex = next.findIndex((item) => item.id === savedRating.id);
        const byEpisodeIndex = next.findIndex(
          (item) =>
            item.season === savedRating.season && item.episode === savedRating.episode
        );

        const targetIndex = byIdIndex !== -1 ? byIdIndex : byEpisodeIndex;

        if (targetIndex !== -1) {
          next[targetIndex] = savedRating;
          return next;
        }

        next.push(savedRating);
        return next;
      });

      if (!existingRating && savedRating) {
        updateSelectedSeriesRatedCount(1);
      }

      setEpisodeMessage(
        `Rated S${episode.season}E${episode.episode} ${clampRating(ratingValue)}/5.`
      );
    } catch (error) {
      setEpisodeMessage(error.message);
    }
  }

  async function toggleTvmazeEpisodeWatched(episode) {
    if (!selectedSeries?.tvmazeId) {
      return;
    }

    const key = getEpisodeKey(episode);
    const existingRating = getEpisodeSavedRating(episode.season, episode.episode);
    const comment = episodeCommentDrafts[key] || existingRating?.comment || "";

    try {
      setEpisodeMessage("");

      const savedRating = existingRating
        ? await apiRequest(`/api/episode-ratings/${existingRating.id}`, {
            method: "PUT",
            body: JSON.stringify({
              watched: !existingRating.watched,
              comment
            })
          })
        : await apiRequest("/api/episode-ratings", {
            method: "POST",
            body: JSON.stringify({
              tvmazeId: selectedSeries.tvmazeId,
              episodeTitle: episode.title,
              season: episode.season,
              episode: episode.episode,
              rating: 3,
              watched: true,
              comment
            })
          });

      setModalEpisodeRatings((current) => {
        const next = [...current];
        const byIdIndex = next.findIndex((item) => item.id === savedRating.id);
        const byEpisodeIndex = next.findIndex(
          (item) =>
            item.season === savedRating.season && item.episode === savedRating.episode
        );

        const targetIndex = byIdIndex !== -1 ? byIdIndex : byEpisodeIndex;

        if (targetIndex !== -1) {
          next[targetIndex] = savedRating;
          return next;
        }

        next.push(savedRating);
        return next;
      });

      if (!existingRating) {
        updateSelectedSeriesRatedCount(1);
      }

      setEpisodeMessage(
        `${savedRating.watched ? "Marked watched" : "Marked unwatched"} S${episode.season}E${episode.episode}.`
      );
    } catch (error) {
      setEpisodeMessage(error.message);
    }
  }

  async function deleteTvmazeEpisodeRating(ratingId) {
    try {
      setEpisodeMessage("");

      await apiRequest(`/api/episode-ratings/${ratingId}`, {
        method: "DELETE"
      });

      updateSelectedSeriesRatedCount(-1);

      setModalEpisodeRatings((current) =>
        current.filter((item) => item.id !== ratingId)
      );
      setEpisodeMessage("Episode rating deleted.");
    } catch (error) {
      setEpisodeMessage(error.message);
    }
  }

  async function saveEpisodeComment(episode) {
    if (!selectedSeries?.tvmazeId) {
      return;
    }

    const existingRating = getEpisodeSavedRating(episode.season, episode.episode);
    const key = getEpisodeKey(episode);
    const comment = episodeCommentDrafts[key] || "";

    try {
      setEpisodeMessage("");

      const savedRating = existingRating
        ? await apiRequest(`/api/episode-ratings/${existingRating.id}`, {
            method: "PUT",
            body: JSON.stringify({
              episodeTitle: existingRating.episodeTitle || episode.title,
              season: existingRating.season,
              episode: existingRating.episode,
              rating: existingRating.rating || 3,
              watched: Boolean(existingRating.watched),
              comment
            })
          })
        : await apiRequest("/api/episode-ratings", {
            method: "POST",
            body: JSON.stringify({
              tvmazeId: selectedSeries.tvmazeId,
              episodeTitle: episode.title,
              season: episode.season,
              episode: episode.episode,
              rating: 3,
              watched: false,
              comment
            })
          });

      setModalEpisodeRatings((current) => {
        const next = [...current];
        const byIdIndex = next.findIndex((item) => item.id === savedRating.id);
        const byEpisodeIndex = next.findIndex(
          (item) =>
            item.season === savedRating.season &&
            item.episode === savedRating.episode
        );

        const targetIndex = byIdIndex !== -1 ? byIdIndex : byEpisodeIndex;

        if (targetIndex !== -1) {
          next[targetIndex] = savedRating;
          return next;
        }

        next.push(savedRating);
        return next;
      });

      if (!existingRating) {
        updateSelectedSeriesRatedCount(1);
      }

      setEpisodeCommentDrafts((current) => ({
        ...current,
        [key]: savedRating.comment || ""
      }));

      setEpisodeMessage(
        `Comment saved for S${episode.season}E${episode.episode}.`
      );
    } catch (error) {
      setEpisodeMessage(error.message);
    }
  }

  async function openSeriesDetails(id) {
    const foundSeries = series.find((item) => item.id === id);
    setSelectedSeriesId(id);

    if (foundSeries?.tvmazeId) {
      await loadEpisodeData(foundSeries);
    }
  }

  function closeSeriesDetails() {
    setSelectedSeriesId(null);
    setModalEpisodes([]);
    setModalEpisodeRatings([]);
    setEpisodeMessage("");
    setEpisodeCommentDrafts({});
  }

  const selectedSeries = series.find((item) => item.id === selectedSeriesId);

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
                      activePage === "discover"
                        ? "sidebar-link active"
                        : "sidebar-link"
                    }
                    onClick={() => setActivePage("discover")}
                  >
                    <span>🔎</span>
                    Discover
                  </button>

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
                    My Library
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
        {visiblePage === "discover" && (
          <section className="discover-section">
            <div className="section-title">
              <p className="eyebrow">Public Catalog</p>
              <h2>Discover TV series</h2>
              <p className="insights-description">
                Search real TV series from TVmaze and later add them to your personal LazyGarfield library.
              </p>
            </div>

            <form className="discover-search" onSubmit={searchDiscoverShows}>
              <input
                type="text"
                value={discoverQuery}
                onChange={(event) => setDiscoverQuery(event.target.value)}
                placeholder="Search for Dark, Sherlock, The Crown..."
              />

              <button className="submit-button" type="submit" disabled={isDiscoverLoading}>
                {isDiscoverLoading ? "Searching..." : "Search"}
              </button>
            </form>

            {discoverMessage && <p className="api-message">{discoverMessage}</p>}
            {libraryMessage && <p className="api-message">{libraryMessage}</p>}

            {discoverResults.length === 0 ? (
              <div className="empty-state">
                <div>🔎</div>
                <h3>Search the public catalog</h3>
                <p>Find series from TVmaze and choose what to save later.</p>
              </div>
            ) : (
              <div className="discover-grid">
                {discoverResults.map((show) => (
                  <article className="discover-card" key={show.tvmazeId}>
                    <div className="discover-poster">
                      {show.poster && show.poster.startsWith("http") ? (
                        <img src={show.poster} alt={show.title} />
                      ) : (
                        <span>{show.poster || "🎬"}</span>
                      )}
                    </div>

                    <div className="discover-content">
                      <h3>{show.title}</h3>
                      <p>{show.description}</p>

                      <div className="meta-row">
                        {(show.genres || []).slice(0, 3).map((genre) => (
                          <span key={genre}>{genre}</span>
                        ))}
                        <span>{show.status}</span>
                        {show.network && <span>{show.network}</span>}
                      </div>

                      <div className="compact-rating">
                        <span>{renderStars(show.rating)}</span>
                        <strong>{show.rating}/5</strong>
                      </div>

                      <button
                        type="button"
                        className="details-toggle-button"
                        onClick={() => openDiscoverDetails(show.tvmazeId)}
                      >
                        View Public Details
                      </button>

                      <button
                        type="button"
                        className="submit-button"
                        onClick={() => addDiscoveredShowToLibrary(show)}
                      >
                        Add to My Library
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}

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
                  <p className="eyebrow">Personal Library</p>
                  <h2>My Library</h2>
                  <p className="insights-description">
                    These are the series saved to your personal LazyGarfield account.
                  </p>
                </div>
                <div>
                  <p className="result-count">
                    Showing {filteredSeries.length} of {series.length}
                  </p>
                  <button
                    type="button"
                    className="details-toggle-button"
                    onClick={loadMyLibrary}
                    disabled={isMyLibraryLoading}
                  >
                    {isMyLibraryLoading ? "Loading..." : "Reload My Library"}
                  </button>
                </div>
              </div>

              {myLibraryMessage && <p className="api-message">{myLibraryMessage}</p>}

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
                            <span>{item.ratedEpisodesCount || 0} rated episodes</span>
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

            <section className="reviews-panel">
              <div className="section-title row-title">
                <div>
                  <p className="eyebrow">Community Reviews</p>
                  <h2>Latest episode notes</h2>
                  <p className="insights-description">
                    Public episode comments written by LazyGarfield users.
                  </p>
                </div>

                <button
                  type="button"
                  className="details-toggle-button"
                  onClick={loadPublicReviews}
                  disabled={isPublicReviewsLoading}
                >
                  {isPublicReviewsLoading ? "Loading..." : "Reload Reviews"}
                </button>
              </div>

              {publicReviewsMessage && (
                <p className="api-message">{publicReviewsMessage}</p>
              )}

              {publicReviews.length === 0 ? (
                <div className="empty-state">
                  <div>💬</div>
                  <h3>No public reviews yet</h3>
                  <p>Write an episode comment in your library to make it appear here.</p>
                </div>
              ) : (
                <div className="reviews-list">
                  {publicReviews.map((review) => (
                    <article className="review-card" key={review.id}>
                      <div className="review-card-top">
                        <div>
                          <h3>{review.episodeTitle}</h3>
                          <p>
                            S{review.season} · E{review.episode} · by {review.userName}
                          </p>
                        </div>

                        <strong>{renderStars(review.rating)}</strong>
                      </div>

                      <p className="review-comment">{review.comment}</p>

                      <div className="review-meta">
                        <span>{review.watched ? "Watched" : "Not watched"}</span>
                        <span>TVmaze #{review.tvmazeId}</span>
                      </div>
                    </article>
                  ))}
                </div>
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
                <span>
                  {selectedSeries.tvmazeId
                    ? isEpisodesLoading
                      ? "Loading episodes..."
                      : `${modalEpisodes.length || 0} TVmaze episodes`
                    : `${selectedSeries.ratedEpisodesCount || 0} rated episodes`}
                </span>
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
                  <span>{modalEpisodes.length || 0} TVmaze episodes</span>
                </div>

                {isEpisodesLoading ? (
                  <p className="episode-empty">Loading episodes...</p>
                ) : (
                  <>
                    {episodeMessage && <p className="api-message">{episodeMessage}</p>}

                    {modalEpisodes.length === 0 ? (
                      <p className="episode-empty">
                        No episodes found for this series.
                      </p>
                    ) : (
                      <div className="episode-list">
                        {modalEpisodes.map((episode) => {
                          const savedRating = getEpisodeSavedRating(
                            episode.season,
                            episode.episode
                          );

                          return (
                            <div className="episode-item" key={episode.tvmazeEpisodeId}>
                              <div className="episode-main-row">
                                <div>
                                  <strong>{episode.title}</strong>
                                  <span>
                                    S{episode.season} · E{episode.episode}
                                    {episode.airdate ? ` · ${episode.airdate}` : ""}
                                  </span>
                                </div>

                                <div className="episode-actions">
                                  <button
                                    type="button"
                                    className={`watched-button ${
                                      savedRating?.watched ? "active" : ""
                                    }`}
                                    onClick={() => toggleTvmazeEpisodeWatched(episode)}
                                  >
                                    {savedRating?.watched ? "Watched" : "Mark watched"}
                                  </button>

                                  <select
                                    value={savedRating?.rating || 3}
                                    onChange={(event) =>
                                      rateTvmazeEpisode(episode, event.target.value)
                                    }
                                  >
                                    {[1, 2, 3, 4, 5].map((rating) => (
                                      <option key={rating} value={rating}>
                                        {rating}/5
                                      </option>
                                    ))}
                                  </select>

                                  {savedRating && (
                                    <button
                                      type="button"
                                      className="mini-delete-button"
                                      onClick={() =>
                                        deleteTvmazeEpisodeRating(savedRating.id)
                                      }
                                    >
                                      ×
                                    </button>
                                  )}
                                </div>
                              </div>

                              <div className="episode-comment-box">
                                <textarea
                                  rows="2"
                                  value={
                                    episodeCommentDrafts[getEpisodeKey(episode)] ??
                                    savedRating?.comment ??
                                    ""
                                  }
                                  onChange={(event) =>
                                    updateEpisodeCommentDraft(episode, event.target.value)
                                  }
                                  placeholder="Write a short episode note or review..."
                                />

                                <button
                                  type="button"
                                  className="details-toggle-button"
                                  onClick={() => saveEpisodeComment(episode)}
                                >
                                  Save Comment
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </>
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
