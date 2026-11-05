from pydantic import BaseModel
from typing import List, Optional


# ── Ghost Mode ─────────────────────────────────────────────────────────────
class AccountabilitySetup(BaseModel):
    contact: str          # phone number or email
    partner_name: str     # friend's name for the message
    enabled: bool = True


class GhostCheckResponse(BaseModel):
    should_notify: bool
    message: str          # the playful warning message
    missed_habits: List[str]


# ── Anonymous Groups ────────────────────────────────────────────────────────
class GroupJoinRequest(BaseModel):
    goal_tag: str         # "5AM Club", "No Sugar", "Daily Reading"
    progress_pct: float = 0.0


class GroupMember(BaseModel):
    rank: int
    progress_pct: float   # ONLY progress shown — no names/ids


class GroupLeaderboard(BaseModel):
    group_id: str
    goal_tag: str
    members: List[GroupMember]
    your_rank: int
    your_progress: float
    total_members: int


# ── Kindness ────────────────────────────────────────────────────────────────
class KindnessChallenge(BaseModel):
    challenge_text: str
    emoji: str
    category: str         # "self", "stranger", "family", "community"


class KindnessCompleteRequest(BaseModel):
    challenge_text: str


class KindnessCompleteResponse(BaseModel):
    message: str
    streak: int
    xp_earned: int
