from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.core.dependencies import get_current_active_user, require_role
from app.users.models import User, UserRole
from app.deals.models import Deal, DealStage
from app.deals.schemas import DealCreate, DealResponse, DealUpdate
from app.deals.service import get_deal, get_deals, create_deal, update_deal, delete_deal

router = APIRouter(prefix="/deals", tags=["deals"])


@router.get("", response_model=List[DealResponse])
def read_deals(
    skip: int = 0,
    limit: int = 100,
    stage: DealStage | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    deals = get_deals(db, skip=skip, limit=limit, stage=stage)
    return deals


@router.get("/{deal_id}", response_model=DealResponse)
def read_deal(
    deal_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    deal = get_deal(db, deal_id)
    if deal is None:
        raise HTTPException(status_code=404, detail="Deal not found")
    return deal


@router.post("", response_model=DealResponse, status_code=status.HTTP_201_CREATED)
def create_new_deal(
    deal: DealCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.ADMIN, UserRole.ANALYST]))
):
    return create_deal(db, deal, owner_id=current_user.id)


@router.put("/{deal_id}", response_model=DealResponse)
def update_existing_deal(
    deal_id: int,
    deal_update: DealUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.ADMIN, UserRole.ANALYST]))
):
    updated_deal = update_deal(db, deal_id, deal_update, user_id=current_user.id)
    if updated_deal is None:
        raise HTTPException(status_code=404, detail="Deal not found")
    return updated_deal


@router.delete("/{deal_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_existing_deal(
    deal_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.ADMIN, UserRole.ANALYST]))
):
    success = delete_deal(db, deal_id)
    if not success:
        raise HTTPException(status_code=404, detail="Deal not found")
