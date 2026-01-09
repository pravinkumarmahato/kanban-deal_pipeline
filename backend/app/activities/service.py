from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.activities.models import Activity, ActivityType
from app.activities.schemas import ActivityCreate
from app.deals.models import Deal, Vote, DealStatus


def get_activities_by_deal(db: Session, deal_id: int, skip: int = 0, limit: int = 100):
    return db.query(Activity).filter(Activity.deal_id == deal_id).order_by(Activity.created_at.desc()).offset(skip).limit(limit).all()


def create_activity(
    db: Session,
    deal_id: int,
    user_id: int,
    activity_type: ActivityType,
    description: str
) -> Activity:
    db_activity = Activity(
        deal_id=deal_id,
        user_id=user_id,
        activity_type=activity_type,
        description=description
    )
    db.add(db_activity)
    db.commit()
    db.refresh(db_activity)
    return db_activity


def add_comment(
    db: Session,
    deal_id: int,
    user_id: int,
    comment: str
) -> Activity:
    # Verify deal exists
    deal = db.query(Deal).filter(Deal.id == deal_id).first()
    if not deal:
        raise HTTPException(status_code=404, detail="Deal not found")
    
    return create_activity(
        db=db,
        deal_id=deal_id,
        user_id=user_id,
        activity_type=ActivityType.COMMENT,
        description=comment
    )


def cast_vote(
    db: Session,
    deal_id: int,
    user_id: int
) -> Vote:
    # Verify deal exists
    deal = db.query(Deal).filter(Deal.id == deal_id).first()
    if not deal:
        raise HTTPException(status_code=404, detail="Deal not found")
    
    # Check if user already voted
    existing_vote = db.query(Vote).filter(
        Vote.deal_id == deal_id,
        Vote.user_id == user_id
    ).first()
    
    if existing_vote:
        raise HTTPException(
            status_code=400,
            detail="You have already voted on this deal"
        )
    
    # Create vote
    db_vote = Vote(deal_id=deal_id, user_id=user_id)
    db.add(db_vote)
    
    # Create activity
    create_activity(
        db=db,
        deal_id=deal_id,
        user_id=user_id,
        activity_type=ActivityType.VOTE,
        description="Voted on this deal"
    )
    
    db.commit()
    db.refresh(db_vote)
    return db_vote


def approve_deal(
    db: Session,
    deal_id: int,
    user_id: int
) -> Deal:
    deal = db.query(Deal).filter(Deal.id == deal_id).first()
    if not deal:
        raise HTTPException(status_code=404, detail="Deal not found")
    
    # Update deal status
    deal.status = DealStatus.APPROVED
    
    # Create activity
    create_activity(
        db=db,
        deal_id=deal_id,
        user_id=user_id,
        activity_type=ActivityType.APPROVAL,
        description="Approved this deal"
    )
    
    db.commit()
    db.refresh(deal)
    return deal


def decline_deal(
    db: Session,
    deal_id: int,
    user_id: int
) -> Deal:
    deal = db.query(Deal).filter(Deal.id == deal_id).first()
    if not deal:
        raise HTTPException(status_code=404, detail="Deal not found")
    
    # Update deal status
    deal.status = DealStatus.DECLINED
    
    # Create activity
    create_activity(
        db=db,
        deal_id=deal_id,
        user_id=user_id,
        activity_type=ActivityType.DECLINE,
        description="Declined this deal"
    )
    
    db.commit()
    db.refresh(deal)
    return deal


def get_vote_by_user_and_deal(db: Session, deal_id: int, user_id: int) -> Vote | None:
    return db.query(Vote).filter(
        Vote.deal_id == deal_id,
        Vote.user_id == user_id
    ).first()


def get_votes_by_deal(db: Session, deal_id: int):
    return db.query(Vote).filter(Vote.deal_id == deal_id).all()
