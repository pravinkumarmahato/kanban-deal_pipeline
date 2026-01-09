from pydantic import BaseModel
from datetime import datetime
from app.activities.models import ActivityType


class ActivityBase(BaseModel):
    activity_type: ActivityType
    description: str


class ActivityCreate(ActivityBase):
    deal_id: int


class ActivityResponse(ActivityBase):
    id: int
    deal_id: int
    user_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True


# Partner action schemas
class CommentCreate(BaseModel):
    deal_id: int
    comment: str


class VoteResponse(BaseModel):
    id: int
    deal_id: int
    user_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True
