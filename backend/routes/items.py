from fastapi import APIRouter, HTTPException
from database import get_connection
from models import ItemCreate, ItemUpdate

router = APIRouter()


@router.post("/batches/{batch_number}/items")
def add_item(batch_number: str, item: ItemCreate):
    """Add a cylinder/item to a batch."""
    conn = get_connection()
    cursor = conn.cursor()

    try:
        cursor.execute(
            "INSERT INTO items (batch_number, serial_number) VALUES (%s, %s)",
            (batch_number, item.serial_number)
        )
        conn.commit()
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=f"Error adding item: {str(e)}")
    finally:
        cursor.close()
        conn.close()

    return {"message": "Item added", "serial_number": item.serial_number}


@router.put("/batches/{batch_number}/items/{serial_number}")
def update_item(batch_number: str, serial_number: str, updates: ItemUpdate):
    """Update an item's fields (process, QC, seal, tag, inventory)."""
    conn = get_connection()
    cursor = conn.cursor()

    # Build dynamic SET clause from non-None fields
    update_data = updates.model_dump(exclude_none=True)
    if not update_data:
        cursor.close()
        conn.close()
        raise HTTPException(status_code=400, detail="No fields to update")

    set_parts = []
    values = []
    for key, value in update_data.items():
        set_parts.append(f"{key} = %s")
        values.append(value)

    values.append(batch_number)
    values.append(serial_number)

    query = f"UPDATE items SET {', '.join(set_parts)} WHERE batch_number = %s AND serial_number = %s"
    cursor.execute(query, values)

    if cursor.rowcount == 0:
        cursor.close()
        conn.close()
        raise HTTPException(status_code=404, detail="Item not found")

    conn.commit()
    cursor.close()
    conn.close()
    return {"message": "Item updated", "serial_number": serial_number}


@router.delete("/batches/{batch_number}/items/{serial_number}")
def delete_item(batch_number: str, serial_number: str):
    """Remove a cylinder/item from a batch."""
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(
        "DELETE FROM items WHERE batch_number = %s AND serial_number = %s",
        (batch_number, serial_number)
    )
    if cursor.rowcount == 0:
        cursor.close()
        conn.close()
        raise HTTPException(status_code=404, detail="Item not found")

    conn.commit()
    cursor.close()
    conn.close()
    return {"message": "Item deleted", "serial_number": serial_number}
