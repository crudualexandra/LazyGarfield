import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import swaggerUi from "swagger-ui-express";
import * as crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { db, deserializeUser, serializeSeries, deserializeSeries } from "./db.js";

const app = express();
const PORT = 4000;
const JWT_SECRET = "lazygarfield_super_secret_demo_key";

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

function createAuthToken(user) {
	return jwt.sign(
		{
			userId: user.id,
			email: user.email,
			role: user.role,
		},
		JWT_SECRET,
		{ expiresIn: "1m" }
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
		{ expiresIn: "1m" }
	);

	res.status(200).json({
		token,
		expiresIn: "1 minute",
		role,
		permissions,
	});
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
