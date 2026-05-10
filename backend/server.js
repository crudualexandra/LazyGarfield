import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import swaggerUi from "swagger-ui-express";
import * as crypto from "node:crypto";
import bcrypt from "bcryptjs";
import {
	db,
	deserializeUser,
	serializeSeries,
	deserializeSeries,
	serializeUserLibraryItem,
	deserializeUserLibraryItem,
	serializeEpisodeRating,
	deserializeEpisodeRating,
} from "./db.js";

const app = express();
const PORT = 4000;
const JWT_SECRET = "lazygarfield_super_secret_demo_key";
// For the official Lab 7 demo, set JWT_EXPIRES_IN=1m.
// During development, the default is 30m to avoid constant re-login.
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "30m";
const TVMAZE_API_BASE_URL = "https://api.tvmaze.com";

function stripHtml(value) {
	if (!value) {
		return "";
	}

	return String(value).replace(/<[^>]*>/g, "").trim();
}

function mapTvmazeShow(show) {
	return {
		tvmazeId: show.id,
		title: show.name || "Untitled Series",
		genres: Array.isArray(show.genres) ? show.genres : [],
		status: show.status || "Unknown",
		rating: show.rating?.average ? Math.round(show.rating.average / 2) : 3,
		seasons: 1,
		description: stripHtml(show.summary) || "No description available.",
		poster: show.image?.medium || show.image?.original || "🎬",
		officialSite: show.officialSite || "",
		premiered: show.premiered || "",
		ended: show.ended || "",
		language: show.language || "",
		network: show.network?.name || show.webChannel?.name || "",
		runtime: show.runtime || show.averageRuntime || null,
	};
}

function mapTvmazeEpisode(episode) {
	return {
		tvmazeEpisodeId: episode.id,
		title: episode.name || `Episode ${episode.number || ""}`,
		season: episode.season || 1,
		episode: episode.number || 1,
		airdate: episode.airdate || "",
		runtime: episode.runtime || null,
		summary: stripHtml(episode.summary) || "",
	};
}

app.use(cors());
app.use(express.json());

function authenticateToken(req, res, next) {
	const authorization = req.headers.authorization;

	if (!authorization) {
		return res.status(401).json({ message: "Authorization header is required" });
	}

	const [scheme, token] = authorization.split(" ");

	if (scheme !== "Bearer" || !token) {
		return res.status(401).json({ message: "Bearer token is required" });
	}

	try {
		const decoded = jwt.verify(token, JWT_SECRET);
		req.user = decoded;
		next();
	} catch {
		return res.status(401).json({ message: "Invalid or expired token" });
	}
}

function requirePermission(permission) {
	return (req, res, next) => {
		const permissions = req.user?.permissions ?? [];

		if (!permissions.includes(permission)) {
			return res
				.status(403)
				.json({ message: `Permission ${permission} is required` });
		}

		next();
	};
}

function requireAuthUser(req, res, next) {
	if (!req.user?.userId) {
		return res.status(401).json({ message: "User authentication is required" });
	}

	next();
}

function createAuthToken(user) {
	return jwt.sign(
		{
			userId: user.id,
			email: user.email,
			role: user.role,
		},
		JWT_SECRET,
		{ expiresIn: JWT_EXPIRES_IN }
	);
}

const swaggerDocument = {
	openapi: "3.0.0",
	info: {
		title: "LazyGarfield API",
		version: "1.0.0",
		description:
			"CRUD REST API for LazyGarfield TV series tracker with JWT authorization.",
	},
	servers: [{ url: "http://localhost:4000" }],
	components: {
		securitySchemes: {
			bearerAuth: {
				type: "http",
				scheme: "bearer",
				bearerFormat: "JWT",
			},
		},
		schemas: {
			Series: {
				type: "object",
				required: ["id", "title"],
				properties: {
					id: { type: "string", example: "1" },
					title: { type: "string", example: "Dark" },
					genres: {
						type: "array",
						items: { type: "string" },
						example: ["Sci-Fi", "Thriller"],
					},
					status: { type: "string", example: "Completed" },
					rating: { type: "number", example: 9 },
					seasons: { type: "number", example: 3 },
					description: { type: "string" },
					poster: { type: "string", example: "🎬" },
					isFavorite: { type: "boolean", example: true },
					createdAt: {
						type: "string",
						format: "date-time",
						example: "2026-05-09T00:00:00.000Z",
					},
					episodes: { type: "array", items: {} },
				},
			},
			SeriesCreate: {
				type: "object",
				properties: {
					title: { type: "string" },
					genres: { type: "array", items: { type: "string" } },
					status: { type: "string" },
					rating: { type: "number" },
					seasons: { type: "number" },
					description: { type: "string" },
					poster: { type: "string" },
					isFavorite: { type: "boolean" },
					episodes: { type: "array", items: {} },
				},
				required: ["title"],
			},
			SeriesUpdate: {
				type: "object",
				description: "Partial update payload; id is ignored by API.",
				properties: {
					id: { type: "string" },
					title: { type: "string" },
					genres: { type: "array", items: { type: "string" } },
					status: { type: "string" },
					rating: { type: "number" },
					seasons: { type: "number" },
					description: { type: "string" },
					poster: { type: "string" },
					isFavorite: { type: "boolean" },
					episodes: { type: "array", items: {} },
				},
			},
			TokenRequest: {
				type: "object",
				properties: {
					role: { type: "string", example: "VISITOR" },
					permissions: {
						type: "array",
						items: { type: "string" },
						example: ["READ"],
					},
				},
			},
			TokenResponse: {
				type: "object",
				properties: {
					token: { type: "string" },
					expiresIn: { type: "string", example: "1 minute" },
					role: { type: "string" },
					permissions: { type: "array", items: { type: "string" } },
				},
			},
			ErrorResponse: {
				type: "object",
				properties: {
					message: { type: "string" },
				},
				required: ["message"],
			},
			PaginatedSeriesResponse: {
				type: "object",
				properties: {
					total: { type: "number" },
					limit: { type: "number" },
					skip: { type: "number" },
					data: {
						type: "array",
						items: { $ref: "#/components/schemas/Series" },
					},
				},
			},
		},
	},
	paths: {
		"/token": {
			post: {
				summary: "Create a demo JWT token",
				description:
					"Generates a short-lived JWT (expires in 1 minute) containing role and permissions.",
				requestBody: {
					required: false,
					content: {
						"application/json": {
							schema: { $ref: "#/components/schemas/TokenRequest" },
						},
					},
				},
				responses: {
					"200": {
						description: "Success",
						content: {
							"application/json": {
								schema: { $ref: "#/components/schemas/TokenResponse" },
							},
						},
					},
				},
			},
		},
		"/api/series": {
			get: {
				summary: "List series (paginated)",
				security: [{ bearerAuth: [] }],
				parameters: [
					{
						name: "limit",
						in: "query",
						required: false,
						schema: { type: "integer", default: 10 },
						description: "Max items to return",
					},
					{
						name: "skip",
						in: "query",
						required: false,
						schema: { type: "integer", default: 0 },
						description: "Items to skip",
					},
				],
				responses: {
					"200": {
						description: "Success",
						content: {
							"application/json": {
								schema: {
									$ref: "#/components/schemas/PaginatedSeriesResponse",
								},
							},
						},
					},
					"401": {
						description: "Missing/invalid/expired token",
						content: {
							"application/json": {
								schema: { $ref: "#/components/schemas/ErrorResponse" },
							},
						},
					},
					"403": {
						description: "Insufficient permission",
						content: {
							"application/json": {
								schema: { $ref: "#/components/schemas/ErrorResponse" },
							},
						},
					},
				},
			},
			post: {
				summary: "Create a new series",
				security: [{ bearerAuth: [] }],
				requestBody: {
					required: true,
					content: {
						"application/json": {
							schema: { $ref: "#/components/schemas/SeriesCreate" },
						},
					},
				},
				responses: {
					"201": {
						description: "Created",
						content: {
							"application/json": {
								schema: { $ref: "#/components/schemas/Series" },
							},
						},
					},
					"400": {
						description: "Validation error (missing title)",
						content: {
							"application/json": {
								schema: { $ref: "#/components/schemas/ErrorResponse" },
							},
						},
					},
					"401": {
						description: "Missing/invalid/expired token",
						content: {
							"application/json": {
								schema: { $ref: "#/components/schemas/ErrorResponse" },
							},
						},
					},
					"403": {
						description: "Insufficient permission",
						content: {
							"application/json": {
								schema: { $ref: "#/components/schemas/ErrorResponse" },
							},
						},
					},
				},
			},
		},
		"/api/series/{id}": {
			get: {
				summary: "Get a series by id",
				security: [{ bearerAuth: [] }],
				parameters: [
					{
						name: "id",
						in: "path",
						required: true,
						schema: { type: "string" },
						description: "Series id",
					},
				],
				responses: {
					"200": {
						description: "Success",
						content: {
							"application/json": {
								schema: { $ref: "#/components/schemas/Series" },
							},
						},
					},
					"401": {
						description: "Missing/invalid/expired token",
						content: {
							"application/json": {
								schema: { $ref: "#/components/schemas/ErrorResponse" },
							},
						},
					},
					"403": {
						description: "Insufficient permission",
						content: {
							"application/json": {
								schema: { $ref: "#/components/schemas/ErrorResponse" },
							},
						},
					},
					"404": {
						description: "Series not found",
						content: {
							"application/json": {
								schema: { $ref: "#/components/schemas/ErrorResponse" },
							},
						},
					},
				},
			},
			put: {
				summary: "Update a series",
				security: [{ bearerAuth: [] }],
				parameters: [
					{
						name: "id",
						in: "path",
						required: true,
						schema: { type: "string" },
						description: "Series id",
					},
				],
				requestBody: {
					required: true,
					content: {
						"application/json": {
							schema: { $ref: "#/components/schemas/SeriesUpdate" },
						},
					},
				},
				responses: {
					"200": {
						description: "Success",
						content: {
							"application/json": {
								schema: { $ref: "#/components/schemas/Series" },
							},
						},
					},
					"401": {
						description: "Missing/invalid/expired token",
						content: {
							"application/json": {
								schema: { $ref: "#/components/schemas/ErrorResponse" },
							},
						},
					},
					"403": {
						description: "Insufficient permission",
						content: {
							"application/json": {
								schema: { $ref: "#/components/schemas/ErrorResponse" },
							},
						},
					},
					"404": {
						description: "Series not found",
						content: {
							"application/json": {
								schema: { $ref: "#/components/schemas/ErrorResponse" },
							},
						},
					},
				},
			},
			delete: {
				summary: "Delete a series",
				security: [{ bearerAuth: [] }],
				parameters: [
					{
						name: "id",
						in: "path",
						required: true,
						schema: { type: "string" },
						description: "Series id",
					},
				],
				responses: {
					"200": {
						description: "Deleted",
						content: {
							"application/json": {
								schema: {
									type: "object",
									properties: {
										message: { type: "string" },
									},
								},
							},
						},
					},
					"401": {
						description: "Missing/invalid/expired token",
						content: {
							"application/json": {
								schema: { $ref: "#/components/schemas/ErrorResponse" },
							},
						},
					},
					"403": {
						description: "Insufficient permission",
						content: {
							"application/json": {
								schema: { $ref: "#/components/schemas/ErrorResponse" },
							},
						},
					},
					"404": {
						description: "Series not found",
						content: {
							"application/json": {
								schema: { $ref: "#/components/schemas/ErrorResponse" },
							},
						},
					},
				},
			},
		},
	},
};

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get("/", (req, res) => {
	res.status(200).json({
		message: "LazyGarfield API is running",
		documentation: `http://localhost:${PORT}/api-docs`,
	});
});

app.post("/token", (req, res) => {
	const role = req.body?.role ?? "VISITOR";
	const permissions = req.body?.permissions ?? ["READ"];

	const token = jwt.sign(
		{
			role,
			permissions,
		},
		JWT_SECRET,
		{ expiresIn: JWT_EXPIRES_IN }
	);

	res.status(200).json({
		token,
		expiresIn: JWT_EXPIRES_IN,
		role,
		permissions,
	});
});

app.get("/api/my-library", authenticateToken, requireAuthUser, (req, res) => {
	const userId = req.user.userId;

	const rows = db
		.prepare(
			"SELECT * FROM user_library WHERE userId = ? ORDER BY createdAt DESC"
		)
		.all(userId);

	const data = rows.map(deserializeUserLibraryItem);

	res.status(200).json({
		total: data.length,
		data,
	});
});

app.post("/api/my-library", authenticateToken, requireAuthUser, (req, res) => {
	const userId = req.user.userId;
	const tvmazeIdRaw = req.body?.tvmazeId;
	const title = req.body?.title;

	if (!tvmazeIdRaw || !title) {
		return res.status(400).json({ message: "TVmaze id and title are required" });
	}

	const tvmazeId = Number(tvmazeIdRaw);

	const existing = db
		.prepare("SELECT * FROM user_library WHERE userId = ? AND tvmazeId = ?")
		.get(userId, tvmazeId);

	if (existing) {
		return res.status(409).json({ message: "Series already exists in your library" });
	}

	const newItem = {
		id: crypto.randomUUID(),
		userId,
		tvmazeId,
		title,
		genres: req.body.genres || [],
		status: req.body.status || "Plan to Watch",
		rating: Number(req.body.rating || 3),
		seasons: Number(req.body.seasons || 1),
		description: req.body.description || "No description available.",
		poster: req.body.poster || "🎬",
		isFavorite: Boolean(req.body.isFavorite),
		createdAt: new Date().toISOString(),
	};

	try {
		db.prepare(
			`
				INSERT INTO user_library (
					id,
					userId,
					tvmazeId,
					title,
					genres,
					status,
					rating,
					seasons,
					description,
					poster,
					isFavorite,
					createdAt
				) VALUES (
					@id,
					@userId,
					@tvmazeId,
					@title,
					@genres,
					@status,
					@rating,
					@seasons,
					@description,
					@poster,
					@isFavorite,
					@createdAt
				)
			`
		).run(serializeUserLibraryItem(newItem));
	} catch (error) {
		if (error?.code === "SQLITE_CONSTRAINT_UNIQUE") {
			return res
				.status(409)
				.json({ message: "Series already exists in your library" });
		}

		return res.status(500).json({ message: "Internal server error" });
	}

	res.status(201).json(newItem);
});

app.put("/api/my-library/:id", authenticateToken, requireAuthUser, (req, res) => {
	const userId = req.user.userId;
	const { id } = req.params;

	const row = db
		.prepare("SELECT * FROM user_library WHERE id = ? AND userId = ?")
		.get(id, userId);

	if (!row) {
		return res.status(404).json({ message: "Library item not found" });
	}

	const existingItem = deserializeUserLibraryItem(row);

	const updatedItem = {
		...existingItem,
		...req.body,
		id: existingItem.id,
		userId: existingItem.userId,
		tvmazeId: existingItem.tvmazeId,
		genres: req.body.genres ?? existingItem.genres,
		rating: Number(req.body.rating ?? existingItem.rating ?? 3),
		seasons: Number(req.body.seasons ?? existingItem.seasons ?? 1),
		isFavorite: Boolean(req.body.isFavorite ?? existingItem.isFavorite),
	};

	db.prepare(
		`
			UPDATE user_library SET
				title = @title,
				genres = @genres,
				status = @status,
				rating = @rating,
				seasons = @seasons,
				description = @description,
				poster = @poster,
				isFavorite = @isFavorite,
				createdAt = @createdAt
			WHERE id = @id AND userId = @userId
		`
	).run(serializeUserLibraryItem(updatedItem));

	res.status(200).json(updatedItem);
});

app.delete(
	"/api/my-library/:id",
	authenticateToken,
	requireAuthUser,
	(req, res) => {
		const userId = req.user.userId;
		const { id } = req.params;

		const row = db
			.prepare("SELECT * FROM user_library WHERE id = ? AND userId = ?")
			.get(id, userId);

		if (!row) {
			return res.status(404).json({ message: "Library item not found" });
		}

		const existingItem = deserializeUserLibraryItem(row);

		db.prepare("DELETE FROM user_library WHERE id = ? AND userId = ?").run(
			id,
			userId
		);

		db.prepare("DELETE FROM episode_ratings WHERE userId = ? AND tvmazeId = ?").run(
			userId,
			existingItem.tvmazeId
		);

		res.status(200).json({ message: "Series removed from your library" });
	}
);

app.get(
	"/api/my-library/:tvmazeId/episode-ratings",
	authenticateToken,
	requireAuthUser,
	(req, res) => {
		const userId = req.user.userId;
		const tvmazeId = Number(req.params.tvmazeId);

		const rows = db
			.prepare(
				`
					SELECT *
					FROM episode_ratings
					WHERE userId = ? AND tvmazeId = ?
					ORDER BY season ASC, episode ASC
				`
			)
			.all(userId, tvmazeId);

		const data = rows.map(deserializeEpisodeRating);

		res.status(200).json({
			total: data.length,
			data,
		});
	}
);

app.post(
	"/api/episode-ratings",
	authenticateToken,
	requireAuthUser,
	(req, res) => {
		const userId = req.user.userId;
		const tvmazeIdRaw = req.body?.tvmazeId;
		const episodeTitle = req.body?.episodeTitle;
		const seasonRaw = req.body?.season;
		const episodeRaw = req.body?.episode;

		if (!tvmazeIdRaw || !episodeTitle || seasonRaw === undefined || episodeRaw === undefined) {
			return res.status(400).json({
				message:
					"TVmaze id, episode title, season, and episode number are required",
			});
		}

		const tvmazeId = Number(tvmazeIdRaw);
		const season = Number(seasonRaw);
		const episode = Number(episodeRaw);

		const libraryRow = db
			.prepare("SELECT id FROM user_library WHERE userId = ? AND tvmazeId = ?")
			.get(userId, tvmazeId);

		if (!libraryRow) {
			return res.status(404).json({
				message: "Add this series to your library before rating episodes",
			});
		}

		const existingRow = db
			.prepare(
				`
					SELECT *
					FROM episode_ratings
					WHERE userId = ? AND tvmazeId = ? AND season = ? AND episode = ?
				`
			)
			.get(userId, tvmazeId, season, episode);

		if (existingRow) {
			const existingRating = deserializeEpisodeRating(existingRow);
			const updatedRating = {
				...existingRating,
				episodeTitle,
				rating: Number(req.body?.rating || 3),
				watched: Boolean(req.body?.watched),
				comment:
					req.body?.comment !== undefined ? req.body.comment : existingRating.comment,
			};

			db.prepare(
				`
					UPDATE episode_ratings SET
						episodeTitle = @episodeTitle,
						rating = @rating,
						watched = @watched,
						comment = @comment
					WHERE id = @id AND userId = @userId
				`
			).run(serializeEpisodeRating(updatedRating));

			return res.status(200).json(updatedRating);
		}

		const createdRating = {
			id: crypto.randomUUID(),
			userId,
			tvmazeId,
			episodeTitle,
			season,
			episode,
			rating: Number(req.body?.rating || 3),
			watched: Boolean(req.body?.watched),
			comment: req.body?.comment || "",
			createdAt: new Date().toISOString(),
		};

		db.prepare(
			`
				INSERT INTO episode_ratings (
					id,
					userId,
					tvmazeId,
					episodeTitle,
					season,
					episode,
					rating,
					watched,
					comment,
					createdAt
				) VALUES (
					@id,
					@userId,
					@tvmazeId,
					@episodeTitle,
					@season,
					@episode,
					@rating,
					@watched,
					@comment,
					@createdAt
				)
			`
		).run(serializeEpisodeRating(createdRating));

		res.status(201).json(createdRating);
	}
);

app.put(
	"/api/episode-ratings/:id",
	authenticateToken,
	requireAuthUser,
	(req, res) => {
		const userId = req.user.userId;
		const { id } = req.params;

		const row = db
			.prepare("SELECT * FROM episode_ratings WHERE id = ? AND userId = ?")
			.get(id, userId);

		if (!row) {
			return res.status(404).json({ message: "Episode rating not found" });
		}

		const existingRating = deserializeEpisodeRating(row);

		const updatedRating = {
			...existingRating,
			...req.body,
			id: existingRating.id,
			userId: existingRating.userId,
			tvmazeId: existingRating.tvmazeId,
			episodeTitle: req.body?.episodeTitle ?? existingRating.episodeTitle,
			season: Number(req.body?.season ?? existingRating.season),
			episode: Number(req.body?.episode ?? existingRating.episode),
			rating: Number(req.body?.rating ?? existingRating.rating),
			watched: Boolean(req.body?.watched ?? existingRating.watched),
			comment:
				req.body?.comment !== undefined ? req.body.comment : existingRating.comment,
			createdAt: req.body?.createdAt ?? existingRating.createdAt,
		};

		db.prepare(
			`
				UPDATE episode_ratings SET
					episodeTitle = @episodeTitle,
					season = @season,
					episode = @episode,
					rating = @rating,
					watched = @watched,
					comment = @comment,
					createdAt = @createdAt
				WHERE id = @id AND userId = @userId
			`
		).run(serializeEpisodeRating(updatedRating));

		res.status(200).json(updatedRating);
	}
);

app.delete(
	"/api/episode-ratings/:id",
	authenticateToken,
	requireAuthUser,
	(req, res) => {
		const userId = req.user.userId;
		const { id } = req.params;

		const row = db
			.prepare("SELECT * FROM episode_ratings WHERE id = ? AND userId = ?")
			.get(id, userId);

		if (!row) {
			return res.status(404).json({ message: "Episode rating not found" });
		}

		db.prepare("DELETE FROM episode_ratings WHERE id = ? AND userId = ?").run(
			id,
			userId
		);

		res.status(200).json({ message: "Episode rating deleted successfully" });
	}
);

app.get("/api/reviews", (req, res) => {
	const limitRaw = Number(req.query.limit);
	const skipRaw = Number(req.query.skip);
	const limit = Number.isFinite(limitRaw) && limitRaw > 0 ? Math.floor(limitRaw) : 20;
	const skip = Number.isFinite(skipRaw) && skipRaw >= 0 ? Math.floor(skipRaw) : 0;

	try {
		const rows = db
			.prepare(
				`
					SELECT
						episode_ratings.id,
						episode_ratings.userId,
						users.name AS userName,
						episode_ratings.tvmazeId,
						episode_ratings.episodeTitle,
						episode_ratings.season,
						episode_ratings.episode,
						episode_ratings.rating,
						episode_ratings.watched,
						episode_ratings.comment,
						episode_ratings.createdAt
					FROM episode_ratings
					JOIN users ON users.id = episode_ratings.userId
					WHERE TRIM(episode_ratings.comment) != ''
					ORDER BY episode_ratings.createdAt DESC
					LIMIT ? OFFSET ?
				`
			)
			.all(limit, skip);
		const countRow = db
			.prepare(
				`
					SELECT COUNT(*) AS count
					FROM episode_ratings
					WHERE TRIM(comment) != ''
				`
			)
			.get();

		res.status(200).json({
			total: countRow.count,
			limit,
			skip,
			data: rows.map((row) => ({
				...row,
				watched: Boolean(row.watched),
			})),
		});
	} catch {
		res.status(500).json({ message: "Internal server error" });
	}
});

app.get("/api/shows/:tvmazeId/reviews", (req, res) => {
	const tvmazeId = Number(req.params.tvmazeId);
	const limitRaw = Number(req.query.limit);
	const skipRaw = Number(req.query.skip);
	const limit = Number.isFinite(limitRaw) && limitRaw > 0 ? Math.floor(limitRaw) : 20;
	const skip = Number.isFinite(skipRaw) && skipRaw >= 0 ? Math.floor(skipRaw) : 0;

	try {
		const rows = db
			.prepare(
				`
					SELECT
						episode_ratings.id,
						episode_ratings.userId,
						users.name AS userName,
						episode_ratings.tvmazeId,
						episode_ratings.episodeTitle,
						episode_ratings.season,
						episode_ratings.episode,
						episode_ratings.rating,
						episode_ratings.watched,
						episode_ratings.comment,
						episode_ratings.createdAt
					FROM episode_ratings
					JOIN users ON users.id = episode_ratings.userId
					WHERE episode_ratings.tvmazeId = ?
						AND TRIM(episode_ratings.comment) != ''
					ORDER BY episode_ratings.createdAt DESC
					LIMIT ? OFFSET ?
				`
			)
			.all(tvmazeId, limit, skip);
		const countRow = db
			.prepare(
				`
					SELECT COUNT(*) AS count
					FROM episode_ratings
					WHERE tvmazeId = ? AND TRIM(comment) != ''
				`
			)
			.get(tvmazeId);

		res.status(200).json({
			tvmazeId,
			total: countRow.count,
			limit,
			skip,
			data: rows.map((row) => ({
				...row,
				watched: Boolean(row.watched),
			})),
		});
	} catch {
		res.status(500).json({ message: "Internal server error" });
	}
});

app.get("/api/discover/search", async (req, res) => {
	const q = typeof req.query.q === "string" ? req.query.q.trim() : "";

	if (!q) {
		return res.status(400).json({ message: "Search query is required" });
	}

	try {
		const response = await fetch(
			`${TVMAZE_API_BASE_URL}/search/shows?q=${encodeURIComponent(q)}`
		);

		if (!response.ok) {
			return res.status(502).json({ message: "Could not fetch shows from TVmaze" });
		}

		const raw = await response.json();
		const mappedShows = (Array.isArray(raw) ? raw : [])
			.map((item) => item?.show)
			.filter(Boolean)
			.map(mapTvmazeShow);

		res.status(200).json({
			query: q,
			total: mappedShows.length,
			data: mappedShows,
		});
	} catch {
		res.status(500).json({ message: "Internal server error" });
	}
});

app.get("/api/discover/shows/:tvmazeId", async (req, res) => {
	const { tvmazeId } = req.params;

	try {
		const response = await fetch(`${TVMAZE_API_BASE_URL}/shows/${tvmazeId}`);

		if (response.status === 404) {
			return res.status(404).json({ message: "Show not found" });
		}

		if (!response.ok) {
			return res.status(502).json({ message: "Could not fetch show from TVmaze" });
		}

		const show = await response.json();
		res.status(200).json(mapTvmazeShow(show));
	} catch {
		res.status(500).json({ message: "Internal server error" });
	}
});

app.get("/api/discover/shows/:tvmazeId/episodes", async (req, res) => {
	const { tvmazeId } = req.params;

	try {
		const response = await fetch(
			`${TVMAZE_API_BASE_URL}/shows/${tvmazeId}/episodes`
		);

		if (response.status === 404) {
			return res.status(404).json({ message: "Show episodes not found" });
		}

		if (!response.ok) {
			return res
				.status(502)
				.json({ message: "Could not fetch episodes from TVmaze" });
		}

		const raw = await response.json();
		const mappedEpisodes = (Array.isArray(raw) ? raw : []).map(mapTvmazeEpisode);

		res.status(200).json({
			tvmazeId: Number(tvmazeId),
			total: mappedEpisodes.length,
			data: mappedEpisodes,
		});
	} catch {
		res.status(500).json({ message: "Internal server error" });
	}
});

app.post("/auth/register", async (req, res) => {
	const nameRaw = req.body?.name;
	const emailRaw = req.body?.email;
	const password = req.body?.password;

	const name = typeof nameRaw === "string" ? nameRaw.trim() : "";
	const email = typeof emailRaw === "string" ? emailRaw.trim().toLowerCase() : "";

	if (!name) {
		return res.status(400).json({ message: "Name is required" });
	}

	if (!email) {
		return res.status(400).json({ message: "Email is required" });
	}

	if (!password) {
		return res.status(400).json({ message: "Password is required" });
	}

	if (String(password).length < 6) {
		return res
			.status(400)
			.json({ message: "Password must be at least 6 characters" });
	}

	const existingRow = db
		.prepare("SELECT * FROM users WHERE email = ?")
		.get(email);

	if (existingRow) {
		return res
			.status(409)
			.json({ message: "User with this email already exists" });
	}

	const passwordHash = await bcrypt.hash(String(password), 10);
	const createdAt = new Date().toISOString();

	const user = {
		id: crypto.randomUUID(),
		name,
		email,
		passwordHash,
		role: "USER",
		createdAt,
	};

	db.prepare(
		`
			INSERT INTO users (
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
		`
	).run(user);

	const token = createAuthToken(user);

	res.status(201).json({
		token,
		expiresIn: JWT_EXPIRES_IN,
		user: {
			id: user.id,
			name: user.name,
			email: user.email,
			role: user.role,
			createdAt: user.createdAt,
		},
	});
});

app.post("/auth/login", async (req, res) => {
	const emailRaw = req.body?.email;
	const password = req.body?.password;

	const email = typeof emailRaw === "string" ? emailRaw.trim().toLowerCase() : "";

	if (!email) {
		return res.status(400).json({ message: "Email is required" });
	}

	if (!password) {
		return res.status(400).json({ message: "Password is required" });
	}

	const row = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
	const user = deserializeUser(row);

	if (!user) {
		return res.status(401).json({ message: "Invalid email or password" });
	}

	let passwordMatches = false;
	const passwordValue = String(password);

	if (user.passwordHash === "admin-demo-password") {
		passwordMatches = passwordValue === "admin123";
	} else if (user.passwordHash === "user-demo-password") {
		passwordMatches = passwordValue === "user123";
	} else {
		passwordMatches = await bcrypt.compare(passwordValue, user.passwordHash);
	}

	if (!passwordMatches) {
		return res.status(401).json({ message: "Invalid email or password" });
	}

	const token = createAuthToken(user);

	res.status(200).json({
		token,
		expiresIn: JWT_EXPIRES_IN,
		user: {
			id: user.id,
			name: user.name,
			email: user.email,
			role: user.role,
			createdAt: user.createdAt,
		},
	});
});

app.get("/auth/me", authenticateToken, (req, res) => {
	const userId = req.user?.userId;

	if (!userId) {
		return res.status(401).json({ message: "Invalid or expired token" });
	}

	const row = db.prepare("SELECT * FROM users WHERE id = ?").get(userId);
	const user = deserializeUser(row);

	if (!user) {
		return res.status(404).json({ message: "User not found" });
	}

	res.status(200).json({
		user: {
			id: user.id,
			name: user.name,
			email: user.email,
			role: user.role,
			createdAt: user.createdAt,
		},
	});
});

app.get(
	"/api/protected-test",
	authenticateToken,
	requirePermission("READ"),
	(req, res) => {
		res.status(200).json({
			message: "Protected route accessed successfully",
			user: req.user,
		});
	}
);

app.get(
	"/api/series",
	authenticateToken,
	requirePermission("READ"),
	(req, res) => {
		const limitRaw = req.query.limit;
		const skipRaw = req.query.skip;

		const limit =
			limitRaw === undefined || Number.isNaN(Number(limitRaw))
				? 10
				: Number(limitRaw);
		const skip =
			skipRaw === undefined || Number.isNaN(Number(skipRaw))
				? 0
				: Number(skipRaw);
		const rows = db
			.prepare(
				"SELECT * FROM series ORDER BY createdAt DESC LIMIT ? OFFSET ?"
			)
			.all(limit, skip);
		const countRow = db.prepare("SELECT COUNT(*) AS count FROM series").get();

		res.status(200).json({
			total: countRow.count,
			limit,
			skip,
			data: rows.map(deserializeSeries),
		});
	}
);

app.get(
	"/api/series/:id",
	authenticateToken,
	requirePermission("READ"),
	(req, res) => {
		const { id } = req.params;
		const row = db.prepare("SELECT * FROM series WHERE id = ?").get(id);

		if (!row) {
			return res.status(404).json({ message: "Series not found" });
		}

		res.status(200).json(deserializeSeries(row));
	}
);

app.post(
	"/api/series",
	authenticateToken,
	requirePermission("WRITE"),
	(req, res) => {
		if (!req.body?.title) {
			return res.status(400).json({ message: "Title is required" });
		}

		const newSeries = {
			id: crypto.randomUUID(),
			title: req.body.title,
			genres: req.body.genres || [],
			status: req.body.status || "Plan to Watch",
			rating: Number(req.body.rating || 3),
			seasons: Number(req.body.seasons || 1),
			description: req.body.description || "No description added yet.",
			poster: req.body.poster || "🎬",
			isFavorite: Boolean(req.body.isFavorite),
			createdAt: new Date().toISOString(),
			episodes: req.body.episodes || [],
		};
		db.prepare(
			`
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
			`
		).run(serializeSeries(newSeries));

		res.status(201).json(newSeries);
	}
);

app.put(
	"/api/series/:id",
	authenticateToken,
	requirePermission("WRITE"),
	(req, res) => {
		const { id } = req.params;
		const row = db.prepare("SELECT * FROM series WHERE id = ?").get(id);

		if (!row) {
			return res.status(404).json({ message: "Series not found" });
		}

		const existingSeries = deserializeSeries(row);

		const updatedSeries = {
			...existingSeries,
			...req.body,
			id: existingSeries.id,
			genres: req.body.genres ?? existingSeries.genres,
			episodes: req.body.episodes ?? existingSeries.episodes,
		};

		db.prepare(
			`
				UPDATE series SET
					title = @title,
					genres = @genres,
					status = @status,
					rating = @rating,
					seasons = @seasons,
					description = @description,
					poster = @poster,
					isFavorite = @isFavorite,
					createdAt = @createdAt,
					episodes = @episodes
				WHERE id = @id
			`
		).run(serializeSeries(updatedSeries));

		res.status(200).json(updatedSeries);
	}
);

app.delete(
	"/api/series/:id",
	authenticateToken,
	requirePermission("DELETE"),
	(req, res) => {
		const { id } = req.params;
		const row = db.prepare("SELECT * FROM series WHERE id = ?").get(id);

		if (!row) {
			return res.status(404).json({ message: "Series not found" });
		}

		db.prepare("DELETE FROM series WHERE id = ?").run(id);
		res.status(200).json({ message: "Series deleted successfully" });
	}
);

app.get("/api/public-series", (req, res) => {
	const rows = db.prepare("SELECT * FROM series ORDER BY createdAt DESC").all();

	res.status(200).json({
		total: rows.length,
		data: rows.map(deserializeSeries),
	});
});

app.listen(PORT, () => {
	console.log(`LazyGarfield API running on http://localhost:${PORT}`);
});
