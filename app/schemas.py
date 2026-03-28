from pydantic import BaseModel
from typing import Optional, List

class PlayerState(BaseModel):
    level: int
    xp: int
    hp: int
    streak_days: int

class TaskBase(BaseModel):
    title: str
    is_fixed: bool = False
    is_tomorrow: bool = False

class TaskCreate(TaskBase):
    player_id: int

class TaskResponse(TaskBase):
    id: int
    player_id: int
    is_completed: bool

    class Config:
        from_attributes = True

class SystemResponse(BaseModel):
    success: bool
    message: str
    player_state: Optional[PlayerState] = None
    penalty_triggered: bool = False
