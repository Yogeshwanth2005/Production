from pydantic import BaseModel
from typing import Optional, List


# --- Batch Models ---

class BatchCreate(BaseModel):
    batch_number: str
    product_type: str
    batch_date: Optional[str] = None
    gas_type: Optional[str] = None
    filling_station: Optional[str] = None
    tank_id: Optional[str] = None
    operator_name: Optional[str] = None
    shift: Optional[str] = None


class ItemOut(BaseModel):
    serial_number: str
    input_value: float = 0
    output_value: float = 0
    net_output: float = 0
    indicator: str = ""
    item_status: str = "Issued"
    process_status: Optional[str] = None
    qc_status: Optional[str] = None
    validation_color: Optional[str] = None
    gas_purity: Optional[float] = None
    pressure_check: Optional[str] = None
    leak_test: Optional[str] = None
    valve_condition: Optional[str] = None
    remarks: Optional[str] = None
    production_date: Optional[str] = None
    seal_number: Optional[str] = None
    seal_type: Optional[str] = None
    sealing_date: Optional[str] = None
    tag_number: Optional[str] = None
    expiry_date: Optional[str] = None
    inventory_location: Optional[str] = None
    move_date: Optional[str] = None
    transaction_id: Optional[str] = None


class BatchOut(BaseModel):
    batch_number: str
    product_type: str
    status: str
    batch_date: Optional[str] = None
    gas_type: Optional[str] = None
    filling_station: Optional[str] = None
    tank_id: Optional[str] = None
    operator_name: Optional[str] = None
    shift: Optional[str] = None
    items: List[ItemOut] = []


# --- Item Models ---

class ItemCreate(BaseModel):
    serial_number: str


class ItemUpdate(BaseModel):
    input_value: Optional[float] = None
    output_value: Optional[float] = None
    net_output: Optional[float] = None
    indicator: Optional[str] = None
    item_status: Optional[str] = None
    process_status: Optional[str] = None
    qc_status: Optional[str] = None
    validation_color: Optional[str] = None
    gas_purity: Optional[float] = None
    pressure_check: Optional[str] = None
    leak_test: Optional[str] = None
    valve_condition: Optional[str] = None
    remarks: Optional[str] = None
    production_date: Optional[str] = None
    seal_number: Optional[str] = None
    seal_type: Optional[str] = None
    sealing_date: Optional[str] = None
    tag_number: Optional[str] = None
    expiry_date: Optional[str] = None
    inventory_location: Optional[str] = None
    move_date: Optional[str] = None
    transaction_id: Optional[str] = None


# --- Safety Checklist Models ---

class SafetyChecklistCreate(BaseModel):
    checklist_id: str
    batch_number: Optional[str] = None
    date: str
    filling_station: str
    supervisor_name: str
    equipment_condition: str = "OK"
    safety_valves: str = "OK"
    fire_safety: str = "OK"
    ppe_compliance: str = "OK"
    status: str = "Passed"


class SafetyChecklistOut(BaseModel):
    id: int
    checklist_id: str
    batch_number: Optional[str] = None
    date: str
    filling_station: str
    supervisor_name: str
    equipment_condition: str
    safety_valves: str
    fire_safety: str
    ppe_compliance: str
    status: str
