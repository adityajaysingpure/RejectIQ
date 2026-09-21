from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    app_name: str = "RejectIQ API"
    mongo_uri: str = "mongodb://localhost:27017"
    db_name: str = "rejectiq"
    openai_api_key: str = ""
    pinecone_api_key: str = ""
    pinecone_index: str = "rejectiq-resumes"
    pinecone_env: str = "gcp-starter"

    class Config:
        env_file = ".env"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
