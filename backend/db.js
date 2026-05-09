import Database from "better-sqlite3";
import { existsSync, mkdirSync } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDirectory = path.join(__dirname, "data");
const databasePath = path.join(dataDirectory, "lazygarfield.db");

if (!existsSync(dataDirectory)) {
  mkdirSync(dataDirectory, { recursive: true });
}

const db = new Database(databasePath);

db.exec(`
  CREATE TABLE IF NOT EXISTS series (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    genres TEXT NOT NULL,
    status TEXT NOT NULL,
    rating INTEGER NOT NULL,
    seasons INTEGER NOT NULL,
    description TEXT NOT NULL,
    poster TEXT NOT NULL,
    isFavorite INTEGER NOT NULL,
    createdAt TEXT NOT NULL,
    episodes TEXT NOT NULL
  )
`);

export function serializeSeries(item) {
  return {
    id: item.id,
    title: item.title,
    genres: JSON.stringify(item.genres || []),
    status: item.status,
    rating: Number(item.rating || 3),
    seasons: Number(item.seasons || 1),
    description: item.description,
    poster: item.poster,
    isFavorite: item.isFavorite ? 1 : 0,
    createdAt: item.createdAt,
    episodes: JSON.stringify(item.episodes || [])
  };
}

export function deserializeSeries(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    title: row.title,
    genres: JSON.parse(row.genres || "[]"),
    status: row.status,
    rating: Number(row.rating || 3),
    seasons: Number(row.seasons || 1),
    description: row.description,
    poster: row.poster,
    isFavorite: Boolean(row.isFavorite),
    createdAt: row.createdAt,
    episodes: JSON.parse(row.episodes || "[]")
  };
}

function seedDatabase() {
  const countRow = db.prepare("SELECT COUNT(*) AS count FROM series").get();

  if (countRow.count > 0) {
    return;
  }

  const defaultSeries = [
    {
      id: randomUUID(),
      title: "Dark",
      genres: ["Sci-Fi", "Thriller", "Mystery"],
      status: "Completed",
      rating: 5,
      seasons: 3,
      description: "A haunting time-travel mystery where family secrets echo across generations.",
      poster: "🕰️",
      isFavorite: true,
      createdAt: new Date().toISOString(),
      episodes: []
    },
    {
      id: randomUUID(),
      title: "Gossip Girl",
      genres: ["Drama", "Romance"],
      status: "Completed",
      rating: 4,
      seasons: 6,
      description: "A stylish teen drama fueled by scandals, secrets, and Upper East Side chaos.",
      poster: "💋",
      isFavorite: false,
      createdAt: new Date().toISOString(),
      episodes: []
    },
    {
      id: randomUUID(),
      title: "The Crown",
      genres: ["Drama", "History"],
      status: "Completed",
      rating: 4,
      seasons: 6,
      description: "A royal chronicle of duty, ambition, and private struggles behind the throne.",
      poster: "👑",
      isFavorite: false,
      createdAt: new Date().toISOString(),
      episodes: []
    },
    {
      id: randomUUID(),
      title: "The Queen's Gambit",
      genres: ["Drama"],
      status: "Completed",
      rating: 5,
      seasons: 1,
      description: "A brilliant chess prodigy battles loneliness, addiction, and fierce competition.",
      poster: "♟️",
      isFavorite: true,
      createdAt: new Date().toISOString(),
      episodes: []
    },
    {
      id: randomUUID(),
      title: "Game of Thrones",
      genres: ["Fantasy", "Drama"],
      status: "Completed",
      rating: 5,
      seasons: 8,
      description: "Noble houses clash for power in an epic world of dragons, war, and betrayal.",
      poster: "🐉",
      isFavorite: true,
      createdAt: new Date().toISOString(),
      episodes: []
    },
    {
      id: randomUUID(),
      title: "The Vampire Diaries",
      genres: ["Fantasy", "Romance"],
      status: "Completed",
      rating: 4,
      seasons: 8,
      description: "A supernatural romance where love triangles and ancient rivalries never stay buried.",
      poster: "🩸",
      isFavorite: false,
      createdAt: new Date().toISOString(),
      episodes: []
    },
    {
      id: randomUUID(),
      title: "Sherlock",
      genres: ["Thriller", "Drama"],
      status: "Completed",
      rating: 5,
      seasons: 4,
      description: "A sharp modern detective story built on deduction, danger, and unlikely friendship.",
      poster: "🔎",
      isFavorite: true,
      createdAt: new Date().toISOString(),
      episodes: []
    },
    {
      id: randomUUID(),
      title: "House of Cards",
      genres: ["Drama", "Thriller"],
      status: "Completed",
      rating: 4,
      seasons: 1,
      description: "A ruthless political drama about manipulation, ambition, and the cost of power.",
      poster: "🏛️",
      isFavorite: false,
      createdAt: new Date().toISOString(),
      episodes: []
    },
    {
      id: randomUUID(),
      title: "Black Mirror",
      genres: ["Sci-Fi", "Thriller"],
      status: "Completed",
      rating: 5,
      seasons: 6,
      description: "An unsettling anthology exploring how technology can distort modern life.",
      poster: "🪞",
      isFavorite: true,
      createdAt: new Date().toISOString(),
      episodes: []
    }
  ];

  const insertSeries = db.prepare(`
    INSERT INTO series (
      id,
      title,
      genres,
      status,
      rating,
      seasons,
      description,
      poster,
      isFavorite,
      createdAt,
      episodes
    ) VALUES (
      @id,
      @title,
      @genres,
      @status,
      @rating,
      @seasons,
      @description,
      @poster,
      @isFavorite,
      @createdAt,
      @episodes
    )
  `);

  const insertMany = db.transaction((items) => {
    for (const item of items) {
      insertSeries.run(serializeSeries(item));
    }
  });

  insertMany(defaultSeries);
}

seedDatabase();

export { db };
