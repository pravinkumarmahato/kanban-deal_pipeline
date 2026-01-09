from sqlalchemy.orm import Session
from app.deals.models import Deal, DealStage
from app.deals.schemas import DealCreate, DealUpdate
from app.activities.service import create_activity
from app.activities.models import ActivityType


def get_deal(db: Session, deal_id: int) -> Deal | None:
    return db.query(Deal).filter(Deal.id == deal_id).first()


def get_deals(db: Session, skip: int = 0, limit: int = 100, stage: DealStage | None = None):
    query = db.query(Deal)
    if stage:
        query = query.filter(Deal.stage == stage)
    return query.offset(skip).limit(limit).all()


def create_deal(db: Session, deal: DealCreate, owner_id: int) -> Deal:
    db_deal = Deal(**deal.model_dump(), owner_id=owner_id)
    db.add(db_deal)
    db.commit()
    db.refresh(db_deal)
    
    # Create initial activity
    create_activity(
        db=db,
        deal_id=db_deal.id,
        user_id=owner_id,
        activity_type=ActivityType.STAGE_CHANGE,
        description=f"Deal created in {db_deal.stage.value} stage"
    )
    
    return db_deal


def update_deal(db: Session, deal_id: int, deal_update: DealUpdate, user_id: int) -> Deal | None:
    db_deal = get_deal(db, deal_id)
    if not db_deal:
        return None
    
    old_stage = db_deal.stage
    update_data = deal_update.model_dump(exclude_unset=True)
    
    for key, value in update_data.items():
        setattr(db_deal, key, value)
    
    # Track stage changes
    if "stage" in update_data and db_deal.stage != old_stage:
        create_activity(
            db=db,
            deal_id=deal_id,
            user_id=user_id,
            activity_type=ActivityType.STAGE_CHANGE,
            description=f"Moved from {old_stage.value} to {db_deal.stage.value}"
        )
    
    db.commit()
    db.refresh(db_deal)
    return db_deal


def delete_deal(db: Session, deal_id: int) -> bool:
    db_deal = get_deal(db, deal_id)
    if not db_deal:
        return False
    db.delete(db_deal)
    db.commit()
    return True
