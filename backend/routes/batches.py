from fastapi import APIRouter, HTTPException
from database import get_connection
from models import BatchCreate, BatchOut, ItemOut

router = APIRouter()


@router.get("/batches", response_model=list[BatchOut])
def get_all_batches():
    """Get all batches with their items."""
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("SELECT batch_number, product_type, status, batch_date, gas_type, filling_station, tank_id, operator_name, shift FROM batches ORDER BY created_at ASC")
    batches = cursor.fetchall()

    result = []
    for batch in batches:
        cursor.execute(
            "SELECT * FROM items WHERE batch_number = %s ORDER BY id ASC",
            (batch["batch_number"],)
        )
        items_raw = cursor.fetchall()
        items = []
        for item in items_raw:
            items.append(ItemOut(
                serial_number=item["serial_number"],
                input_value=item["input_value"] or 0,
                output_value=item["output_value"] or 0,
                net_output=item["net_output"] or 0,
                indicator=item["indicator"] or "",
                item_status=item["item_status"] or "Issued",
                process_status=item["process_status"],
                qc_status=item["qc_status"],
                validation_color=item["validation_color"],
                gas_purity=item["gas_purity"],
                pressure_check=item["pressure_check"],
                leak_test=item["leak_test"],
                valve_condition=item["valve_condition"],
                remarks=item["remarks"],
                production_date=item["production_date"],
                seal_number=item["seal_number"],
                seal_type=item["seal_type"],
                sealing_date=item["sealing_date"],
                tag_number=item["tag_number"],
                expiry_date=item["expiry_date"],
                inventory_location=item["inventory_location"],
                move_date=item["move_date"],
                transaction_id=item["transaction_id"],
            ))
        result.append(BatchOut(
            batch_number=batch["batch_number"],
            product_type=batch["product_type"],
            status=batch["status"],
            batch_date=batch.get("batch_date"),
            gas_type=batch.get("gas_type"),
            filling_station=batch.get("filling_station"),
            tank_id=batch.get("tank_id"),
            operator_name=batch.get("operator_name"),
            shift=batch.get("shift"),
            items=items
        ))

    cursor.close()
    conn.close()
    return result


@router.post("/batches", response_model=BatchOut)
def create_batch(batch: BatchCreate):
    """Create a new batch."""
    conn = get_connection()
    cursor = conn.cursor()

    try:
        cursor.execute(
            """INSERT INTO batches (batch_number, product_type, batch_date, gas_type, filling_station, tank_id, operator_name, shift)
               VALUES (%s, %s, %s, %s, %s, %s, %s, %s)""",
            (batch.batch_number, batch.product_type, batch.batch_date, batch.gas_type,
             batch.filling_station, batch.tank_id, batch.operator_name, batch.shift)
        )
        conn.commit()
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=f"Batch already exists or error: {str(e)}")
    finally:
        cursor.close()
        conn.close()

    return BatchOut(
        batch_number=batch.batch_number,
        product_type=batch.product_type,
        status="Pending",
        batch_date=batch.batch_date,
        gas_type=batch.gas_type,
        filling_station=batch.filling_station,
        tank_id=batch.tank_id,
        operator_name=batch.operator_name,
        shift=batch.shift,
        items=[]
    )


@router.put("/batches/{batch_number}/complete")
def complete_batch(batch_number: str):
    """Mark a batch as complete."""
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(
        "UPDATE batches SET status = 'Complete' WHERE batch_number = %s",
        (batch_number,)
    )
    if cursor.rowcount == 0:
        cursor.close()
        conn.close()
        raise HTTPException(status_code=404, detail="Batch not found")

    conn.commit()
    cursor.close()
    conn.close()
    return {"message": "Batch completed", "batch_number": batch_number}


@router.delete("/batches/{batch_number}")
def delete_batch(batch_number: str):
    """Delete a batch and its items."""
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("DELETE FROM batches WHERE batch_number = %s", (batch_number,))
    if cursor.rowcount == 0:
        cursor.close()
        conn.close()
        raise HTTPException(status_code=404, detail="Batch not found")

    conn.commit()
    cursor.close()
    conn.close()
    return {"message": "Batch deleted", "batch_number": batch_number}
