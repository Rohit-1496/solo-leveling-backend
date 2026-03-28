from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from ..models import Player, DailyTask
from ..schemas import PlayerState, SystemResponse

async def process_complete_day(player_id: int, db: AsyncSession) -> SystemResponse:
    # 1. Fetch player and today's tasks
    player_result = await db.execute(select(Player).where(Player.id == player_id))
    player = player_result.scalar_one_or_none()
    
    if not player:
        return SystemResponse(success=False, message="Player not found")

    tasks_result = await db.execute(
        select(DailyTask).where(
            DailyTask.player_id == player_id, 
            DailyTask.is_tomorrow == False
        )
    )
    today_tasks = tasks_result.scalars().all()

    # 2. Calculate streak and HP penalty
    missed_fixed = [t for t in today_tasks if t.is_fixed and not t.is_completed]
    damage = len(missed_fixed) * 10
    penalty_triggered = damage > 0
    
    all_completed = all(t.is_completed for t in today_tasks) if today_tasks else False
    
    if all_completed and len(today_tasks) > 0:
        player.streak_days += 1
    else:
        player.streak_days = 0
        if damage > 0:
            player.hp = max(0, player.hp - damage)
        else:
            player.hp = max(0, player.hp - 10) # Minimum penalty for incomplete day

    # 3. Handle Dynamic vs Fixed Tasks
    for task in today_tasks:
        if task.is_fixed:
            task.is_completed = False # Reset fixed
        else:
            await db.delete(task) # Remove dynamic

    # 4. Promote Tomorrow's Tasks
    await db.execute(
        update(DailyTask)
        .where(DailyTask.player_id == player_id, DailyTask.is_tomorrow == True)
        .values(is_tomorrow=False)
    )

    # 5. Commit Atomically
    await db.commit()
    await db.refresh(player)

    return SystemResponse(
        success=True,
        message="System Synchronized: Tomorrow's quests are now active.",
        player_state=PlayerState(
            level=player.level,
            xp=player.xp,
            hp=player.hp,
            streak_days=player.streak_days
        ),
        penalty_triggered=penalty_triggered
    )
