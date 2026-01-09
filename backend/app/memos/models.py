from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class Memo(Base):
    __tablename__ = "memos"
    
    id = Column(Integer, primary_key=True, index=True)
    deal_id = Column(Integer, ForeignKey("deals.id"), unique=True, nullable=False, index=True)
    created_by_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    summary = Column(Text, nullable=True)
    market = Column(Text, nullable=True)
    product = Column(Text, nullable=True)
    traction = Column(Text, nullable=True)
    risks = Column(Text, nullable=True)
    open_questions = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    deal = relationship("Deal", back_populates="memo")
    created_by_user = relationship("User", back_populates="memos")
    versions = relationship("MemoVersion", back_populates="memo", cascade="all, delete-orphan", order_by="desc(MemoVersion.version_number)")


class MemoVersion(Base):
    __tablename__ = "memo_versions"
    
    id = Column(Integer, primary_key=True, index=True)
    memo_id = Column(Integer, ForeignKey("memos.id"), nullable=False, index=True)
    version_number = Column(Integer, nullable=False)
    summary = Column(Text, nullable=True)
    market = Column(Text, nullable=True)
    product = Column(Text, nullable=True)
    traction = Column(Text, nullable=True)
    risks = Column(Text, nullable=True)
    open_questions = Column(Text, nullable=True)
    created_by_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    memo = relationship("Memo", back_populates="versions")
