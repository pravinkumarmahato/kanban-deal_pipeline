from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.core.dependencies import get_current_active_user, require_role
from app.users.models import User, UserRole
from app.memos.schemas import MemoCreate, MemoResponse, MemoUpdate, MemoVersionResponse
from app.memos.service import (
    get_memo_by_deal, get_memo, create_memo, update_memo,
    get_memo_versions, get_memo_version
)

router = APIRouter(prefix="/memos", tags=["memos"])


@router.get("/deal/{deal_id}", response_model=MemoResponse)
def read_memo_by_deal(
    deal_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    memo = get_memo_by_deal(db, deal_id)
    if memo is None:
        raise HTTPException(status_code=404, detail="Memo not found for this deal")
    return memo


@router.get("/{memo_id}", response_model=MemoResponse)
def read_memo(
    memo_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    memo = get_memo(db, memo_id)
    if memo is None:
        raise HTTPException(status_code=404, detail="Memo not found")
    return memo


@router.get("/{memo_id}/versions", response_model=List[MemoVersionResponse])
def read_memo_versions(
    memo_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    versions = get_memo_versions(db, memo_id)
    return versions


@router.get("/versions/{version_id}", response_model=MemoVersionResponse)
def read_memo_version(
    version_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    version = get_memo_version(db, version_id)
    if version is None:
        raise HTTPException(status_code=404, detail="Memo version not found")
    return version


@router.post("", response_model=MemoResponse, status_code=status.HTTP_201_CREATED)
def create_new_memo(
    memo: MemoCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.ADMIN, UserRole.ANALYST]))
):
    try:
        print(memo)
        print(current_user)
        return create_memo(db, memo, user_id=current_user.id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.put("/{memo_id}", response_model=MemoResponse)
def update_existing_memo(
    memo_id: int,
    memo_update: MemoUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.ADMIN, UserRole.ANALYST]))
):
    updated_memo = update_memo(db, memo_id, memo_update, user_id=current_user.id)
    if updated_memo is None:
        raise HTTPException(status_code=404, detail="Memo not found")
    return updated_memo
