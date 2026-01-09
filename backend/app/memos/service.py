from sqlalchemy.orm import Session
from app.memos.models import Memo, MemoVersion
from app.memos.schemas import MemoCreate, MemoUpdate
from app.activities.service import create_activity
from app.activities.models import ActivityType


def get_memo_by_deal(db: Session, deal_id: int) -> Memo | None:
    return db.query(Memo).filter(Memo.deal_id == deal_id).first()


def get_memo(db: Session, memo_id: int) -> Memo | None:
    return db.query(Memo).filter(Memo.id == memo_id).first()


def create_memo(db: Session, memo: MemoCreate, user_id: int) -> Memo:
    # Check if memo already exists for this deal
    existing = get_memo_by_deal(db, memo.deal_id)
    if existing:
        raise ValueError("Memo already exists for this deal")
    
    db_memo = Memo(**memo.model_dump(exclude={"deal_id"}), deal_id=memo.deal_id, created_by_id=user_id)
    db.add(db_memo)
    db.commit()
    db.refresh(db_memo)
    
    # Create initial version
    create_memo_version(db, db_memo.id, db_memo, user_id)
    
    return db_memo


def update_memo(db: Session, memo_id: int, memo_update: MemoUpdate, user_id: int) -> Memo | None:
    db_memo = get_memo(db, memo_id)
    if not db_memo:
        return None
    
    # Get current version number
    latest_version = db.query(MemoVersion).filter(
        MemoVersion.memo_id == memo_id
    ).order_by(MemoVersion.version_number.desc()).first()
    
    next_version = (latest_version.version_number + 1) if latest_version else 1
    
    # Save current state as version
    create_memo_version(db, memo_id, db_memo, user_id, version_number=next_version)
    
    # Update memo
    update_data = memo_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_memo, key, value)
    
    db.commit()
    db.refresh(db_memo)
    
    # Create activity
    create_activity(
        db=db,
        deal_id=db_memo.deal_id,
        user_id=user_id,
        activity_type=ActivityType.MEMO_UPDATED,
        description=f"Memo updated (version {next_version})"
    )
    
    return db_memo


def create_memo_version(db: Session, memo_id: int, memo: Memo, user_id: int, version_number: int | None = None) -> MemoVersion:
    # Determine version number
    if version_number is None:
        latest_version = db.query(MemoVersion).filter(
            MemoVersion.memo_id == memo_id
        ).order_by(MemoVersion.version_number.desc()).first()
        version_number = (latest_version.version_number + 1) if latest_version else 1
    
    db_version = MemoVersion(
        memo_id=memo_id,
        version_number=version_number,
        summary=memo.summary,
        market=memo.market,
        product=memo.product,
        traction=memo.traction,
        risks=memo.risks,
        open_questions=memo.open_questions,
        created_by_id=user_id
    )
    db.add(db_version)
    db.commit()
    db.refresh(db_version)
    return db_version


def get_memo_versions(db: Session, memo_id: int) -> list[MemoVersion]:
    return db.query(MemoVersion).filter(MemoVersion.memo_id == memo_id).order_by(MemoVersion.version_number.desc()).all()


def get_memo_version(db: Session, version_id: int) -> MemoVersion | None:
    return db.query(MemoVersion).filter(MemoVersion.id == version_id).first()
