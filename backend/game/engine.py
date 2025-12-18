from typing import Dict, List, Optional, Tuple
from .board import Board

class GameState:
    def __init__(self):
        self.board_map: Dict[int, Optional[str]] = {i: None for i in range(23)} # None, 'T', 'G'
        self.turn: str = 'G' # Goats start
        self.goats_on_board: int = 0
        self.goats_captured: int = 0
        self.max_goats: int = 15
        self.history: List[str] = [] # For logging

    def is_phase_one(self) -> bool:
        return self.goats_on_board < self.max_goats

    def clone(self):
        new_state = GameState()
        new_state.board_map = self.board_map.copy()
        new_state.turn = self.turn
        new_state.goats_on_board = self.goats_on_board
        new_state.goats_captured = self.goats_captured
        new_state.history = list(self.history)
        return new_state

class GameEngine:
    def __init__(self):
        self.board = Board()
        self.state = GameState()
        self._initialize_tigers()

    def _initialize_tigers(self):
        # 3 Tigers start at Apex(0) and inner Row 1 (3, 4 based on my board logic)
        # Based on my Board.py logic: Apex=0, connected to 3 and 4 in Row 1.
        self.state.board_map[0] = 'T'
        self.state.board_map[3] = 'T'
        self.state.board_map[4] = 'T'

    def get_valid_moves(self) -> List[dict]:
        """
        Returns a list of valid moves for the current player.
        Format: {'type': 'PLACE'|'MOVE'|'CAPTURE', 'from': int, 'to': int, ...}
        """
        moves = []
        if self.state.turn == 'G':
            if self.state.is_phase_one():
                # Phase 1: Place Goat on any empty spot
                for node, occupant in self.state.board_map.items():
                    if occupant is None:
                        moves.append({'type': 'PLACE', 'to': node})
            else:
                # Phase 2: Move Goat to adjacent empty spot
                for node, occupant in self.state.board_map.items():
                    if occupant == 'G':
                        neighbors = self.board.get_neighbors(node)
                        for n in neighbors:
                            if self.state.board_map[n] is None:
                                moves.append({'type': 'MOVE', 'from': node, 'to': n})
        
        elif self.state.turn == 'T':
            # Tigers move or capture
            tigers = [node for node, occ in self.state.board_map.items() if occ == 'T']
            for t_node in tigers:
                # 1. Normal Move
                neighbors = self.board.get_neighbors(t_node)
                for n in neighbors:
                    if self.state.board_map[n] is None:
                        moves.append({'type': 'MOVE', 'from': t_node, 'to': n})
                
                # 2. Capture Move
                jumps = self.board.get_valid_jumps(t_node)
                for (mid, dest) in jumps:
                    if self.state.board_map[mid] == 'G' and self.state.board_map[dest] is None:
                        moves.append({'type': 'CAPTURE', 'from': t_node, 'to': dest, 'capture': mid})
        
        return moves

    def apply_move(self, move: dict) -> bool:
        """
        Applies a move if it is valid. Returns True if successful.
        """
        # Validate logic could be strict here, but assuming input is from get_valid_moves or trusted
        # We'll do basic validation
        
        m_type = move['type']
        
        if self.state.turn == 'G':
            if m_type == 'PLACE':
                if not self.state.is_phase_one(): return False
                dest = move['to']
                if self.state.board_map[dest] is not None: return False
                self.state.board_map[dest] = 'G'
                self.state.goats_on_board += 1
                self.state.turn = 'T'
                self.state.history.append(f"G placed at {dest}")
                return True
                
            elif m_type == 'MOVE':
                if self.state.is_phase_one(): return False
                src, dest = move['from'], move['to']
                if self.state.board_map[src] != 'G': return False
                if self.state.board_map[dest] is not None: return False
                if dest not in self.board.get_neighbors(src): return False
                
                self.state.board_map[src] = None
                self.state.board_map[dest] = 'G'
                self.state.turn = 'T'
                self.state.history.append(f"G moved {src}->{dest}")
                return True
                
        elif self.state.turn == 'T':
            src = move['from']
            dest = move['to']
            if self.state.board_map[src] != 'T': return False
            if self.state.board_map[dest] is not None: return False
            
            if m_type == 'MOVE':
                if dest not in self.board.get_neighbors(src): return False
                self.state.board_map[src] = None
                self.state.board_map[dest] = 'T'
                self.state.turn = 'G'
                self.state.history.append(f"T moved {src}->{dest}")
                return True
                
            elif m_type == 'CAPTURE':
                mid = move.get('capture')
                if mid is None: return False
                # Verify jump
                valid_jumps = self.board.get_valid_jumps(src)
                if (mid, dest) not in valid_jumps: return False
                if self.state.board_map[mid] != 'G': return False
                
                self.state.board_map[src] = None
                self.state.board_map[mid] = None # Eat goat
                self.state.board_map[dest] = 'T'
                self.state.goats_captured += 1
                self.state.turn = 'G'
                self.state.history.append(f"T captured {mid} ({src}->{dest})")
                return True
                
        return False

    def check_winner(self) -> Optional[str]:
        """
        Returns 'T' if Tigers win, 'G' if Goats win, else None.
        """
        # Tigers win if they capture 5 goats
        if self.state.goats_captured >= 5:
            return 'T'
        
        # Goats win if Tigers have NO moves
        if self.state.turn == 'T':
            valid_moves = self.get_valid_moves()
            if not valid_moves:
                return 'G'
                
        return None

    def print_board(self):
        """Debug print"""
        # Simple list dump
        print(f"Turn: {self.state.turn}, Goats Placed: {self.state.goats_on_board}, Captured: {self.state.goats_captured}")
        print("Board:", self.state.board_map)
