from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="VODMOD API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Tactical scenarios
SCENARIOS = [
    {
        "id": "positioning",
        "title": "The Unfavorable Duel",
        "map": "Ascent",
        "site": "B Site",
        "situation": (
            "You are defending B Site with 40 HP. "
            "Three attackers are pushing toward your position. "
            "Your teammates are rotating, but they need time."
        ),
        "skill": "positioning",
        "choices": [
            {
                "id": "A",
                "text": "Push the attackers and try to get an early kill.",
                "score": 20
            },
            {
                "id": "B",
                "text": "Fall back, hold a safer angle, and wait for teammates.",
                "score": 95
            },
            {
                "id": "C",
                "text": "Run into the open to escape immediately.",
                "score": 10
            }
        ],
        "explanation": (
            "With only 40 HP against three attackers, taking an "
            "unnecessary duel puts you at a disadvantage. Falling "
            "back preserves your life and gives your teammates time "
            "to help."
        )
    },
    {
        "id": "utility",
        "title": "Utility Advantage",
        "map": "Haven",
        "site": "C Site",
        "situation": (
            "Your team is attacking C Site. You have a smoke and "
            "a flash available. Your teammates are preparing to enter."
        ),
        "skill": "utility",
        "choices": [
            {
                "id": "A",
                "text": "Use both abilities immediately without communicating.",
                "score": 30
            },
            {
                "id": "B",
                "text": "Coordinate a smoke and flash with your teammates.",
                "score": 95
            },
            {
                "id": "C",
                "text": "Save all utility and rush onto the site.",
                "score": 20
            }
        ],
        "explanation": (
            "Coordinating your utility creates a safer entry and "
            "increases your team's chance of taking the site. "
            "Communication helps prevent wasted abilities."
        )
    },
    {
        "id": "teamwork",
        "title": "The Retake",
        "map": "Split",
        "site": "A Site",
        "situation": (
            "Your team is retaking A Site. You have two teammates "
            "with you. One defender is spotted in Heaven, while "
            "the other defender's position is unknown."
        ),
        "skill": "teamwork",
        "choices": [
            {
                "id": "A",
                "text": "Rush through the same entrance without coordinating.",
                "score": 30
            },
            {
                "id": "B",
                "text": "Communicate and coordinate a team retake.",
                "score": 95
            },
            {
                "id": "C",
                "text": "Split up and challenge the defenders alone.",
                "score": 15
            }
        ],
        "explanation": (
            "A coordinated retake gives your team more control "
            "over the site. Communicating positions and timing "
            "reduces the risk of isolated fights."
        )
    }
]

# Temporary player storage
players = {}


class AnswerRequest(BaseModel):
    session_id: str
    scenario_id: str
    answer: str


def get_player(session_id):
    if session_id not in players:
        players[session_id] = {
            "history": [],
            "weaknesses": {
                "positioning": 0,
                "utility": 0,
                "teamwork": 0
            }
        }

    return players[session_id]


@app.get("/")
def home():
    return {"message": "VODMOD API is running!"}


@app.get("/scenario/{session_id}")
def get_scenario(session_id: str):
    player = get_player(session_id)

    weaknesses = player["weaknesses"]

    # Check whether the player has any recorded weaknesses
    if max(weaknesses.values()) == 0:

        # Rotate through the available scenarios
        next_number = len(player["history"]) % len(SCENARIOS)

        scenario = SCENARIOS[next_number]

    else:

        # Find the player's biggest weakness
        weakest_skill = max(weaknesses, key=weaknesses.get)

        scenario = next(
            item for item in SCENARIOS
            if item["skill"] == weakest_skill
        )

    return scenario

@app.post("/evaluate")
def evaluate_answer(request: AnswerRequest):
    player = get_player(request.session_id)

    scenario = next(
        (
            item for item in SCENARIOS
            if item["id"] == request.scenario_id
        ),
        None
    )

    if scenario is None:
        raise HTTPException(
            status_code=404,
            detail="Scenario not found"
        )

    choice = next(
        (
            item for item in scenario["choices"]
            if item["id"] == request.answer
        ),
        None
    )

    if choice is None:
        raise HTTPException(
            status_code=400,
            detail="Invalid answer"
        )

    score = choice["score"]
    skill = scenario["skill"]

    if score < 70:
        player["weaknesses"][skill] += 1

    if score >= 90:
        verdict = "Excellent decision"
        strength = "You made a strong tactical decision."
        improvement = "Keep applying this decision-making process."
    elif score >= 50:
        verdict = "Room for improvement"
        strength = "You recognized part of the situation."
        improvement = scenario["explanation"]
    else:
        verdict = "Poor tactical decision"
        strength = "You identified that action was available."
        improvement = scenario["explanation"]

    result = {
        "scenario": scenario["title"],
        "score": score,
        "verdict": verdict,
        "strength": strength,
        "improvement": improvement,
        "next_drill": (
            "Your next scenario will focus on "
            + skill + "."
        ),
        "skill_tag": skill
    }

    player["history"].append(result)

    return {
        "feedback": result,
        "weaknesses": player["weaknesses"],
        "total_attempts": len(player["history"])
    }


@app.get("/progress/{session_id}")
def get_progress(session_id: str):
    player = get_player(session_id)

    return {
        "history": player["history"],
        "weaknesses": player["weaknesses"],
        "total_attempts": len(player["history"])
    }
