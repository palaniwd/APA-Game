from typing import List, Dict, Optional, Tuple

class Board:
    """
    Represents the Aadu Puli Aattam board as a graph.
    Total nodes: 23 (numbered 0-22 internally, displayed as 1-23)
    
    Board Layout:
    - Node 0: Apex (top of triangle)
    - Nodes 1-6: Row 1 (6 nodes, full width)
    - Nodes 7-12: Row 2 (6 nodes)
    - Nodes 13-18: Row 3 (6 nodes)
    - Nodes 19-22: Row 4 (4 nodes, centered)
    
    Connections:
    - Apex (0) connects diagonally to inner 4 nodes of Row 1 (nodes 2, 3, 4, 5)
    - Horizontal connections within each row
    - Vertical connections between corresponding columns
    - Inner triangular diagonals at bottom between Row 3 and Row 4
    """
    
    def __init__(self):
        self.nodes = list(range(23))
        self.adjacency: Dict[int, List[int]] = {i: [] for i in range(23)}
        self._build_graph()

    def _add_edge(self, u: int, v: int):
        """Add bidirectional edge between two nodes."""
        if v not in self.adjacency[u]:
            self.adjacency[u].append(v)
        if u not in self.adjacency[v]:
            self.adjacency[v].append(u)

    def _build_graph(self):
        """Build the complete board graph matching the authentic topology."""
        
        # === Apex connections ===
        # Apex (0) connects diagonally to inner 4 nodes of Row 1
        self._add_edge(0, 2)  # Apex to node 3 (display)
        self._add_edge(0, 3)  # Apex to node 4 (display)
        self._add_edge(0, 4)  # Apex to node 5 (display)
        self._add_edge(0, 5)  # Apex to node 6 (display)
        
        # === Horizontal connections within rows ===
        
        # Row 1: nodes 1-2-3-4-5-6
        for i in range(1, 6):
            self._add_edge(i, i + 1)
        
        # Row 2: nodes 7-8-9-10-11-12
        for i in range(7, 12):
            self._add_edge(i, i + 1)
            
        # Row 3: nodes 13-14-15-16-17-18
        for i in range(13, 18):
            self._add_edge(i, i + 1)
            
        # Row 4: nodes 19-20-21-22
        for i in range(19, 22):
            self._add_edge(i, i + 1)

        # === Vertical connections between rows ===
        
        # Row 1 -> Row 2 (all 6 columns)
        for i in range(1, 7):
            self._add_edge(i, i + 6)
            
        # Row 2 -> Row 3 (all 6 columns)
        for i in range(7, 13):
            self._add_edge(i, i + 6)
            
        # Row 3 -> Row 4 (center 4 columns: 14, 15, 16, 17 -> 19, 20, 21, 22)
        self._add_edge(14, 19)
        self._add_edge(15, 20)
        self._add_edge(16, 21)
        self._add_edge(17, 22)

        # Row 3 -> Row 4 has only straight vertical connections (no diagonals)
        # This creates the triangle symmetry pattern from apex to bottom row

    def get_neighbors(self, node: int) -> List[int]:
        """Return sorted list of adjacent nodes."""
        return sorted(self.adjacency.get(node, []))

    def get_valid_jumps(self, node: int) -> List[Tuple[int, int]]:
        """
        Returns list of (jump_over, land_on) tuples for a Tiger at 'node'.
        A jump is valid if node -> jump_over -> land_on form a straight line.
        """
        jumps = []
        
        # === Horizontal Jumps (within rows) ===
        
        # Row 1 (nodes 1-6)
        for start in range(1, 5):
            if node == start:
                jumps.append((start + 1, start + 2))
            if node == start + 2:
                jumps.append((start + 1, start))
            
        # Row 2 (nodes 7-12)
        for start in range(7, 11):
            if node == start:
                jumps.append((start + 1, start + 2))
            if node == start + 2:
                jumps.append((start + 1, start))
            
        # Row 3 (nodes 13-18)
        for start in range(13, 17):
            if node == start:
                jumps.append((start + 1, start + 2))
            if node == start + 2:
                jumps.append((start + 1, start))
            
        # Row 4 (nodes 19-22)
        for start in range(19, 21):
            if node == start:
                jumps.append((start + 1, start + 2))
            if node == start + 2:
                jumps.append((start + 1, start))

        # === Vertical Jumps from Apex ===
        # Apex (0) can jump over Row 1 to Row 2 (via nodes 2, 3, 4, 5)
        apex_jumps = [
            (0, 2, 8),   # 0 -> 2 -> 8
            (0, 3, 9),   # 0 -> 3 -> 9
            (0, 4, 10),  # 0 -> 4 -> 10
            (0, 5, 11),  # 0 -> 5 -> 11
        ]
        for (start, mid, end) in apex_jumps:
            if node == start:
                jumps.append((mid, end))
            if node == end:
                jumps.append((mid, start))
        
        # === Vertical Jumps: Row 1 -> Row 2 -> Row 3 ===
        for col in range(1, 7):
            r1 = col
            r2 = col + 6
            r3 = col + 12
            if node == r1:
                jumps.append((r2, r3))
            if node == r3:
                jumps.append((r2, r1))
            
        # === Vertical Jumps: Row 2 -> Row 3 -> Row 4 (center columns) ===
        vertical_r234 = [
            (8, 14, 19),
            (9, 15, 20),
            (10, 16, 21),
            (11, 17, 22)
        ]
        for (r2, r3, r4) in vertical_r234:
            if node == r2:
                jumps.append((r3, r4))
            if node == r4:
                jumps.append((r3, r2))

        # === Diagonal Jumps in bottom triangle ===
        # These follow the diagonal connection lines
        # 14-20-? and 15-19-? and similar patterns
        # For the inner triangle, diagonal jumps are possible if 3 nodes are in line
        
        # Left diagonal: 14 -> 20 -> ? (no third node in line)
        # Cross diagonal patterns:
        # 14 -> 15 -> 20 (not a straight line diagonal)
        # The inner diagonals are short connections without jump-through capability
        # in the standard rules, so we leave diagonal captures within row 3-4 area
                
        return jumps
    
    def is_connected(self, u: int, v: int) -> bool:
        """Check if two nodes are directly connected."""
        return v in self.adjacency.get(u, [])
    
    def get_all_nodes(self) -> List[int]:
        """Return all node IDs."""
        return self.nodes.copy()
    
    def get_node_count(self) -> int:
        """Return total number of nodes."""
        return len(self.nodes)
    
    def __repr__(self) -> str:
        return f"Board(nodes={len(self.nodes)}, edges={sum(len(v) for v in self.adjacency.values()) // 2})"
