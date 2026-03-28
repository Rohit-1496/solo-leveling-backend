from sqlalchemy import ForeignKey, String, Integer, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship
from .database import Base
from typing import List

class Player(Base):
    __tablename__ = "players"

    id: Mapped[int] = mapped_column(primary_key=True)
    username: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    level: Mapped[int] = mapped_column(default=1)
    xp: Mapped[int] = mapped_column(default=0)
    hp: Mapped[int] = mapped_column(default=100)
    streak_days: Mapped[int] = mapped_column(default=0)

    # Relationships
    tasks: Mapped[List["DailyTask"]] = relationship(back_populates="player", cascade="all, delete-orphan")

class DailyTask(Base):
    __tablename__ = "daily_tasks"

    id: Mapped[int] = mapped_column(primary_key=True)
    player_id: Mapped[int] = mapped_column(ForeignKey("players.id"))
    title: Mapped[str] = mapped_column(String(200))
    is_fixed: Mapped[bool] = mapped_column(default=False)
    is_completed: Mapped[bool] = mapped_column(default=False)
    is_tomorrow: Mapped[bool] = mapped_column(default=False)

    # Relationships
    player: Mapped["Player"] = relationship(back_populates="tasks")
