from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_read_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Aadu Puli Aattam API"}

def test_new_game_and_state():
    client.post("/new-game")
    response = client.get("/state")
    assert response.status_code == 200
    data = response.json()
    assert data["turn"] == "G"
    assert data["goats_placed"] == 0
    assert "board" in data
    # Check board init
    # 0, 3, 4 should be 'T'
    # JSON keys are strings!
    assert data["board"]["0"] == "T"
    assert data["board"]["1"] is None

def test_place_goat():
    client.post("/new-game")
    # Place at 1
    payload = {"type": "PLACE", "to_node": 1}
    response = client.post("/move", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["board"]["1"] == "G"
    assert data["turn"] == "T"

def test_ai_move():
    client.post("/new-game")
    # Place G at 1 so T can move
    client.post("/move", json={"type": "PLACE", "to_node": 1})
    
    # Request AI move for Tiger
    response = client.get("/ai-move?player=T")
    assert response.status_code == 200
    move = response.json()
    assert move["type"] in ["MOVE", "CAPTURE"]
    
if __name__ == "__main__":
    test_read_root()
    test_new_game_and_state()
    test_place_goat()
    test_ai_move()
    print("API Tests Passed!")
