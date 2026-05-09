import express from "express";
import cors from "cors";

const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
	res.status(200).json({
		message: "LazyGarfield API is running",
		documentation: `http://localhost:${PORT}/api-docs`,
	});
});

app.listen(PORT, () => {
	console.log(`LazyGarfield API running on http://localhost:${PORT}`);
});
