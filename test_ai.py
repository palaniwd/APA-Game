from game.engine import GameEngine
from ai.ai_player import MinimaxAI

def test_ai():
    game = GameEngine()
    ai = MinimaxAI(depth=2)
    
    print("Testing AI Move Generation...")
    
    # AI playing as Tiger (maximizing)
    # Tigers move first? No, Goats place first.
    # Let's force a state where Tigers can move.
    
    # Place 1 goat to make it Tiger's turn
    game.apply_move({'type': 'PLACE', 'to': 1})
    print("State after Goat place at 1:", game.state.board_map)
    print("Turn:", game.state.turn)
    
    best_move = ai.get_best_move(game.state, 'T')
    print("AI (Tiger) suggests:", best_move)
    
    assert best_move is not None
    assert best_move['type'] in ['MOVE', 'CAPTURE']

    print("AI Test Passed!")

if __name__ == "__main__":
    test_ai()
