from motor.motor_asyncio import AsyncIOMotorClient
from core.config import get_settings

settings = get_settings()

client = AsyncIOMotorClient(settings.mongo_uri)
db = client[settings.db_name]


def get_db():
    return db
