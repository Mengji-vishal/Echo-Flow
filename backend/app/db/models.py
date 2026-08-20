from datetime import datetime, timezone
from sqlalchemy import (
    Column,
    String,
    DateTime,
    Integer,
    SmallInteger,
    Text,
    ForeignKey,
    UniqueConstraint,
    CheckConstraint,
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()


class Manager(Base):
    __tablename__ = "managers"

    id = Column(String(64), primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    calls = relationship("Call", back_populates="manager", cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "role": "manager",
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class Employee(Base):
    __tablename__ = "employees"

    id = Column(String(64), primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    phone_number = Column(String(32), nullable=True, index=True)
    password_hash = Column(String(255), nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    calls = relationship("Call", back_populates="employee", cascade="all, delete-orphan")
    training_modules = relationship("TrainingModule", back_populates="employee", cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "phone_number": self.phone_number,
            "role": "employee",
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class Call(Base):
    __tablename__ = "calls"

    id = Column(String(64), primary_key=True, index=True)
    manager_id = Column(String(64), ForeignKey("managers.id", ondelete="CASCADE"), nullable=False, index=True)
    employee_id = Column(String(64), ForeignKey("employees.id", ondelete="CASCADE"), nullable=False, index=True)
    status = Column(String(32), default="created", nullable=False, index=True)
    started_at = Column(DateTime(timezone=True), nullable=True)
    ended_at = Column(DateTime(timezone=True), nullable=True)
    duration_seconds = Column(Integer, nullable=True)
    provider_call_id = Column(String(128), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    manager = relationship("Manager", back_populates="calls")
    employee = relationship("Employee", back_populates="calls")
    questions = relationship("CallQuestion", back_populates="call", cascade="all, delete-orphan", order_by="CallQuestion.question_number")
    transcripts = relationship("CallTranscript", back_populates="call", cascade="all, delete-orphan", order_by="CallTranscript.created_at")
    analysis = relationship("CallAnalysis", uselist=False, back_populates="call", cascade="all, delete-orphan")
    training_modules = relationship("TrainingModule", back_populates="source_call")

    def to_dict(self, include_details: bool = False):
        data = {
            "id": self.id,
            "manager_id": self.manager_id,
            "employee_id": self.employee_id,
            "employee_name": self.employee.name if self.employee else None,
            "employee_email": self.employee.email if self.employee else None,
            "employee_phone": self.employee.phone_number if self.employee else None,
            "status": self.status,
            "started_at": self.started_at.isoformat() if self.started_at else None,
            "ended_at": self.ended_at.isoformat() if self.ended_at else None,
            "duration_seconds": self.duration_seconds,
            "provider_call_id": self.provider_call_id,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
        if include_details:
            data["questions"] = [q.to_dict() for q in self.questions]
            data["transcripts"] = [t.to_dict() for t in self.transcripts]
            data["analysis"] = self.analysis.to_dict() if self.analysis else None
        else:
            data["questions_count"] = len(self.questions) if self.questions else 0
        return data


class CallQuestion(Base):
    __tablename__ = "call_questions"

    id = Column(String(64), primary_key=True, index=True)
    call_id = Column(String(64), ForeignKey("calls.id", ondelete="CASCADE"), nullable=False, index=True)
    question_number = Column(SmallInteger, nullable=False)
    question_text = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    call = relationship("Call", back_populates="questions")

    __table_args__ = (
        UniqueConstraint("call_id", "question_number", name="uq_call_question_number"),
        CheckConstraint("question_number >= 1 AND question_number <= 5", name="chk_question_number_range"),
    )

    def to_dict(self):
        return {
            "id": self.id,
            "call_id": self.call_id,
            "question_number": self.question_number,
            "question_text": self.question_text,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class CallTranscript(Base):
    __tablename__ = "call_transcripts"

    id = Column(String(64), primary_key=True, index=True)
    call_id = Column(String(64), ForeignKey("calls.id", ondelete="CASCADE"), nullable=False, index=True)
    speaker = Column(String(16), nullable=False)
    text = Column(Text, nullable=False)
    timestamp = Column(String(16), nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    call = relationship("Call", back_populates="transcripts")

    __table_args__ = (
        CheckConstraint("speaker IN ('ai', 'employee')", name="chk_speaker_role"),
    )

    def to_dict(self):
        return {
            "id": self.id,
            "call_id": self.call_id,
            "speaker": self.speaker,
            "text": self.text,
            "timestamp": self.timestamp,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class CallAnalysis(Base):
    __tablename__ = "call_analysis"

    id = Column(String(64), primary_key=True, index=True)
    call_id = Column(String(64), ForeignKey("calls.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    overall_score = Column(SmallInteger, nullable=False)
    metrics = Column(JSONB, nullable=False, default=dict)
    strengths = Column(JSONB, nullable=False, default=list)
    weaknesses = Column(JSONB, nullable=False, default=list)
    recommendations = Column(JSONB, nullable=False, default=list)
    summary = Column(Text, nullable=True)
    insights = Column(JSONB, nullable=False, default=list)
    question_evaluations = Column(JSONB, nullable=False, default=list)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    call = relationship("Call", back_populates="analysis")

    __table_args__ = (
        CheckConstraint("overall_score >= 0 AND overall_score <= 100", name="chk_overall_score_range"),
    )

    def to_dict(self):
        return {
            "id": self.id,
            "call_id": self.call_id,
            "overall_score": self.overall_score,
            "metrics": self.metrics,
            "strengths": self.strengths,
            "weaknesses": self.weaknesses,
            "recommendations": self.recommendations,
            "summary": self.summary,
            "insights": self.insights,
            "question_evaluations": self.question_evaluations,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class TrainingModule(Base):
    __tablename__ = "training_modules"

    id = Column(String(64), primary_key=True, index=True)
    employee_id = Column(String(64), ForeignKey("employees.id", ondelete="CASCADE"), nullable=False, index=True)
    source_call_id = Column(String(64), ForeignKey("calls.id", ondelete="SET NULL"), nullable=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    skill_area = Column(String(64), nullable=False, index=True)
    difficulty = Column(String(32), default="Intermediate", nullable=False)
    estimated_duration = Column(String(32), default="20 mins", nullable=False)
    why_recommended = Column(Text, nullable=True)
    learning_objectives = Column(JSONB, nullable=False, default=list)
    content = Column(JSONB, nullable=False, default=dict)
    progress = Column(SmallInteger, default=0, nullable=False)
    status = Column(String(32), default="active", nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime(timezone=True), nullable=True)

    employee = relationship("Employee", back_populates="training_modules")
    source_call = relationship("Call", back_populates="training_modules")

    def to_dict(self):
        return {
            "id": self.id,
            "employee_id": self.employee_id,
            "source_call_id": self.source_call_id,
            "title": self.title,
            "description": self.description,
            "skill_area": self.skill_area,
            "difficulty": self.difficulty,
            "estimated_duration": self.estimated_duration,
            "why_recommended": self.why_recommended,
            "learning_objectives": self.learning_objectives,
            "content": self.content,
            "progress": self.progress,
            "status": self.status,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
