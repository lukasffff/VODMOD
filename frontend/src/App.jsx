
import { useEffect, useState } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  Crosshair,
  Brain,
  Clock
} from "lucide-react";
import "./App.css";

// Ascent map positions.
// Coordinates represent percentages of the map image.

const ascentLocations = {
  "Attacker Spawn": { x: 84.0, y: 43.9 },
  "Defender Spawn": { x: 14.0, y: 58.1 },

  "A Site": { x: 32.8, y: 85.1 },
  "A Main": { x: 49.8, y: 81.3 },
  "A Lobby": { x: 61.5, y: 75.0 },
  "A Tree": { x: 40.4, y: 71.9 },
  "A Garden": { x: 28.2, y: 66.0 },
  "A Window": { x: 25.5, y: 73.0 },
  "A Rafters": { x: 25.4, y: 86.8 },
  "A Wine": { x: 49.9, y: 95.5 },

  "B Site": { x: 24.8, y: 17.9 },
  "B Main": { x: 40.8, y: 28.9 },
  "B Lobby": { x: 58.1, y: 29.3 },
  "B Boat House": { x: 27.6, y: 11.3 },

  "Mid Bottom": { x: 41.1, y: 51.2 },
  "Mid Courtyard": { x: 50.4, y: 50.0 },
  "Mid Market": { x: 30.3, y: 46.7 },
  "Mid Link": { x: 52.6, y: 39.7 },
  "Mid Catwalk": { x: 55.4, y: 60.1 },
  "Mid Cubby": { x: 47.3, y: 68.0 },
  "Mid Pizza": { x: 31.5, y: 56.3 },
  "Mid Top": { x: 68.0, y: 63.0 }
};

// Sample replay data.
// Each frame represents a moment in the round.

const replay = [
  {
    time: 0,
    event: "Round begins",
    description: "Both teams begin moving into position.",
    coach: "Watch how your team spreads across the map.",
    players: [
      { id: "YOU", location: "Attacker Spawn", team: "friendly" },
      { id: "ALLY 2", location: "Mid Top", team: "friendly" },
      { id: "ALLY 3", location: "A Lobby", team: "friendly" },
      { id: "ENEMY 1", location: "Defender Spawn", team: "enemy" },
      { id: "ENEMY 2", location: "B Main", team: "enemy" }
    ]
  },
  {
    time: 4,
    event: "Team advances",
    description: "Your team begins moving toward the site.",
    coach: "Your teammates are moving together. Stay close enough to support their entry.",
    players: [
      { id: "YOU", location: "A Lobby", team: "friendly" },
      { id: "ALLY 2", location: "Mid Courtyard", team: "friendly" },
      { id: "ALLY 3", location: "A Main", team: "friendly" },
      { id: "ENEMY 1", location: "Mid Market", team: "enemy" },
      { id: "ENEMY 2", location: "B Main", team: "enemy" }
    ]
  },
  {
    time: 8,
    event: "Enemy spotted",
    description: "An enemy appears near the site entrance.",
    coach: "An enemy has been spotted. Consider whether you have teammate support before taking the fight.",
    players: [
      { id: "YOU", location: "A Main", team: "friendly" },
      { id: "ALLY 2", location: "Mid Courtyard", team: "friendly" },
      { id: "ALLY 3", location: "A Lobby", team: "friendly" },
      { id: "ENEMY 1", location: "A Site", team: "enemy" },
      { id: "ENEMY 2", location: "B Main", team: "enemy" }
    ]
  },
  {
    time: 12,
    event: "First engagement",
    description: "You move forward while your teammates remain behind.",
    coach: "You are beginning to separate from your teammates. This could leave you isolated if another defender appears.",
    players: [
      { id: "YOU", location: "A Site", team: "friendly" },
      { id: "ALLY 2", location: "Mid Courtyard", team: "friendly" },
      { id: "ALLY 3", location: "A Lobby", team: "friendly" },
      { id: "ENEMY 1", location: "A Site", team: "enemy" },
      { id: "ENEMY 2", location: "B Main", team: "enemy" }
    ]
  },
  {
    time: 16,
    event: "Player eliminated",
    description: "You are eliminated while separated from your team.",
    coach: "Your forward movement created an isolated fight. Waiting for teammate support may have given you a better chance.",
    players: [
      { id: "YOU", location: "A Site", team: "dead" },
      { id: "ALLY 2", location: "Mid Courtyard", team: "friendly" },
      { id: "ALLY 3", location: "A Lobby", team: "friendly" },
      { id: "ENEMY 1", location: "A Site", team: "enemy" },
      { id: "ENEMY 2", location: "B Main", team: "enemy" }
    ]
  },
  {
    time: 20,
    event: "Round continues",
    description: "Your surviving teammates continue the round.",
    coach: "Focus on maintaining trading distance with teammates in future engagements.",
    players: [
      { id: "YOU", location: "A Site", team: "dead" },
      { id: "ALLY 2", location: "A Main", team: "friendly" },
      { id: "ALLY 3", location: "A Lobby", team: "friendly" },
      { id: "ENEMY 1", location: "A Site", team: "enemy" },
      { id: "ENEMY 2", location: "B Main", team: "enemy" }
    ]
  }
];

function App() {
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const frame = replay[currentFrame];

  // Automatically advance the replay while playing.
  useEffect(() => {
    if (!isPlaying) {
      return;
    }

    const timer = setTimeout(() => {
      if (currentFrame === replay.length - 1) {
        setIsPlaying(false);
      } else {
        setCurrentFrame(currentFrame + 1);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [isPlaying, currentFrame]);

  function togglePlayback() {
    if (currentFrame === replay.length - 1 && !isPlaying) {
      setCurrentFrame(0);
    }

    setIsPlaying(!isPlaying);
  }

  function restartReplay() {
    setIsPlaying(false);
    setCurrentFrame(0);
  }

  function changeTimeline(event) {
    setIsPlaying(false);
    setCurrentFrame(Number(event.target.value));
  }

  return (
    <div className="app">
      <nav className="navbar">
        <h1 className="logo">
          VODMOD<span>.</span>
        </h1>
        <p>REPLAY ANALYSIS SYSTEM</p>
      </nav>

      <main className="main-content">
        <section className="page-heading">
          <div>
            <p className="eyebrow">MATCH REVIEW</p>
            <h2>Replay Analysis</h2>
            <p className="muted">
              Review your decisions. Understand your gameplay.
            </p>
          </div>

          <div className="match-status">
            SIMULATED REPLAY
          </div>
        </section>

        <section className="replay-layout">

          {/* Replay map and timeline */}
          <div className="replay-panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">TACTICAL VIEW</p>
                <h3>Ascent</h3>
              </div>

              <span className="round-label">
                ROUND 08
              </span>
            </div>

            <div className="map-container">
              <div className="map-stage">
                <img
                  src="/maps/ascent.png"
                  alt="VALORANT Ascent minimap"
                  className="ascent-map"
                />

                <div className="player-layer">
                  {frame.players.map((player) => {
                    const position =
                      ascentLocations[player.location];

                    return (
                      <div
                        key={player.id}
                        className={`player-marker ${player.team}`}
                        style={{
                          left: `${position.x}%`,
                          top: `${position.y}%`
                        }}
                      >
                        <span>{player.id}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="map-legend">
                <span>
                  <i className="legend-dot friendly-dot" />
                  Your team
                </span>

                <span>
                  <i className="legend-dot enemy-dot" />
                  Enemies
                </span>

                <span>
                  <i className="legend-dot dead-dot" />
                  Eliminated
                </span>
              </div>
            </div>

            {/* Timeline controls */}
            <div className="timeline-section">
              <div className="timeline-header">
                <span>
                  <Clock size={14} />
                  REPLAY TIMELINE
                </span>

                <strong>{frame.time}s / 20s</strong>
              </div>

              <input
                type="range"
                min="0"
                max={replay.length - 1}
                value={currentFrame}
                onChange={changeTimeline}
                className="timeline-slider"
              />

              <div className="timeline-labels">
                <span>0:00</span>
                <span>0:10</span>
                <span>0:20</span>
              </div>

              <div className="playback-controls">
                <button
                  onClick={restartReplay}
                  className="control-button"
                >
                  <RotateCcw size={17} />
                </button>

                <button
                  onClick={togglePlayback}
                  className="play-button"
                >
                  {isPlaying
                    ? <Pause size={18} />
                    : <Play size={18} />}

                  {isPlaying ? "Pause" : "Play Replay"}
                </button>

                <span className="frame-counter">
                  FRAME {currentFrame + 1} / {replay.length}
                </span>
              </div>
            </div>
          </div>

          {/* Coaching and match information */}
          <aside className="analysis-panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">AI COACH</p>
                <h3>Match Insights</h3>
              </div>

              <Brain color="#ff4655" size={22} />
            </div>

            <div className="event-card">
              <span className="event-label">
                CURRENT EVENT
              </span>

              <h3>{frame.event}</h3>

              <p>{frame.description}</p>

              <span className="event-time">
                {frame.time} SECONDS
              </span>
            </div>

            <div className="coach-card">
              <div className="coach-title">
                <Crosshair size={18} />
                <h3>Coaching Insight</h3>
              </div>

              <p>{frame.coach}</p>
            </div>

            <div className="player-stats">
              <p className="eyebrow">PLAYER STATUS</p>

              <div className="status-row">
                <span>Your position</span>
                <strong>
                  {frame.players[0].team === "dead"
                    ? "Eliminated"
                    : frame.players[0].location}
                </strong>
              </div>

              <div className="status-row">
                <span>Teammates alive</span>
                <strong>
                  {frame.players.filter(
                    (player) => player.team === "friendly"
                  ).length}
                </strong>
              </div>

              <div className="status-row">
                <span>Replay events</span>
                <strong>{currentFrame + 1}</strong>
              </div>
            </div>
          </aside>
        </section>

        <section className="bottom-note">
          <Brain size={20} />

          <div>
            <strong>
              VODMOD is learning from your gameplay.
            </strong>

            <p>
              This is a replay prototype.
              Player positions and coaching responses
              are currently examples and not real gameplay.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;