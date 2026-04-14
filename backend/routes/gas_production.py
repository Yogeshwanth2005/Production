from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from database import get_connection

router = APIRouter()


class GasProductionCreate(BaseModel):
    production_id: str
    date: str
    plant_location: str
    gas_type: str
    shift: str
    machine_unit: str
    operator_name: str
    quantity_produced: float = 0
    quantity_unit: str = "Kg"
    purity_level: float = 0
    pressure_level: float = 0
    linked_tank_id: Optional[str] = None
    remarks: Optional[str] = None
    approval_status: str = "Pending"


class GasProductionUpdate(BaseModel):
    approval_status: Optional[str] = None
    remarks: Optional[str] = None
    quantity_produced: Optional[float] = None
    purity_level: Optional[float] = None
    pressure_level: Optional[float] = None


@router.get("/gas-production")
def get_all():
    """Get all gas production entries."""
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM gas_production ORDER BY created_at DESC")
    rows = cursor.fetchall()
    cursor.close()
    conn.close()
    return rows


@router.post("/gas-production")
def create(entry: GasProductionCreate):
    """Create a new gas production entry."""
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            """INSERT INTO gas_production 
               (production_id, date, plant_location, gas_type, shift, machine_unit,
                operator_name, quantity_produced, quantity_unit, purity_level,
                pressure_level, linked_tank_id, remarks, approval_status)
               VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)""",
            (entry.production_id, entry.date, entry.plant_location, entry.gas_type,
             entry.shift, entry.machine_unit, entry.operator_name,
             entry.quantity_produced, entry.quantity_unit, entry.purity_level,
             entry.pressure_level, entry.linked_tank_id, entry.remarks,
             entry.approval_status)
        )
        conn.commit()
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        cursor.close()
        conn.close()
    return {"message": "Gas production entry created", "production_id": entry.production_id}


@router.put("/gas-production/{production_id}")
def update(production_id: str, updates: GasProductionUpdate):
    """Update a gas production entry (e.g. approval)."""
    conn = get_connection()
    cursor = conn.cursor()
    update_data = updates.model_dump(exclude_none=True)
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")

    set_parts = [f"{k} = %s" for k in update_data]
    values = list(update_data.values()) + [production_id]

    cursor.execute(f"UPDATE gas_production SET {', '.join(set_parts)} WHERE production_id = %s", values)
    if cursor.rowcount == 0:
        cursor.close()
        conn.close()
        raise HTTPException(status_code=404, detail="Entry not found")
    conn.commit()
    cursor.close()
    conn.close()
    return {"message": "Updated", "production_id": production_id}


@router.delete("/gas-production/{production_id}")
def delete(production_id: str):
    """Delete a gas production entry."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM gas_production WHERE production_id = %s", (production_id,))
    if cursor.rowcount == 0:
        cursor.close()
        conn.close()
        raise HTTPException(status_code=404, detail="Entry not found")
    conn.commit()
    cursor.close()
    conn.close()
    return {"message": "Deleted", "production_id": production_id}
