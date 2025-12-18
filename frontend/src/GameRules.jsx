import React from 'react';
import PropTypes from 'prop-types';

/**
 * GameRules Component
 * Comprehensive game rules documentation modal for Aadu Puli Aattam
 */
const GameRules = ({ onClose }) => {
    return (
        <motion.div
            className="rules-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
        >
            <motion.div
                className="rules-modal"
                initial={{ scale: 0.9, y: 30 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 30 }}
                onClick={(e) => e.stopPropagation()}
            >
                <button className="rules-close" onClick={onClose}>×</button>

                <h2 className="rules-title">
                    🐯 Aadu Puli Aattam 🐐
                    <span className="rules-subtitle">The Tigers and Goats Game</span>
                </h2>

                <div className="rules-content">
                    {/* Introduction */}
                    <section className="rules-section">
                        <h3>🎯 Objective</h3>
                        <p>
                            Aadu Puli Aattam is an ancient asymmetric strategy game from South India.
                            Two players compete with different goals and abilities.
                        </p>
                        <ul>
                            <li><strong>🐯 Tigers:</strong> Capture 5 goats to win</li>
                            <li><strong>🐐 Goats:</strong> Block all tigers so they cannot move</li>
                        </ul>
                    </section>

                    {/* Setup */}
                    <section className="rules-section">
                        <h3>🎲 Setup</h3>
                        <ul>
                            <li><strong>3 Tigers</strong> start at the apex triangle (positions 1, 4, 5)</li>
                            <li><strong>15 Goats</strong> are placed one at a time during Phase 1</li>
                        </ul>
                    </section>

                    {/* Phases */}
                    <section className="rules-section">
                        <h3>📍 Game Phases</h3>

                        <div className="phase-block">
                            <h4>Phase 1: Goat Placement</h4>
                            <p>Goats are placed one at a time on any empty intersection.
                                Tigers can move and capture during this phase.</p>
                        </div>

                        <div className="phase-block">
                            <h4>Phase 2: Movement</h4>
                            <p>After all 15 goats are placed, both sides can only move their pieces
                                along the lines to adjacent empty positions.</p>
                        </div>
                    </section>

                    {/* Movement Rules */}
                    <section className="rules-section">
                        <h3>🚶 Movement Rules</h3>
                        <ul>
                            <li><strong>Tigers & Goats:</strong> Move to any adjacent empty intersection along a line</li>
                            <li><strong>Tigers only:</strong> Can jump over an adjacent goat to capture it (if the landing spot is empty)</li>
                            <li><strong>Goats:</strong> Cannot jump or capture</li>
                        </ul>
                    </section>

                    {/* Capture */}
                    <section className="rules-section">
                        <h3>⚔️ Capturing</h3>
                        <p>
                            A tiger captures a goat by jumping over it in a straight line.
                            The goat must be adjacent, and the landing position must be empty.
                        </p>
                        <div className="capture-diagram">
                            🐯 → 🐐 → ⭕ = Capture!
                        </div>
                    </section>

                    {/* Winning */}
                    <section className="rules-section">
                        <h3>🏆 Winning Conditions</h3>
                        <ul>
                            <li><strong>🐯 Tiger Wins:</strong> Capture 5 goats</li>
                            <li><strong>🐐 Goat Wins:</strong> Block all tigers (no legal moves available)</li>
                        </ul>
                    </section>

                    {/* Strategy Tips */}
                    <section className="rules-section">
                        <h3>💡 Strategy Tips</h3>
                        <ul>
                            <li><strong>Goats:</strong> Form clusters to protect each other. Control the center.</li>
                            <li><strong>Tigers:</strong> Keep mobility high. Target isolated goats.</li>
                            <li><strong>Both:</strong> Think several moves ahead!</li>
                        </ul>
                    </section>

                    {/* History */}
                    <section className="rules-section history">
                        <h3>📜 History</h3>
                        <p>
                            This game is known by many names across India:
                            <em>Pulijudam</em> (Telugu), <em>Adu Huli Aata</em> (Kannada),
                            <em>Aadu Puli Aattam</em> (Tamil). It's part of the hunt game family,
                            related to games like Bagh-Chal from Nepal.
                        </p>
                    </section>
                </div>

                <div className="rules-footer">
                    <button className="btn btn-primary" onClick={onClose}>
                        Got it! Let's Play
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
};

GameRules.propTypes = {
    onClose: PropTypes.func.isRequired
};

export default GameRules;
