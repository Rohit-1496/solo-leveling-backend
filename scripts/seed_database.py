import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select
import os
import sys

# Add the project root to sys.path to import models
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from app.models import Player, Base

# PRODUCTION CONNECTION STRING
# (Found in your secure records: npg_S2KhVU6zlQOc)
DATABASE_URL = "postgresql+asyncpg://neondb_owner:npg_S2KhVU6zlQOc@ep-dark-haze-a409nyel-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require"

async def seed_monarch():
    print("💎 Connecting to the Mana Core (Neon DB)...")
    engine = create_async_engine(DATABASE_URL, echo=True)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with async_session() as session:
        async with session.begin():
            # Check if Player 1 exists
            res = await session.execute(select(Player).where(Player.id == 1))
            player = res.scalar_one_or_none()

            if player:
                print(f"🗡️  {player.username} is already initialized. Level {player.level}.")
            else:
                print("🌑 Shadow Monarch not found. Initializing 'SUNG JINWOO'...")
                jinwoo = Player(
                    id=1,
                    username="SUNG JINWOO",
                    level=1,
                    xp=0,
                    hp=100,
                    streak_days=0
                )
                session.add(jinwoo)
                print("✨ The System has Awakened. SUNG JINWOO added to Player ID 1.")
        
        await session.commit()
    
    await engine.dispose()
    print("✅ Ignition Complete.")

if __name__ == "__main__":
    asyncio.run(seed_monarch())
