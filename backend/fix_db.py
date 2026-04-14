import database

conn = database.get_connection()
cursor = conn.cursor()

try:
    # Any item that is currently Rejected but has an 'Under' indicator should be officially upgraded to 'Success'
    cursor.execute("""
        UPDATE items 
        SET process_status = 'Success' 
        WHERE process_status = 'Rejected' AND indicator = 'Under'
    """)
    conn.commit()
    print(f"Updated {cursor.rowcount} cylinders from Rejected to Success!")
except Exception as e:
    print("Error:", e)
finally:
    cursor.close()
    conn.close()
