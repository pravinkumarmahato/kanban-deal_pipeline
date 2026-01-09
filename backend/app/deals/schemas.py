from pydantic import BaseModel, HttpUrl
from datetime import datetime
from decimal import Decimal
from app.deals.models import DealStage, DealStatus


class DealBase(BaseModel):
    name: str
    company_url: str | None = None
    stage: DealStage = DealStage.SOURCED
    round: str | None = None
    check_size: Decimal | None = None
    status: DealStatus = DealStatus.ACTIVE


class DealCreate(DealBase):
    pass


class DealUpdate(BaseModel):
    name: str | None = None
    company_url: str | None = None
    stage: DealStage | None = None
    round: str | None = None
    check_size: Decimal | None = None
    status: DealStatus | None = None


class DealResponse(DealBase):
    id: int
    owner_id: int
    created_at: datetime
    updated_at: datetime | None
    
    class Config:
        from_attributes = True
