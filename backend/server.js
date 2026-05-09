import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import swaggerUi from "swagger-ui-express";
import * as crypto from "node:crypto";

const app = express();
const PORT = 4000;
const JWT_SECRET = "lazygarfield_super_secret_demo_key";

let series = [
	{
		id: "1",
		title: "Dark",
		genres: ["Sci-Fi", "Thriller", "Mystery"],
		status: "Completed",
		rating: 9.0,
		seasons: 3,
		description:
			"A mind-bending mystery where time travel connects four families across generations in a small German town.",
		poster: "🕰️",
		isFavorite: true,
		createdAt: "2026-05-09T00:00:00.000Z",
		episodes: [],
	},
	{
		id: "2",
		title: "Gossip Girl",
		genres: ["Drama", "Romance"],
		status: "Completed",
		rating: 7.5,
		seasons: 6,
		description:
			"A scandal blog fuels secrets and rivalries among privileged teens on Manhattan’s Upper East Side.",
		poster: "💋",
		isFavorite: false,
		createdAt: "2026-05-09T00:00:00.000Z",
		episodes: [],
	},
	{
		id: "3",
		title: "The Crown",
		genres: ["Drama", "History"],
		status: "Completed",
		rating: 8.6,
		seasons: 6,
		description:
			"A historical drama following the reign of Queen Elizabeth II and the events that shaped modern Britain.",
		poster: "👑",
		isFavorite: false,
		createdAt: "2026-05-09T00:00:00.000Z",
		episodes: [],
	},
	{
		id: "4",
		title: "The Queen's Gambit",
		genres: ["Drama"],
		status: "Completed",
		rating: 8.6,
		seasons: 1,
		description:
			"A chess prodigy rises to fame while battling addiction and the pressure of competition.",
		poster: "♟️",
		isFavorite: true,
		createdAt: "2026-05-09T00:00:00.000Z",
		episodes: [],
	},
	{
		id: "5",
		title: "Game of Thrones",
		genres: ["Fantasy", "Drama", "Adventure"],
		status: "Completed",
		rating: 9.2,
		seasons: 8,
		description:
			"Noble families clash for the Iron Throne as ancient threats awaken beyond the Wall.",
		poster: "🐉",
		isFavorite: true,
		createdAt: "2026-05-09T00:00:00.000Z",
		episodes: [],
	},
	{
		id: "6",
		title: "The Vampire Diaries",
		genres: ["Fantasy", "Drama", "Romance"],
		status: "Completed",
		rating: 7.7,
		seasons: 8,
		description:
			"A teen’s life changes when two vampire brothers return to a small town filled with supernatural secrets.",
		poster: "🩸",
		isFavorite: false,
		createdAt: "2026-05-09T00:00:00.000Z",
		episodes: [],
	},
	{
		id: "7",
		title: "Sherlock",
		genres: ["Crime", "Mystery", "Drama"],
		status: "Completed",
		rating: 9.1,
		seasons: 4,
		description:
			"A modern take on Sherlock Holmes as he solves cases in London with Dr. Watson.",
		poster: "🔎",
		isFavorite: true,
		createdAt: "2026-05-09T00:00:00.000Z",
		episodes: [],
	},
	{
		id: "8",
		title: "House of Cards",
		genres: ["Drama", "Thriller", "Politics"],
		status: "Completed",
		rating: 8.6,
		seasons: 1,
		description:
			"A ruthless politician schemes for power in Washington, D.C. Watched only season 1.",
		poster: "🏛️",
		isFavorite: false,
		createdAt: "2026-05-09T00:00:00.000Z",
		episodes: [],
	},
	{
		id: "9",
		title: "Black Mirror",
		genres: ["Sci-Fi", "Thriller", "Drama"],
		status: "Completed",
		rating: 8.7,
		seasons: 6,
		description:
			"An anthology series exploring the dark side of technology and modern society.",
		poster: "🪞",
		isFavorite: true,
		createdAt: "2026-05-09T00:00:00.000Z",
		episodes: [],
	},
];

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

		const paginatedSeries = series.slice(skip, skip + limit);

		res.status(200).json({
			total: series.length,
			limit,
			skip,
			data: paginatedSeries,
		});
	}
);

app.get(
	"/api/series/:id",
	authenticateToken,
	requirePermission("READ"),
	(req, res) => {
		const { id } = req.params;
		const found = series.find((s) => s.id === id);

		if (!found) {
			return res.status(404).json({ message: "Series not found" });
		}

		res.status(200).json(found);
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

		series.unshift(newSeries);

		res.status(201).json(newSeries);
	}
);

app.put(
	"/api/series/:id",
	authenticateToken,
	requirePermission("WRITE"),
	(req, res) => {
		const { id } = req.params;
		const index = series.findIndex((s) => s.id === id);

		if (index === -1) {
			return res.status(404).json({ message: "Series not found" });
		}

		const updatedSeries = {
			...series[index],
			...req.body,
			id: series[index].id,
		};

		series[index] = updatedSeries;
		res.status(200).json(updatedSeries);
	}
);

app.delete(
	"/api/series/:id",
	authenticateToken,
	requirePermission("DELETE"),
	(req, res) => {
		const { id } = req.params;
		const index = series.findIndex((s) => s.id === id);

		if (index === -1) {
			return res.status(404).json({ message: "Series not found" });
		}

		series.splice(index, 1);
		res.status(200).json({ message: "Series deleted successfully" });
	}
);

app.get("/api/public-series", (req, res) => {
	res.status(200).json({
		total: series.length,
		data: series,
	});
});

app.listen(PORT, () => {
	console.log(`LazyGarfield API running on http://localhost:${PORT}`);
});
