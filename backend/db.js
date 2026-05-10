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

db.pragma("foreign_keys = ON");

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    passwordHash TEXT NOT NULL,
    role TEXT NOT NULL,
    createdAt TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS user_library (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    tvmazeId INTEGER NOT NULL,
    title TEXT NOT NULL,
    genres TEXT NOT NULL,
    status TEXT NOT NULL,
    rating INTEGER NOT NULL,
    seasons INTEGER NOT NULL,
    description TEXT NOT NULL,
    poster TEXT NOT NULL,
    isFavorite INTEGER NOT NULL,
    createdAt TEXT NOT NULL,
    FOREIGN KEY(userId) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS episode_ratings (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    tvmazeId INTEGER NOT NULL,
    episodeTitle TEXT NOT NULL,
    season INTEGER NOT NULL,
    episode INTEGER NOT NULL,
    rating INTEGER NOT NULL,
    watched INTEGER NOT NULL,
    comment TEXT NOT NULL DEFAULT '',
    createdAt TEXT NOT NULL,
    FOREIGN KEY(userId) REFERENCES users(id)
  );

  CREATE UNIQUE INDEX IF NOT EXISTS idx_user_library_unique_show
    ON user_library(userId, tvmazeId);

  CREATE INDEX IF NOT EXISTS idx_user_library_userId
    ON user_library(userId);

  CREATE INDEX IF NOT EXISTS idx_episode_ratings_userId
    ON episode_ratings(userId);

  CREATE INDEX IF NOT EXISTS idx_episode_ratings_userId_tvmazeId
    ON episode_ratings(userId, tvmazeId);
`);

const episodeRatingsColumns = db
  .prepare("PRAGMA table_info(episode_ratings)")
  .all()
  .map((column) => column.name);

if (!episodeRatingsColumns.includes("comment")) {
  db.exec("ALTER TABLE episode_ratings ADD COLUMN comment TEXT NOT NULL DEFAULT ''");
}

// Temporary compatibility: keep the legacy `series` table around so the
// existing `server.js` can keep working until the routes are redesigned
// to use user libraries + TVmaze catalog.
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

export function serializeUserLibraryItem(item) {
  return {
    id: item.id,
    userId: item.userId,
    tvmazeId: Number(item.tvmazeId),
    title: item.title,
    genres: JSON.stringify(item.genres || []),
    status: item.status,
    rating: Number(item.rating || 3),
    seasons: Number(item.seasons || 1),
    description: item.description,
    poster: item.poster,
    isFavorite: item.isFavorite ? 1 : 0,
    createdAt: item.createdAt
  };
}

export function deserializeUserLibraryItem(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    userId: row.userId,
    tvmazeId: Number(row.tvmazeId),
    title: row.title,
    genres: JSON.parse(row.genres || "[]"),
    status: row.status,
    rating: Number(row.rating || 3),
    seasons: Number(row.seasons || 1),
    description: row.description,
    poster: row.poster,
    isFavorite: Boolean(row.isFavorite),
    createdAt: row.createdAt
  };
}

export function serializeEpisodeRating(item) {
  return {
    id: item.id,
    userId: item.userId,
    tvmazeId: Number(item.tvmazeId),
    episodeTitle: item.episodeTitle,
    season: Number(item.season || 1),
    episode: Number(item.episode || 1),
    rating: Number(item.rating || 3),
    watched: item.watched ? 1 : 0,
    comment: item.comment || "",
    createdAt: item.createdAt
  };
}

export function deserializeEpisodeRating(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    userId: row.userId,
    tvmazeId: Number(row.tvmazeId),
    episodeTitle: row.episodeTitle,
    season: Number(row.season || 1),
    episode: Number(row.episode || 1),
    rating: Number(row.rating || 3),
    watched: Boolean(row.watched),
    comment: row.comment || "",
    createdAt: row.createdAt
  };
}

export function deserializeUser(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    name: row.name,
    email: row.email,
    passwordHash: row.passwordHash,
    role: row.role,
    createdAt: row.createdAt
  };
}

function seedDemoUsers() {
  const existing = db
    .prepare("SELECT email FROM users WHERE email IN (?, ?)")
    .all("admin@lazygarfield.local", "user@lazygarfield.local")
    .map((row) => row.email);

  if (existing.includes("admin@lazygarfield.local") && existing.includes("user@lazygarfield.local")) {
    return;
  }

  const demoUsers = [
    {
      id: randomUUID(),
      name: "Admin",
      email: "admin@lazygarfield.local",
      passwordHash: "admin-demo-password",
      role: "ADMIN",
      createdAt: new Date().toISOString()
    },
    {
      id: randomUUID(),
      name: "Demo User",
      email: "user@lazygarfield.local",
      passwordHash: "user-demo-password",
      role: "USER",
      createdAt: new Date().toISOString()
    }
  ];

  const insertUser = db.prepare(`
    INSERT OR IGNORE INTO users (
      id,
      name,
      email,
      passwordHash,
      role,
      createdAt
    ) VALUES (
      @id,
      @name,
      @email,
      @passwordHash,
      @role,
      @createdAt
    )
  `);

  const insertMany = db.transaction((items) => {
    for (const item of items) {
      insertUser.run(item);
    }
  });

  insertMany(demoUsers);
}

seedDemoUsers();

export { db };
