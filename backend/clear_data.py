"""
Run this script to clear ALL data from the SOGFusion database.
Usage: python clear_data.py
"""
import mysql.connector

conn = mysql.connector.connect(
    host="localhost",
    user="root",
    password="Yogesh@28",
    database="sogfusion_db"
)
cursor = conn.cursor()

print("Clearing all data...")
cursor.execute("SET FOREIGN_KEY_CHECKS=0")

tables = [
    "cylinder_issue_items",
    "cylinder_issues",
    "items",
    "batches",
    "safety_checklists",
    "gas_production",
]

for table in tables:
    cursor.execute(f"DELETE FROM {table}")
    print(f"  Cleared: {table} ({cursor.rowcount} rows deleted)")

cursor.execute("SET FOREIGN_KEY_CHECKS=1")
conn.commit()
cursor.close()
conn.close()

print("\nDone! Database is now empty and ready for fresh use.")
