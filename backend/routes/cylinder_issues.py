from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from database import get_connection

router = APIRouter()


class CylinderIssueItemCreate(BaseModel):
    serial_number: str
    cylinder_type: str = ""
    current_status: str = "Empty"


class CylinderIssueCreate(BaseModel):
    issue_id: str
    date: str
    from_location: str
    to_location: str
    gas_type_planned: str
    items: List[CylinderIssueItemCreate] = []


class CylinderIssueItemOut(BaseModel):
    serial_number: str
    cylinder_type: str
    current_status: str


class CylinderIssueOut(BaseModel):
    issue_id: str
    date: str
    from_location: str
    to_location: str
    gas_type_planned: str
    status: str
    items: List[CylinderIssueItemOut] = []


@router.get("/cylinder-issues", response_model=List[CylinderIssueOut])
def get_all():
    """Get all cylinder issues with their items."""
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("SELECT * FROM cylinder_issues ORDER BY created_at DESC")
    issues = cursor.fetchall()

    result = []
    for issue in issues:
        cursor.execute(
            "SELECT serial_number, cylinder_type, current_status FROM cylinder_issue_items WHERE issue_id = %s",
            (issue["issue_id"],)
        )
        items = cursor.fetchall()
        result.append(CylinderIssueOut(
            issue_id=issue["issue_id"],
            date=issue["date"],
            from_location=issue["from_location"],
            to_location=issue["to_location"],
            gas_type_planned=issue["gas_type_planned"],
            status=issue["status"],
            items=[CylinderIssueItemOut(**i) for i in items]
        ))

    cursor.close()
    conn.close()
    return result


@router.post("/cylinder-issues")
def create(issue: CylinderIssueCreate):
    """Create a new cylinder issue with line items."""
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            """INSERT INTO cylinder_issues (issue_id, date, from_location, to_location, gas_type_planned)
               VALUES (%s, %s, %s, %s, %s)""",
            (issue.issue_id, issue.date, issue.from_location, issue.to_location, issue.gas_type_planned)
        )
        for item in issue.items:
            cursor.execute(
                """INSERT INTO cylinder_issue_items (issue_id, serial_number, cylinder_type, current_status)
                   VALUES (%s, %s, %s, %s)""",
                (issue.issue_id, item.serial_number, item.cylinder_type, item.current_status)
            )
        conn.commit()
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        cursor.close()
        conn.close()
    return {"message": "Cylinder issue created", "issue_id": issue.issue_id}


@router.post("/cylinder-issues/{issue_id}/items")
def add_item(issue_id: str, item: CylinderIssueItemCreate):
    """Add a cylinder to an existing issue."""
    conn = get_connection()
    cursor = conn.cursor()
    try:
        # Validate: only empty cylinders allowed
        if item.current_status != "Empty":
            raise HTTPException(status_code=400, detail="Only Empty cylinders can be issued to filling")
        cursor.execute(
            """INSERT INTO cylinder_issue_items (issue_id, serial_number, cylinder_type, current_status)
               VALUES (%s, %s, %s, %s)""",
            (issue_id, item.serial_number, item.cylinder_type, item.current_status)
        )
        conn.commit()
    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        cursor.close()
        conn.close()
    return {"message": "Item added", "serial_number": item.serial_number}


@router.delete("/cylinder-issues/{issue_id}/items/{serial_number}")
def remove_item(issue_id: str, serial_number: str):
    """Remove a cylinder from an issue."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        "DELETE FROM cylinder_issue_items WHERE issue_id = %s AND serial_number = %s",
        (issue_id, serial_number)
    )
    if cursor.rowcount == 0:
        cursor.close()
        conn.close()
        raise HTTPException(status_code=404, detail="Item not found")
    conn.commit()
    cursor.close()
    conn.close()
    return {"message": "Item removed"}


@router.put("/cylinder-issues/{issue_id}/complete")
def complete_issue(issue_id: str):
    """Mark a cylinder issue as completed."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE cylinder_issues SET status = 'Completed' WHERE issue_id = %s", (issue_id,))
    if cursor.rowcount == 0:
        cursor.close()
        conn.close()
        raise HTTPException(status_code=404, detail="Issue not found")
    conn.commit()
    cursor.close()
    conn.close()
    return {"message": "Issue completed", "issue_id": issue_id}
