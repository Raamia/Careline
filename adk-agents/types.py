from typing import Dict, List, Optional, Any, Literal
from pydantic import BaseModel, Field
from datetime import datetime
from enum import Enum

# Core Enums
class UrgencyLevel(str, Enum):
    ROUTINE = "routine"
    URGENT = "urgent"
    STAT = "stat"

class ReferralStatus(str, Enum):
    PENDING = "pending"
    SENT = "sent"
    SCHEDULED = "scheduled"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class AgentType(str, Enum):
    ORCHESTRATOR = "orchestrator"
    DIRECTORY = "directory"
    AVAILABILITY = "availability"
    COST = "cost"
    RECORDS = "records"
    SUMMARIZER = "summarizer"
    LOOP = "loop"

class TaskStatus(str, Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"

# Core Data Models
class Referral(BaseModel):
    id: str
    patient_id: str
    from_doctor_id: str
    to_doctor_id: Optional[str] = None
    specialty: str
    reason: str
    urgency: UrgencyLevel
    status: ReferralStatus
    created_at: datetime
    updated_at: datetime
    scheduled_date: Optional[datetime] = None
    notes: Optional[str] = None

class Provider(BaseModel):
    id: str
    name: str
    npi_number: str
    specialty: str
    practice: str
    address: Dict[str, str]
    phone: str
    email: Optional[str] = None
    distance_km: Optional[float] = None
    in_network: bool = True
    rating: Optional[float] = None
    accepting_new_patients: bool = True

class AvailabilitySlot(BaseModel):
    provider_id: str
    slot: str  # ISO datetime string
    duration: int  # minutes
    appointment_type: str

class CostEstimate(BaseModel):
    provider_id: str
    estimate_low: float
    estimate_high: float
    copay: Optional[float] = None
    deductible: Optional[float] = None
    coinsurance: Optional[float] = None
    notes: Optional[str] = None

class MedicalRecord(BaseModel):
    id: str
    patient_id: str
    conditions: List[Dict[str, Any]]
    medications: List[Dict[str, Any]]
    allergies: List[Dict[str, Any]]
    lab_results: List[Dict[str, Any]]
    created_at: datetime
    updated_at: datetime

class ClinicianBrief(BaseModel):
    id: str
    referral_id: str
    patient_id: str
    problem_list: List[str]
    current_medications: List[str]
    allergies: List[str]
    key_labs: List[str]
    red_flags: List[str]
    clinical_summary: str
    recommendations: Optional[List[str]] = None
    generated_at: datetime

class PatientExplainer(BaseModel):
    id: str
    referral_id: str
    patient_id: str
    summary: str
    what_to_expect: str
    what_to_bring: List[str]
    questions: List[str]
    generated_at: datetime

class DecisionCard(BaseModel):
    id: str
    referral_id: str
    providers: List[Provider]
    availability: List[AvailabilitySlot]
    cost_estimates: List[CostEstimate]
    patient_explainer: Optional[PatientExplainer] = None
    created_at: datetime

# Agent Task Models
class AgentTask(BaseModel):
    id: str
    type: AgentType
    referral_id: str
    status: TaskStatus
    inputs: Dict[str, Any]
    outputs: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    created_at: datetime
    completed_at: Optional[datetime] = None

# Event Models
class ReferralCreatedEvent(BaseModel):
    type: Literal["referral.created"]
    referral_id: str
    patient_id: str
    specialty: str
    timestamp: datetime

class RecordsUpdatedEvent(BaseModel):
    type: Literal["records.updated"]
    patient_id: str
    referral_id: Optional[str] = None
    timestamp: datetime

class TaskCompletedEvent(BaseModel):
    type: Literal["task.completed"]
    task_id: str
    referral_id: str
    agent_type: AgentType
    outputs: Dict[str, Any]
    timestamp: datetime

# A2A Message Models
class A2AMessage(BaseModel):
    id: str = Field(default_factory=lambda: f"msg_{datetime.now().timestamp()}")
    from_agent: str
    to_agent: str
    action: str
    data: Dict[str, Any]
    timestamp: datetime = Field(default_factory=datetime.now)
    correlation_id: Optional[str] = None

class A2AResponse(BaseModel):
    message_id: str
    success: bool
    data: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.now)

# Agent Input/Output Models
class DirectoryAgentInput(BaseModel):
    referral_id: str
    specialty: str
    patient_id: str
    zip_code: Optional[str] = None

class DirectoryAgentOutput(BaseModel):
    providers: List[Provider]

class AvailabilityAgentInput(BaseModel):
    referral_id: str
    provider_ids: List[str]
    urgency: Optional[UrgencyLevel] = UrgencyLevel.ROUTINE

class AvailabilityAgentOutput(BaseModel):
    availability: List[AvailabilitySlot]

class CostAgentInput(BaseModel):
    referral_id: str
    providers: List[Provider]
    patient_insurance: Optional[Dict[str, str]] = None

class CostAgentOutput(BaseModel):
    estimates: List[CostEstimate]

class RecordsAgentInput(BaseModel):
    referral_id: str
    patient_id: str
    record_sources: Optional[List[str]] = None

class RecordsAgentOutput(BaseModel):
    medical_record: MedicalRecord
    records_processed: int

class SummarizerAgentInput(BaseModel):
    referral_id: str
    patient_id: str
    referral: Referral
    medical_record: Optional[MedicalRecord] = None

class SummarizerAgentOutput(BaseModel):
    clinician_brief: ClinicianBrief
    patient_explainer: PatientExplainer
