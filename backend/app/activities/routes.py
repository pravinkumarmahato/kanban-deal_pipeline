from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.core.dependencies import get_current_active_user, require_role
from app.users.models import User, UserRole
from app.activities.schemas import ActivityResponse, CommentCreate, VoteResponse
from app.activities.service import (
    get_activities_by_deal, add_comment, cast_vote, 
    approve_deal, decline_deal, get_vote_by_user_and_deal, get_votes_by_deal
)
from app.deals.schemas import DealResponse

router = APIRouter(prefix="/activities", tags=["activities"])


@router.get("/deal/{deal_id}", response_model=List[ActivityResponse])
def read_activities_by_deal(
    deal_id: int,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    activities = get_activities_by_deal(db, deal_id, skip=skip, limit=limit)
    return activities


# Partner-only endpoints
@router.post("/comment", response_model=ActivityResponse, status_code=status.HTTP_201_CREATED)
def create_comment(
    comment_data: CommentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.PARTNER, UserRole.ADMIN, UserRole.ANALYST]))
):
    """Add a comment to a deal. Available to all roles."""
    return add_comment(db, comment_data.deal_id, current_user.id, comment_data.comment)


@router.post("/deal/{deal_id}/vote", response_model=VoteResponse, status_code=status.HTTP_201_CREATED)
def vote_on_deal(
    deal_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.PARTNER]))
):
    """Cast a vote on a deal. Partners only, one vote per partner per deal."""
    return cast_vote(db, deal_id, current_user.id)


@router.get("/deal/{deal_id}/vote", response_model=VoteResponse | None)
def get_user_vote(
    deal_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Check if current user has voted on a deal."""
    return get_vote_by_user_and_deal(db, deal_id, current_user.id)


@router.post("/deal/{deal_id}/approve", response_model=DealResponse)
def approve_deal_endpoint(
    deal_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.PARTNER]))
):
    """Approve a deal. Partners only. Changes deal status to APPROVED."""
    return approve_deal(db, deal_id, current_user.id)


@router.post("/deal/{deal_id}/decline", response_model=DealResponse)
def decline_deal_endpoint(
    deal_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.PARTNER]))
):
    """Decline a deal. Partners only. Changes deal status to DECLINED."""
    return decline_deal(db, deal_id, current_user.id)
