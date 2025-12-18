from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict
from game.engine import GameEngine
from ai.ai_player import MinimaxAI

app = FastAPI()

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global Game Instance
game_engine = GameEngine()
ai_player = MinimaxAI(depth=3)

# Pydantic Models
class MoveRequest(BaseModel):
    type: str # 'PLACE', 'MOVE', 'CAPTURE'
    from_node: Optional[int] = None
    to_node: Optional[int] = None
    capture_node: Optional[int] = None

class ValidMove(BaseModel):
    type: str
    from_node: Optional[int] = None
    to_node: Optional[int] = None
    capture_node: Optional[int] = None

class GameStateResponse(BaseModel):
    board: Dict[int, Optional[str]]
    turn: str
    goats_placed: int
    goats_captured: int
    winner: Optional[str] = None
    valid_moves: List[dict] # Simplified for now, or use ValidMove

@app.get("/")
def read_root():
    return {"message": "Aadu Puli Aattam API"}

@app.post("/new-game")
def new_game():
    global game_engine
    game_engine = GameEngine()
    return {"message": "Game Reset"}

@app.get("/state", response_model=GameStateResponse)
def get_state():
    winner = game_engine.check_winner()
    moves = game_engine.get_valid_moves()
    return {
        "board": game_engine.state.board_map,
        "turn": game_engine.state.turn,
        "goats_placed": game_engine.state.goats_on_board,
        "goats_captured": game_engine.state.goats_captured,
        "winner": winner,
        "valid_moves": moves
    }

@app.post("/move")
def make_move(move: MoveRequest):
    winner = game_engine.check_winner()
    if winner:
        raise HTTPException(status_code=400, detail="Game Over")

    # Convert Pydantic to dict for engine
    move_dict = {
        'type': move.type,
        'to': move.to_node
    }
    if move.from_node is not None:
        move_dict['from'] = move.from_node
    if move.capture_node is not None:
        move_dict['capture'] = move.capture_node
        
    print(f"Applying move: {move_dict}")
    success = game_engine.apply_move(move_dict)
    
    if not success:
        raise HTTPException(status_code=400, detail="Invalid Move")
        
    return get_state()

@app.get("/ai-move")
def get_ai_move(player: str = 'T'):
    if game_engine.state.turn != player:
        raise HTTPException(status_code=400, detail=f"Not {player}'s turn")
        
    best_move = ai_player.get_best_move(game_engine.state, player)
    if not best_move:
         raise HTTPException(status_code=400, detail="No moves available")
         
    return best_move
