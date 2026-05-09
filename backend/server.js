import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";

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
		poster: "/posters/dark.jpg",
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
		poster: "/posters/gossip-girl.jpg",
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
		poster: "/posters/the-crown.jpg",
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
		poster: "/posters/the-queens-gambit.jpg",
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
		poster: "/posters/game-of-thrones.jpg",
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
		poster: "/posters/the-vampire-diaries.jpg",
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
		poster: "/posters/sherlock.jpg",
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
		poster: "/posters/house-of-cards.jpg",
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
		poster: "/posters/black-mirror.jpg",
		isFavorite: true,
		createdAt: "2026-05-09T00:00:00.000Z",
		episodes: [],
	},
];

app.use(cors());
app.use(express.json());

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

app.get("/api/public-series", (req, res) => {
	res.status(200).json({
		total: series.length,
		data: series,
	});
});

app.listen(PORT, () => {
	console.log(`LazyGarfield API running on http://localhost:${PORT}`);
});
