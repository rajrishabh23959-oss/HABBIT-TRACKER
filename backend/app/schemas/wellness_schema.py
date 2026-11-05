from pydantic import BaseModel, Field
from typing import Dict, Optional, List


class WellnessLogRequest(BaseModel):
    day: int = Field(..., ge=1, le=31)
    month: int = Field(..., ge=1, le=12)
    year: int = Field(..., ge=2000, le=2100)
    mood: Optional[float] = Field(None, ge=0, le=10, description="Mood score 0-10")
    sleep_hours: Optional[float] = Field(None, ge=0, le=24, description="Sleep hours 0-24")


class WellnessData(BaseModel):
    mood: Dict[str, Optional[float]] = {}
    sleep: Dict[str, Optional[float]] = {}


class DashboardResponse(BaseModel):
    month: str
    year: int
    total_days: int
    habits: List[dict]
    wellness: WellnessData
    daily_progress: List[float]
    overall_stats: dict
