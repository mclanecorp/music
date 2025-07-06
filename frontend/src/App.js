import React, { useState, useRef, useEffect } from "react";
import "./App.css";

const API_BASE_URL =
  process.env.REACT_APP_API_URL || "https://music-tka8.onrender.com";

function App() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [view, setView] = useState("search"); // 'search' or 'favorites'
  const [currentFavoriteIndex, setCurrentFavoriteIndex] = useState(-1); // -1 means no favorite is playing
  const audioRef = useRef(null);

  useEffect(() => {
    fetchFavorites();
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.onended = () => {
        if (view === "favorites" && currentFavoriteIndex !== -1) {
          playNextFavorite();
        }
      };
    }
  }, [currentFavoriteIndex, view]);

  const fetchFavorites = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/favorites`);
      const data = await response.json();
      setFavorites(data);
    } catch (error) {
      console.error("Error fetching favorites:", error);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery) return;

    try {
      const response = await fetch(`${API_BASE_URL}/search?q=${searchQuery}`);
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error("Error searching for music:", error);
    }
  };

  const handlePlay = (track) => {
    setCurrentTrack(track);
    if (audioRef.current) {
      audioRef.current.src = `${API_BASE_URL}/stream/${track.videoId}`;
      audioRef.current.play();
    }
    // Reset favorite index if playing from search results
    if (view === "search") {
      setCurrentFavoriteIndex(-1);
    }
  };

  const handleToggleFavorite = async (track) => {
    const isFavorited = favorites.some((fav) => fav.videoId === track.videoId);
    if (isFavorited) {
      try {
        await fetch(`${API_BASE_URL}/favorites/${track.videoId}`, {
          method: "DELETE",
        });
        fetchFavorites(); // Refresh favorites list
      } catch (error) {
        console.error("Error removing from favorites:", error);
      }
    } else {
      try {
        console.log("Adding favorite:", {
          videoId: track.videoId,
          name: track.title,
          thumbnail: track.thumbnail,
        });
        await fetch(`${API_BASE_URL}/favorites`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            videoId: track.videoId,
            name: track.title,
            thumbnail: track.thumbnail,
          }),
        });
        fetchFavorites(); // Refresh favorites list
      } catch (error) {
        console.error("Error adding to favorites:", error);
      }
    }
  };

  const handlePlayAllFavorites = () => {
    if (favorites.length > 0) {
      setCurrentFavoriteIndex(0);
      handlePlay(favorites[0]);
    }
  };

  const playNextFavorite = () => {
    const nextIndex = currentFavoriteIndex + 1;
    if (nextIndex < favorites.length) {
      setCurrentFavoriteIndex(nextIndex);
      handlePlay(favorites[nextIndex]);
    } else {
      // End of playlist
      setCurrentFavoriteIndex(-1);
      setCurrentTrack(null);
    }
  };

  const renderTrackList = (tracks) => (
    <div className="list-group">
      {tracks.map((track) => {
        const isFavorited = favorites.some(
          (fav) => fav.videoId === track.videoId
        );
        return (
          <div
            key={track.videoId}
            className="list-group-item d-flex justify-content-between align-items-center"
          >
            <button
              type="button"
              className={`list-group-item-action flex-grow-1 ${
                currentTrack?.videoId === track.videoId ? "active" : ""
              }`}
              onClick={() => handlePlay(track)}
              style={{
                border: "none",
                background: "none",
                textAlign: "left",
                padding: "0",
                display: "flex",
                alignItems: "center",
              }}
            >
              <img
                src={track.thumbnail}
                alt={track.title}
                style={{
                  width: "100px",
                  marginRight: "10px",
                  borderRadius: "5px",
                }}
              />
              <span>{track.title}</span>
              {track.duration && (
                <span style={{ marginLeft: "10px", color: "#b3b3b3" }}>
                  {track.duration}
                </span>
              )}
            </button>
            <button
              className="btn btn-link p-0"
              onClick={() => handleToggleFavorite(track)}
              style={{ color: isFavorited ? "#1db954" : "#b3b3b3" }} // Spotify green for favorited, light grey for not
            >
              <i
                className={`bi ${isFavorited ? "bi-heart-fill" : "bi-heart"}`}
                style={{ fontSize: "1.5rem" }}
              ></i>
            </button>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="container mt-5">
      <h1 className="mb-4">Music Streamer</h1>

      <div className="mb-3">
        <button
          className="btn btn-secondary me-2"
          onClick={() => setView("search")}
        >
          Search
        </button>
        <button
          className="btn btn-secondary"
          onClick={() => setView("favorites")}
        >
          Favorites
        </button>
      </div>

      {view === "search" && (
        <>
          <form onSubmit={handleSearch}>
            <div className="input-group mb-3">
              <input
                type="text"
                className="form-control"
                placeholder="Enter a song name"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button className="btn btn-primary" type="submit">
                Search
              </button>
            </div>
          </form>
          {renderTrackList(searchResults)}
        </>
      )}

      {view === "favorites" && (
        <>
          <h2>My Favorites</h2>
          {favorites.length > 0 ? (
            <>
              <button
                className="btn btn-primary mb-3"
                onClick={handlePlayAllFavorites}
              >
                Play All Favorites
              </button>
              {renderTrackList(favorites)}
            </>
          ) : (
            <p>No favorites yet.</p>
          )}
        </>
      )}

      {currentTrack && (
        <div className="mt-4">
          <h2>Now Playing: {currentTrack.title}</h2>
          <audio controls ref={audioRef} className="w-100">
            Your browser does not support the audio element.
          </audio>
        </div>
      )}
    </div>
  );
}

export default App;
