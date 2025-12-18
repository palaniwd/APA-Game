import sys
import random
from game.engine import GameEngine

def main():
    game = GameEngine()
    print("Starting Aadu Puli Aattam CLI Simulation...")
    print("Tigers (T) start positions: 0, 3, 4")
    
    max_turns = 100
    for i in range(max_turns):
        print(f"\n--- Turn {i+1}: Player {game.state.turn} ---")
        game.print_board()
        
        winner = game.check_winner()
        if winner:
            print(f"GAME OVER! Winner: {winner}")
            break
        
        moves = game.get_valid_moves()
        if not moves:
            print("No moves available!")
            if game.state.turn == 'T':
                print("Goats Win (Tiger Trapped)!")
                break
            else:
                print("Stalemate?")
                break
                
        # Simple Logic:
        # If Tiger, prioritize Capture
        chosen_move = None
        if game.state.turn == 'T':
            captures = [m for m in moves if m['type'] == 'CAPTURE']
            if captures:
                chosen_move = random.choice(captures)
            else:
                chosen_move = random.choice(moves)
        else:
            # Random goat move
            chosen_move = random.choice(moves)
            
        print(f"Executing: {chosen_move}")
        success = game.apply_move(chosen_move)
        if not success:
            print("Error: Move failed!")
            break

if __name__ == "__main__":
    main()
