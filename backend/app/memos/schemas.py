from pydantic import BaseModel
from datetime import datetime


class MemoBase(BaseModel):
    summary: str | None = None
    market: str | None = None
    product: str | None = None
    traction: str | None = None
    risks: str | None = None
    open_questions: str | None = None


class MemoCreate(MemoBase):
    deal_id: int


class MemoUpdate(MemoBase):
    pass


class MemoResponse(MemoBase):
    id: int
    deal_id: int
    created_by_id: int
    created_at: datetime
    updated_at: datetime | None
    
    class Config:
        from_attributes = True


class MemoVersionResponse(BaseModel):
    id: int
    memo_id: int
    version_number: int
    summary: str | None
    market: str | None
    product: str | None
    traction: str | None
    risks: str | None
    open_questions: str | None
    created_by_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True
