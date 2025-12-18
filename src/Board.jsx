import React, { useMemo } from 'react';
import PropTypes from 'prop-types';

/**
 * Aadu Puli Aattam Board Component
 * Authentic traditional design with 23 nodes matching the reference artwork.
 * 
 * Node Layout (0-indexed internally, 1-indexed for display):
 * - Node 0 (display: 1): Apex (top of triangle)
 * - Nodes 1-6 (display: 2-7): Row 1 - 6 nodes
 * - Nodes 7-12 (display: 8-13): Row 2 - 6 nodes
 * - Nodes 13-18 (display: 14-19): Row 3 - 6 nodes
 * - Nodes 19-22 (display: 20-23): Row 4 - 4 nodes (centered)
 * 
 * Board Geometry:
 * - Apex connects diagonally to inner 4 nodes of row 1 (nodes 2, 3, 4, 5)
 * - All rows have horizontal connections
 * - Vertical connections between corresponding columns
 * - Bottom triangular section with diagonal connections
 */

// Board dimensions for SVG viewBox - wider for better display
const WIDTH = 900;
const HEIGHT = 850;

// Colors matching the reference artwork exactly
const COLORS = {
    background: {
        primary: '#F5A623',
        gradient1: '#F8B84A',
        gradient2: '#E8920F'
    },
    line: '#FFFFFF',
    lineWidth: 4,
    node: {
        fill: '#FFFFFF',
        stroke: '#333333',
        strokeWidth: 2,
        radius: 26
    },
    nodeLabel: '#000000',
    decoration: '#C67500',
    selected: {
        stroke: '#00FF88',
        glow: 'rgba(0, 255, 136, 0.6)'
    },
    validMove: {
        fill: 'rgba(0, 255, 136, 0.3)',
        stroke: '#00FF88'
    }
};

// Calculate node coordinates for authentic triangular layout
const calculateCoordinates = () => {
    const coords = {};

    // Wider margins for better horizontal spread
    const marginX = 50;
    const usableWidth = WIDTH - marginX * 2;
    const colSpacing = usableWidth / 5; // 6 columns = 5 gaps

    // Y positions for each row
    const apexY = 80;
    const row1Y = 220;
    const row2Y = 360;
    const row3Y = 500;
    const row4Y = 720;

    // Helper to get X position for a column (0-5)
    const getX = (col) => marginX + col * colSpacing;

    // Apex (Node 0, displayed as 1) - centered
    coords[0] = { x: WIDTH / 2, y: apexY };

    // Row 1: Nodes 1-6 (displayed as 2-7)
    for (let i = 0; i < 6; i++) {
        coords[i + 1] = { x: getX(i), y: row1Y };
    }

    // Row 2: Nodes 7-12 (displayed as 8-13)
    for (let i = 0; i < 6; i++) {
        coords[i + 7] = { x: getX(i), y: row2Y };
    }

    // Row 3: Nodes 13-18 (displayed as 14-19)
    for (let i = 0; i < 6; i++) {
        coords[i + 13] = { x: getX(i), y: row3Y };
    }

    // Row 4: Nodes 19-22 (displayed as 20-23)
    // Centered under columns 1, 2, 3, 4 (0-indexed)
    for (let i = 0; i < 4; i++) {
        coords[i + 19] = { x: getX(i + 1), y: row4Y };
    }

    return coords;
};

const COORDS = calculateCoordinates();

// Edge connections matching the authentic board topology
// Based on reference image analysis:
// - Apex connects to inner 4 nodes of row 1 (nodes 2, 3, 4, 5 in 0-indexed: 1, 2, 3, 4)
// - Horizontal connections within each row
// - Vertical connections between rows
// - Inner triangular connections at bottom
const EDGES = [
    // Apex (0) diagonal connections to inner row 1 nodes
    [0, 2], [0, 3], [0, 4], [0, 5],

    // Row 1 horizontal: 1-2-3-4-5-6 (nodes 1-6)
    [1, 2], [2, 3], [3, 4], [4, 5], [5, 6],

    // Row 2 horizontal: 7-8-9-10-11-12 (nodes 7-12)
    [7, 8], [8, 9], [9, 10], [10, 11], [11, 12],

    // Row 3 horizontal: 13-14-15-16-17-18 (nodes 13-18)
    [13, 14], [14, 15], [15, 16], [16, 17], [17, 18],

    // Row 4 horizontal: 19-20-21-22 (nodes 19-22)
    [19, 20], [20, 21], [21, 22],

    // Vertical connections Row 1 -> Row 2
    [1, 7], [2, 8], [3, 9], [4, 10], [5, 11], [6, 12],

    // Vertical connections Row 2 -> Row 3
    [7, 13], [8, 14], [9, 15], [10, 16], [11, 17], [12, 18],

    // Vertical connections Row 3 -> Row 4 (center 4) - Triangle symmetry
    [14, 19], [15, 20], [16, 21], [17, 22],
];

// Decorative corner flourish
const CornerOrnament = ({ x, y, rotation }) => (
    <g transform={`translate(${x}, ${y}) rotate(${rotation})`}>
        <path
            d="M0,0 Q15,25 35,30 Q15,25 0,50 M5,5 Q18,22 30,25 M5,45 Q18,35 30,32"
            fill="none"
            stroke={COLORS.decoration}
            strokeWidth="2.5"
            strokeLinecap="round"
        />
        <circle cx="3" cy="3" r="4" fill={COLORS.decoration} />
        <circle cx="3" cy="47" r="4" fill={COLORS.decoration} />
    </g>
);

CornerOrnament.propTypes = {
    x: PropTypes.number.isRequired,
    y: PropTypes.number.isRequired,
    rotation: PropTypes.number.isRequired
};

// Title text at bottom
const TitleText = () => (
    <g>
        <text
            x={WIDTH / 2}
            y={HEIGHT - 50}
            textAnchor="middle"
            fontSize="52"
            fontFamily="'Brush Script MT', 'Palatino', cursive, serif"
            fontStyle="italic"
            fontWeight="bold"
        >
            <tspan fill="#CC0000">Tigers</tspan>
            <tspan fill={COLORS.decoration}> &amp; </tspan>
            <tspan fill="#000000">Goats</tspan>
        </text>
        <text
            x={WIDTH / 2}
            y={HEIGHT - 15}
            textAnchor="middle"
            fontSize="28"
            fontFamily="'Noto Sans Tamil', Arial, sans-serif"
            fontWeight="bold"
        >
            <tspan fill="#000000">(ஆடு </tspan>
            <tspan fill="#CC0000">புலி</tspan>
            <tspan fill="#000000"> ஆட்டம்)</tspan>
        </text>
    </g>
);

const Board = ({ boardState, onSafeClick, validMoves, selectedNode }) => {
    // Find valid destination nodes for current selection
    const validDestinations = useMemo(() => {
        if (selectedNode === null || !validMoves) return new Set();

        const destinations = new Set();
        validMoves.forEach(move => {
            if (move.from === selectedNode) {
                destinations.add(move.to);
            }
        });
        return destinations;
    }, [selectedNode, validMoves]);

    return (
        <div className="board-container" style={{
            width: '100%',
            maxWidth: '700px',
            margin: '0 auto',
            touchAction: 'manipulation'
        }}>
            <svg
                viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
                style={{
                    width: '100%',
                    height: 'auto',
                    borderRadius: '16px',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                    overflow: 'hidden'
                }}
            >
                {/* Gradient Background */}
                <defs>
                    <linearGradient id="boardGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor={COLORS.background.gradient1} />
                        <stop offset="50%" stopColor={COLORS.background.primary} />
                        <stop offset="100%" stopColor={COLORS.background.gradient2} />
                    </linearGradient>

                    {/* Selection glow filter */}
                    <filter id="selectedGlow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="5" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                {/* Background */}
                <rect width={WIDTH} height={HEIGHT} fill="url(#boardGradient)" />

                {/* Decorative corners */}
                <CornerOrnament x={20} y={20} rotation={0} />
                <CornerOrnament x={WIDTH - 20} y={20} rotation={90} />
                <CornerOrnament x={20} y={HEIGHT - 20} rotation={270} />
                <CornerOrnament x={WIDTH - 20} y={HEIGHT - 20} rotation={180} />

                {/* Tiger and Goat illustrations */}
                <text x={80} y={130} fontSize="80" opacity="0.7">🐯</text>
                <text x={WIDTH - 140} y={130} fontSize="80" opacity="0.7">🐐</text>

                {/* Draw connection lines */}
                {EDGES.map(([u, v], idx) => {
                    if (!COORDS[u] || !COORDS[v]) return null;
                    return (
                        <line
                            key={`edge-${idx}`}
                            x1={COORDS[u].x}
                            y1={COORDS[u].y}
                            x2={COORDS[v].x}
                            y2={COORDS[v].y}
                            stroke={COLORS.line}
                            strokeWidth={COLORS.lineWidth}
                            strokeLinecap="round"
                        />
                    );
                })}

                {/* Draw nodes */}
                {Object.keys(COORDS).map((key) => {
                    const nodeId = parseInt(key);
                    const { x, y } = COORDS[nodeId];
                    const occupant = boardState[String(nodeId)];
                    const isSelected = selectedNode === nodeId;
                    const isValidDest = validDestinations.has(nodeId);
                    const displayNumber = nodeId + 1;

                    return (
                        <g
                            key={nodeId}
                            onClick={() => onSafeClick(nodeId)}
                            style={{ cursor: 'pointer' }}
                        >
                            {/* Valid destination pulse indicator */}
                            {isValidDest && (
                                <circle
                                    cx={x}
                                    cy={y}
                                    r={COLORS.node.radius + 10}
                                    fill={COLORS.validMove.fill}
                                    stroke={COLORS.validMove.stroke}
                                    strokeWidth="2"
                                    className="pulse-animation"
                                >
                                    <animate
                                        attributeName="r"
                                        values={`${COLORS.node.radius + 6};${COLORS.node.radius + 12};${COLORS.node.radius + 6}`}
                                        dur="1.2s"
                                        repeatCount="indefinite"
                                    />
                                    <animate
                                        attributeName="opacity"
                                        values="0.6;0.9;0.6"
                                        dur="1.2s"
                                        repeatCount="indefinite"
                                    />
                                </circle>
                            )}

                            {/* Selection glow ring */}
                            {isSelected && (
                                <circle
                                    cx={x}
                                    cy={y}
                                    r={COLORS.node.radius + 6}
                                    fill="none"
                                    stroke={COLORS.selected.stroke}
                                    strokeWidth="4"
                                    filter="url(#selectedGlow)"
                                >
                                    <animate
                                        attributeName="r"
                                        values={`${COLORS.node.radius + 4};${COLORS.node.radius + 8};${COLORS.node.radius + 4}`}
                                        dur="0.8s"
                                        repeatCount="indefinite"
                                    />
                                </circle>
                            )}

                            {/* Main node circle */}
                            <circle
                                cx={x}
                                cy={y}
                                r={COLORS.node.radius}
                                fill={COLORS.node.fill}
                                stroke={isSelected ? COLORS.selected.stroke : COLORS.node.stroke}
                                strokeWidth={isSelected ? 3 : COLORS.node.strokeWidth}
                            />

                            {/* Node number (show when empty) */}
                            {!occupant && (
                                <text
                                    x={x}
                                    y={y}
                                    dy="6"
                                    textAnchor="middle"
                                    fill={COLORS.nodeLabel}
                                    fontSize="18"
                                    fontWeight="bold"
                                    fontFamily="Georgia, serif"
                                    style={{ pointerEvents: 'none' }}
                                >
                                    {displayNumber}
                                </text>
                            )}

                            {/* Tiger piece emoji */}
                            {occupant === 'T' && (
                                <text
                                    x={x}
                                    y={y}
                                    dy="12"
                                    textAnchor="middle"
                                    fontSize="38"
                                    style={{ pointerEvents: 'none', userSelect: 'none' }}
                                >
                                    🐯
                                </text>
                            )}

                            {/* Goat piece emoji */}
                            {occupant === 'G' && (
                                <text
                                    x={x}
                                    y={y}
                                    dy="12"
                                    textAnchor="middle"
                                    fontSize="38"
                                    style={{ pointerEvents: 'none', userSelect: 'none' }}
                                >
                                    🐐
                                </text>
                            )}
                        </g>
                    );
                })}

                {/* Title text */}
                <TitleText />
            </svg>
        </div>
    );
};

Board.propTypes = {
    boardState: PropTypes.object.isRequired,
    onSafeClick: PropTypes.func.isRequired,
    validMoves: PropTypes.array,
    selectedNode: PropTypes.number
};

Board.defaultProps = {
    validMoves: [],
    selectedNode: null
};

export default Board;
