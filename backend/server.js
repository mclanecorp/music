const express = require("express");
const ytdl = require("@nuclearplayer/ytdl-core");
const ytsr = require("@distube/ytsr");
const cors = require("cors");
const Database = require("better-sqlite3");

const app = express();
const port = process.env.PORT || 3001;

app.use(cors()); // Temporarily allow all origins for debugging
app.use(express.json()); // To parse JSON request bodies

// Initialize SQLite Database
const db = new Database("favorites.db", { verbose: console.log });

db.exec(`
  CREATE TABLE IF NOT EXISTS favorites (
    videoId TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    thumbnail TEXT
  );
`);

// Search Endpoint
app.get("/search", async (req, res) => {
  try {
    const searchQuery = req.query.q;
    if (!searchQuery) {
      return res.status(400).send('Query parameter "q" is required');
    }
    const searchResults = await ytsr(searchQuery, { limit: 10 });
    const items = searchResults.items
      .filter((item) => item.type === "video")
      .map((item) => ({
        title: item.name,
        videoId: item.id,
        thumbnail: item.thumbnail,
        duration: item.duration,
      }));
    res.json(items);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error searching for music");
  }
});

// Stream Endpoint
app.get("/stream/:videoId", async (req, res) => {
  try {
    const videoId = req.params.videoId;
    if (!ytdl.validateID(videoId)) {
      return res.status(400).send("Invalid video ID");
    }
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

    res.setHeader("Content-Type", "audio/mpeg");

    ytdl(videoUrl, { filter: "audioonly" }).pipe(res);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error streaming audio");
  }
});

// Favorites Endpoints
app.get("/favorites", (req, res) => {
  try {
    const favorites = db.prepare("SELECT * FROM favorites").all();
    res.json(favorites);
    console.log("Fetched favorites:", favorites);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching favorites");
  }
});

app.post("/favorites", (req, res) => {
  try {
    const { videoId, name, thumbnail } = req.body;
    if (!videoId || !name) {
      return res.status(400).send("videoId and name are required");
    }
    const stmt = db.prepare(
      "INSERT OR IGNORE INTO favorites (videoId, title, thumbnail) VALUES (?, ?, ?)"
    );
    stmt.run(videoId, name, thumbnail);
    res.status(201).send("Added to favorites");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error adding to favorites");
  }
});

app.delete("/favorites/:videoId", (req, res) => {
  try {
    const videoId = req.params.videoId;
    const stmt = db.prepare("DELETE FROM favorites WHERE videoId = ?");
    stmt.run(videoId);
    res.status(200).send("Removed from favorites");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error removing from favorites");
  }
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
