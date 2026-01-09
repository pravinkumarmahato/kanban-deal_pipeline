from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # Database
    database_url: str = "postgresql://postgres:postgres@localhost:5432/deal_pipeline"

    # docker run -d --name deal_pipeline_postgres -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=deal_pipeline -p 5432:5432 postgres:latest
    
    # JWT
    secret_key: str = "your-secret-key-change-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    
    # App
    project_name: str = "Deal Pipeline API"
    
    class Config:
        env_file = ".env"


settings = Settings()
