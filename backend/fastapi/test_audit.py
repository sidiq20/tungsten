import asyncio
from models.base import AsyncSessionLocal
from models.audit_log import AuditLog
from sqlalchemy import select

async def main():
    async with AsyncSessionLocal() as session:
        result = await session.execute(
            select(AuditLog).order_by(AuditLog.timestamp.desc()).limit(10)
        )
        logs = result.scalars().all()
        print("\n--- Latest Audit Logs ---")
        for log in logs:
            print(f"Action: {log.action} | Desc: {log.description}")
            print(f"Metadata: {log.metadata_json}")
            print("-" * 30)

if __name__ == "__main__":
    asyncio.run(main())
