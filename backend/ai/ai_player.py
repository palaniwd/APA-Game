import math
from game.engine import GameEngine, GameState

class MinimaxAI:
    def __init__(self, depth=3):
        self.depth = depth
        self.engine = GameEngine() # Used for logic helpers

    def get_best_move(self, state: GameState, player: str):
        # Determine if maximizing or minimizing
        # We assume heuristic: Positive = Good for Tiger, Negative = Good for Goat
        is_maximizing = (player == 'T')
        
        best_val = -math.inf if is_maximizing else math.inf
        best_move = None
        
        # Get valid moves
        # We need to temporarily set engine state to get moves
        self.engine.state = state
        moves = self.engine.get_valid_moves()
        
        if not moves:
            return None

        alpha = -math.inf
        beta = math.inf
        
        for move in moves:
            # Simulate
            sim_state = state.clone()
            self.engine.state = sim_state
            self.engine.apply_move(move)
            
            val = self.minimax(sim_state, self.depth - 1, alpha, beta, not is_maximizing)
            
            if is_maximizing:
                if val > best_val:
                    best_val = val
                    best_move = move
                alpha = max(alpha, best_val)
            else:
                if val < best_val:
                    best_val = val
                    best_move = move
                beta = min(beta, best_val)
                
            if beta <= alpha:
                break
                
        return best_move

    def minimax(self, state: GameState, depth, alpha, beta, is_maximizing):
        winner = self.check_winner_sim(state)
        if winner == 'T':
            return 10000 # Tiger wins
        elif winner == 'G':
            return -10000 # Goat wins
            
        if depth == 0:
            return self.evaluate(state)
            
        # Get moves
        self.engine.state = state
        moves = self.engine.get_valid_moves()
        
        if not moves:
            # If no moves and it's Tiger's turn, Tiger loses (Goat wins)
            if state.turn == 'T': return -10000
            # If no moves and Goat's turn? (Stalemate or Goat Blocked? Rules say Goats win if Tigers blocked. Goats blocked?)
            # Usually only Tigers can be blocked. Goats placed/moved.
            return 0 

        if is_maximizing: # Tiger
            max_eval = -math.inf
            for move in moves:
                sim_state = state.clone()
                self.engine.state = sim_state
                self.engine.apply_move(move)
                eval = self.minimax(sim_state, depth - 1, alpha, beta, False)
                max_eval = max(max_eval, eval)
                alpha = max(alpha, eval)
                if beta <= alpha:
                    break
            return max_eval
        else: # Goat
            min_eval = math.inf
            for move in moves:
                sim_state = state.clone()
                self.engine.state = sim_state
                self.engine.apply_move(move)
                eval = self.minimax(sim_state, depth - 1, alpha, beta, True)
                min_eval = min(min_eval, eval)
                beta = min(beta, eval)
                if beta <= alpha:
                    break
            return min_eval

    def check_winner_sim(self, state: GameState):
        # We can recycle GameEngine check_winner but need to be careful about state injection
        # Actually check_winner uses self.state.
        self.engine.state = state
        return self.engine.check_winner()

    def evaluate(self, state: GameState):
        """
        Heuristic:
        + Positive for Tiger advantage
        - Negative for Goat advantage
        """
        score = 0
        
        # 1. Captures (Tiger wants more, Goat wants less)
        score += state.goats_captured * 100
        
        # 2. Tiger Mobility (Tiger wants more options)
        # We need to compute how many moves Tigers have
        # This is expensive? No, max 3 tigers.
        self.engine.state = state
        # But get_valid_moves returns ALL moves. If turn is G, we can't see T moves.
        # We should calculate Tiger mobility regardless of turn?
        # Yes.
        
        # Count Tiger moves
        tiger_moves = 0
        tigers = [n for n, v in state.board_map.items() if v == 'T']
        for t in tigers:
            # Move
            for n in self.engine.board.get_neighbors(t):
                if state.board_map[n] is None:
                    tiger_moves += 1
            # Capture
            for _, dest in self.engine.board.get_valid_jumps(t):
                 # Can't easily check full capture logic here without duplicating code
                 # but we can try simple check
                 # We'll skip complex capture check in heuristic for speed, 
                 # or just rely on neighbors for mobility.
                 # Actually capture availability is HUGE.
                 pass
        
        score += tiger_moves * 10 
        
        # 3. Goat Position (Phase 1 vs 2)
        # Goats want to surround Tigers.
        # Maybe distance from Tigers?
        # For now, simplistic:
        pass
        
        return score
