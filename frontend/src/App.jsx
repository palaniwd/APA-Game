import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { AnimatePresence } from 'framer-motion';
import Board from './Board';
import GameRules from './GameRules';
import useSoundEffects from './useSoundEffects';
import './App.css';

const API_BASE = 'http://localhost:8000';

function App() {
  const [gameState, setGameState] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [connectionError, setConnectionError] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Sound effects hook
  const sounds = useSoundEffects(soundEnabled);

  // Fetch initial state
  useEffect(() => {
    fetchState();
  }, []);

  const fetchState = async () => {
    try {
      setConnectionError(false);
      const res = await axios.get(`${API_BASE}/state`);
      setGameState(res.data);
      console.log("Game State:", res.data);
    } catch (err) {
      console.error("Error fetching state:", err);
      setConnectionError(true);
      setMessage("Error connecting to game server. Please ensure the backend is running.");
    }
  };

  const handleNewGame = async () => {
    try {
      setLoading(true);
      await axios.post(`${API_BASE}/new-game`);
      setGameState(null);
      setSelectedNode(null);
      setMessage('');
      sounds.newGame();
      await fetchState();
    } catch (err) {
      console.error("Error starting new game:", err);
      setMessage("Failed to start new game.");
      sounds.invalid();
    } finally {
      setLoading(false);
    }
  };

  const executeMove = useCallback(async (payload) => {
    try {
      setLoading(true);
      const res = await axios.post(`${API_BASE}/move`, payload);
      setGameState(res.data);
      setSelectedNode(null);
      setMessage('');

      // Play sound based on move type
      if (payload.type === 'PLACE') {
        sounds.placeGoat();
      } else if (payload.capture_node) {
        sounds.capture();
      } else if (gameState.turn === 'T') {
        sounds.moveTiger();
      } else {
        sounds.moveGoat();
      }
    } catch (err) {
      if (err.response?.data?.detail) {
        setMessage(`Invalid Move: ${err.response.data.detail}`);
        sounds.invalid();
      } else {
        setMessage("Invalid Move");
        sounds.invalid();
      }
    } finally {
      setLoading(false);
    }
  }, [gameState, sounds]);

  const handleNodeClick = useCallback(async (nodeId) => {
    if (!gameState || gameState.winner) return;

    const { turn, goats_placed, board, valid_moves } = gameState;
    const isPhaseOne = goats_placed < 15;
    const occupant = board[String(nodeId)];

    // Goat's turn
    if (turn === 'G') {
      if (isPhaseOne) {
        // Phase 1: Place goat on empty node
        if (occupant === null) {
          await executeMove({ type: 'PLACE', to_node: nodeId });
        } else {
          setMessage("This spot is occupied! Choose an empty node.");
        }
      } else {
        // Phase 2: Select and move goat
        if (occupant === 'G') {
          setSelectedNode(nodeId);
          setMessage(`Goat at position ${nodeId + 1} selected. Click an adjacent empty spot.`);
        } else if (selectedNode !== null && occupant === null) {
          await executeMove({ type: 'MOVE', from_node: selectedNode, to_node: nodeId });
        } else if (occupant === 'T') {
          setMessage("You can't select a Tiger! Select your Goat.");
        }
      }
    }
    // Tiger's turn
    else if (turn === 'T') {
      if (occupant === 'T') {
        setSelectedNode(nodeId);
        setMessage(`Tiger at position ${nodeId + 1} selected. Click to move or capture.`);
      } else if (selectedNode !== null && occupant === null) {
        // Find the matching valid move
        const move = valid_moves.find(
          m => m.from === selectedNode && m.to === nodeId
        );

        if (move) {
          await executeMove({
            type: move.type,
            from_node: selectedNode,
            to_node: nodeId,
            capture_node: move.capture
          });
        } else {
          setMessage("Invalid move. Tigers can only move to adjacent empty spaces or jump over goats.");
        }
      } else if (occupant === 'G') {
        setMessage("You can't move to a Goat's position! Select a Tiger first.");
      }
    }
  }, [gameState, selectedNode, executeMove]);

  const handleAIMove = async () => {
    if (!gameState || gameState.winner) return;

    try {
      setLoading(true);
      setMessage('AI is thinking...');

      const res = await axios.get(`${API_BASE}/ai-move?player=${gameState.turn}`);
      const move = res.data;

      const payload = {
        type: move.type,
        from_node: move.from,
        to_node: move.to,
        capture_node: move.capture
      };

      const moveRes = await axios.post(`${API_BASE}/move`, payload);
      setGameState(moveRes.data);
      setSelectedNode(null);

      // Play sound based on move type
      if (payload.type === 'PLACE') {
        sounds.placeGoat();
      } else if (payload.capture_node) {
        sounds.capture();
      } else if (gameState.turn === 'T') {
        sounds.moveTiger();
      } else {
        sounds.moveGoat();
      }

      const moveDesc = move.type === 'CAPTURE'
        ? `AI captured a goat!`
        : move.type === 'PLACE'
          ? `AI placed at position ${move.to + 1}`
          : `AI moved from ${move.from + 1} to ${move.to + 1}`;
      setMessage(moveDesc);
    } catch (err) {
      console.error("AI Error:", err);
      setMessage("AI couldn't find a move.");
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (!gameState && !connectionError) {
    return (
      <div className="app-container loading-screen">
        <div className="loading-content">
          <div className="loading-spinner"></div>
          <h2>Loading Aadu Puli Aattam...</h2>
        </div>
      </div>
    );
  }

  // Connection error state
  if (connectionError) {
    return (
      <div className="app-container error-screen">
        <div className="error-content">
          <h1>🐯 Aadu Puli Aattam 🐐</h1>
          <div className="error-message">
            <p>Unable to connect to game server.</p>
            <p>Please ensure the backend is running on port 8000.</p>
          </div>
          <button onClick={fetchState} className="btn btn-primary">
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  const { turn, goats_placed, goats_captured, winner } = gameState;
  const goatsRemaining = 15 - goats_placed;
  const isPhaseOne = goats_placed < 15;

  return (
    <div className="app-container">
      {/* Header */}
      <header className="game-header">
        <h1 className="game-title">
          <span className="tiger-emoji">🐯</span>
          Aadu Puli Aattam
          <span className="goat-emoji">🐐</span>
        </h1>
        <p className="game-subtitle">The Ancient Game of Tigers & Goats</p>
      </header>

      {/* Game Status Panel */}
      <div className="game-status-panel">
        {/* Turn Indicator */}
        <div className={`turn-indicator ${turn === 'T' ? 'tiger-turn' : 'goat-turn'}`}>
          <span className="turn-label">Current Turn:</span>
          <span className="turn-value">
            {turn === 'T' ? '🐯 Tiger (Puli)' : '🐐 Goat (Aadu)'}
          </span>
        </div>

        {/* Game Phase */}
        <div className="phase-indicator">
          {isPhaseOne ? (
            <span className="phase-badge phase-one">Phase 1: Placement</span>
          ) : (
            <span className="phase-badge phase-two">Phase 2: Movement</span>
          )}
        </div>

        {/* Stats Row */}
        <div className="stats-row">
          {/* Goats to Place */}
          <div className="stat-box">
            <span className="stat-label">Goats to Place</span>
            <div className="stat-value goats-remaining">
              {Array.from({ length: Math.min(goatsRemaining, 5) }).map((_, i) => (
                <span key={i} className="mini-goat">🐐</span>
              ))}
              {goatsRemaining > 5 && <span className="stat-extra">+{goatsRemaining - 5}</span>}
              {goatsRemaining === 0 && <span className="stat-complete">✓ All Placed</span>}
            </div>
          </div>

          {/* Goats Placed */}
          <div className="stat-box">
            <span className="stat-label">Goats Placed</span>
            <span className="stat-number">{goats_placed} / 15</span>
          </div>

          {/* Captured Goats */}
          <div className="stat-box captured-stats">
            <span className="stat-label">Captured</span>
            <div className="captured-goats">
              {Array.from({ length: goats_captured }).map((_, i) => (
                <span key={i} className="captured-goat">🐐</span>
              ))}
              {goats_captured === 0 && <span className="stat-none">-</span>}
              <span className="capture-count">{goats_captured} / 5</span>
            </div>
          </div>
        </div>
      </div>

      {/* Message Display */}
      {message && (
        <div className="message-bar">
          {message}
        </div>
      )}

      {/* Game Board */}
      <div className="board-wrapper">
        <Board
          boardState={gameState.board}
          onSafeClick={handleNodeClick}
          validMoves={gameState.valid_moves}
          selectedNode={selectedNode}
        />
      </div>

      {/* Selected Node Info */}
      {selectedNode !== null && (
        <div className="selection-info">
          Selected: Position {selectedNode + 1}
        </div>
      )}

      {/* Control Buttons */}
      <div className="control-panel">
        <button
          onClick={handleNewGame}
          className="btn btn-secondary"
          disabled={loading}
        >
          🔄 New Game
        </button>

        <button
          onClick={handleAIMove}
          className="btn btn-primary"
          disabled={loading || !!winner}
        >
          {loading ? '⏳ Thinking...' : `🤖 AI Move (${turn === 'T' ? 'Tiger' : 'Goat'})`}
        </button>

        <button
          onClick={() => setShowRules(true)}
          className="btn btn-info"
        >
          📖 Rules
        </button>

        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="btn btn-secondary"
          title={soundEnabled ? 'Mute sounds' : 'Enable sounds'}
        >
          {soundEnabled ? '🔊' : '🔇'}
        </button>
      </div>

      {/* Winner Overlay */}
      <AnimatePresence>
        {winner && (
          <motion.div
            className="winner-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="winner-modal"
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
            >
              <div className="winner-emoji">
                {winner === 'T' ? '🐯' : '🐐'}
              </div>
              <h2 className="winner-title">
                {winner === 'T' ? 'TIGER WINS!' : 'GOAT WINS!'}
              </h2>
              <p className="winner-message">
                {winner === 'T'
                  ? 'The tiger captured 5 goats! Ferocious victory!'
                  : 'The goats trapped all tigers! Strategic triumph!'}
              </p>
              <button onClick={handleNewGame} className="btn btn-primary btn-large">
                🔄 Play Again
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Rules Modal */}
      <AnimatePresence>
        {showRules && (
          <GameRules onClose={() => setShowRules(false)} />
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="game-footer">
        <p>A traditional South Indian board game • Also known as "Pulijudam" or "Adu Huli Aata"</p>
      </footer>
    </div>
  );
}

export default App;
