from fastapi import APIRouter
from database import get_connection
from models import SafetyChecklistCreate, SafetyChecklistOut

router = APIRouter()


@router.get("/safety-checklists", response_model=list[SafetyChecklistOut])
def get_all_checklists():
    """Get all safety checklists."""
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("SELECT * FROM safety_checklists ORDER BY created_at DESC")
    rows = cursor.fetchall()

    cursor.close()
    conn.close()

    return [SafetyChecklistOut(**row) for row in rows]


@router.post("/safety-checklists", response_model=SafetyChecklistOut)
def create_checklist(checklist: SafetyChecklistCreate):
    """Submit a new safety checklist."""
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(
        """INSERT INTO safety_checklists 
           (checklist_id, batch_number, date, filling_station, supervisor_name,
            equipment_condition, safety_valves, fire_safety, ppe_compliance, status)
           VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)""",
        (
            checklist.checklist_id, checklist.batch_number, checklist.date,
            checklist.filling_station, checklist.supervisor_name,
            checklist.equipment_condition, checklist.safety_valves,
            checklist.fire_safety, checklist.ppe_compliance, checklist.status
        )
    )
    new_id = cursor.lastrowid
    conn.commit()
    cursor.close()
    conn.close()

    return SafetyChecklistOut(id=new_id, **checklist.model_dump())
