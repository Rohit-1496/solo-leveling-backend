from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from ..database import get_db
from ..models import DailyTask, Player
from ..schemas import TaskCreate, TaskResponse, PlayerState, SystemResponse
from ..services.system_logic import process_complete_day

router = APIRouter(prefix="/api", tags=["System Logic"])

@router.get("/system/status/{player_id}")
async def get_system_status(player_id: int, db: AsyncSession = Depends(get_db)):
    # Fetch player
    p_res = await db.execute(select(Player).where(Player.id == player_id))
    player = p_res.scalar_one_or_none()
    
    if not player:
        raise HTTPException(status_code=404, detail="Player not found")
        
    # Fetch all tasks
    t_res = await db.execute(select(DailyTask).where(DailyTask.player_id == player_id))
    tasks = t_res.scalars().all()
    
    return {"player": player, "tasks": tasks}

@router.post("/system/initialize")
async def initialize_system(db: AsyncSession = Depends(get_db)):
    # Check if a player already exists
    res = await db.execute(select(Player).where(Player.id == 1))
    player = res.scalar_one_or_none()
    
    if player:
        return {"status": "Already Initialized", "player": player}
        
    # Create SUNG JINWOO (The Monarch)
    jinwoo = Player(
        id=1, 
        username="SUNG JINWOO", 
        level=1, 
        xp=0, 
        hp=100, 
        streak_days=0
    )
    db.add(jinwoo)
    try:
        await db.commit()
        await db.refresh(jinwoo)
        return {"status": "System Awakened", "player": jinwoo}
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Mana Corruption: {str(e)}")

@router.get("/tasks", response_model=list[TaskResponse])
async def get_tasks(player_id: int, db: AsyncSession = Depends(get_db)):
    t_res = await db.execute(select(DailyTask).where(DailyTask.player_id == player_id))
    return t_res.scalars().all()

@router.post("/tasks", response_model=TaskResponse)
async def create_task(task: TaskCreate, db: AsyncSession = Depends(get_db)):
    new_task = DailyTask(**task.model_dump())
    db.add(new_task)
    await db.commit()
    await db.refresh(new_task)
    return new_task

@router.put("/tasks/{task_id}/toggle", response_model=PlayerState)
async def toggle_task(task_id: int, db: AsyncSession = Depends(get_db)):
    task_result = await db.execute(select(DailyTask).where(DailyTask.id == task_id))
    task = task_result.scalar_one_or_none()
    
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    player_result = await db.execute(select(Player).where(Player.id == task.player_id))
    player = player_result.scalar_one_or_none()

    # Toggle logic
    task.is_completed = not task.is_completed
    xp_change = 10 if task.is_completed else -10
    player.xp += xp_change
    
    # RPG Level Logic
    while player.xp >= 100:
        player.xp -= 100
        player.level += 1
    while player.xp < 0 and player.level > 1:
        player.level -= 1
        player.xp += 100
    if player.xp < 0: player.xp = 0

    await db.commit()
    await db.refresh(player)
    
    return PlayerState(
        level=player.level,
        xp=player.xp,
        hp=player.hp,
        streak_days=player.streak_days
    )

@router.post("/system/complete_day/{player_id}", response_model=SystemResponse)
async def complete_day(player_id: int, db: AsyncSession = Depends(get_db)):
    return await process_complete_day(player_id, db)

@router.post("/system/heal/{player_id}", response_model=PlayerState)
async def heal_player(player_id: int, db: AsyncSession = Depends(get_db)):
    player_result = await db.execute(select(Player).where(Player.id == player_id))
    player = player_result.scalar_one_or_none()
    
    if not player:
        raise HTTPException(status_code=404, detail="Hunter not found")
    
    # RECOVERY PROTOCOL
    player.hp = 100
    player.xp += 20
    
    # Level-up logic check
    while player.xp >= 100:
        player.level += 1
        player.xp -= 100
        
    await db.commit()
    await db.refresh(player)
    
    return PlayerState(
        level=player.level,
        xp=player.xp,
        hp=player.hp,
        streak_days=player.streak_days
    )
