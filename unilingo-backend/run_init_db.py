import asyncio
import sys
import os

# Add the project root to python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import init_db

async def main():
    print("Creating missing tables...")
    await init_db()
    print("Done!")

if __name__ == "__main__":
    asyncio.run(main())
