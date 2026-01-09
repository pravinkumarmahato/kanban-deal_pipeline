from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Enum as SQLEnum, Numeric, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import enum


class DealStage(str, enum.Enum):
    SOURCED = "sourced"
    SCREEN = "screen"
    DILIGENCE = "diligence"
    IC = "ic"
    INVESTED = "invested"
    PASSED = "passed"


class DealStatus(str, enum.Enum):
    ACTIVE = "active"
    APPROVED = "approved"
    DECLINED = "declined"


class Deal(Base):
    __tablename__ = "deals"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    company_url = Column(String, nullable=True)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    stage = Column(SQLEnum(DealStage), default=DealStage.SOURCED, nullable=False)
    round = Column(String, nullable=True)
    check_size = Column(Numeric(15, 2), nullable=True)
    status = Column(SQLEnum(DealStatus), default=DealStatus.ACTIVE, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    owner = relationship("User", back_populates="owned_deals", foreign_keys=[owner_id])
    activities = relationship("Activity", back_populates="deal", cascade="all, delete-orphan")
    memo = relationship("Memo", back_populates="deal", uselist=False, cascade="all, delete-orphan")
    votes = relationship("Vote", back_populates="deal", cascade="all, delete-orphan")


class Vote(Base):
    __tablename__ = "votes"
    
    id = Column(Integer, primary_key=True, index=True)
    deal_id = Column(Integer, ForeignKey("deals.id"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Ensure one vote per user per deal
    __table_args__ = (UniqueConstraint('deal_id', 'user_id', name='unique_user_deal_vote'),)
    
    # Relationships
    deal = relationship("Deal", back_populates="votes")
    user = relationship("User")
