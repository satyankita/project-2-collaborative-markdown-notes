import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import noteRoutes from "./routes/noteRoutes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.get("/", (req, res) => {
  res.json({ message: "Collaborative Markdown Notes API is running!" });
});

app.use("/api/notes", noteRoutes);

const startServer = async () => {
  await connectDB();

  const PORT = process.env.PORT || 5001;

  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
};

startServer();
