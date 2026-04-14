import mysql.connector
from mysql.connector import Error

DB_CONFIG = {
    "host": "localhost",
    "user": "root",
    "password": "Yogesh@28",
    "port": 3306
}

DB_NAME = "sogfusion_db"


def get_connection():
    """Get a connection to the sogfusion_db database."""
    try:
        conn = mysql.connector.connect(**DB_CONFIG, database=DB_NAME)
        return conn
    except Error as e:
        print(f"Error connecting to MySQL: {e}")
        raise


def init_database():
    """Create database and tables if they don't exist."""
    # First connect without specifying database to create it
    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        cursor = conn.cursor()
        cursor.execute(f"CREATE DATABASE IF NOT EXISTS {DB_NAME}")
        cursor.close()
        conn.close()
    except Error as e:
        print(f"Error creating database: {e}")
        raise

    # Now connect to the database and create tables
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS batches (
            batch_number VARCHAR(100) PRIMARY KEY,
            product_type VARCHAR(50) NOT NULL,
            status VARCHAR(20) NOT NULL DEFAULT 'Pending',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS items (
            id INT AUTO_INCREMENT PRIMARY KEY,
            batch_number VARCHAR(100) NOT NULL,
            serial_number VARCHAR(100) NOT NULL,
            input_value DOUBLE DEFAULT 0,
            output_value DOUBLE DEFAULT 0,
            net_output DOUBLE DEFAULT 0,
            indicator VARCHAR(20) DEFAULT '',
            item_status VARCHAR(30) DEFAULT 'Issued',
            process_status VARCHAR(30) DEFAULT NULL,
            qc_status VARCHAR(30) DEFAULT NULL,
            validation_color VARCHAR(10) DEFAULT NULL,
            gas_purity DOUBLE DEFAULT NULL,
            pressure_check VARCHAR(10) DEFAULT NULL,
            leak_test VARCHAR(10) DEFAULT NULL,
            valve_condition VARCHAR(10) DEFAULT NULL,
            remarks TEXT DEFAULT NULL,
            production_date VARCHAR(20) DEFAULT NULL,
            seal_number VARCHAR(100) DEFAULT NULL,
            seal_type VARCHAR(100) DEFAULT NULL,
            sealing_date VARCHAR(20) DEFAULT NULL,
            tag_number VARCHAR(100) DEFAULT NULL,
            expiry_date VARCHAR(20) DEFAULT NULL,
            inventory_location VARCHAR(200) DEFAULT NULL,
            move_date VARCHAR(20) DEFAULT NULL,
            transaction_id VARCHAR(100) DEFAULT NULL,
            FOREIGN KEY (batch_number) REFERENCES batches(batch_number) ON DELETE CASCADE,
            UNIQUE KEY unique_batch_serial (batch_number, serial_number)
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS safety_checklists (
            id INT AUTO_INCREMENT PRIMARY KEY,
            checklist_id VARCHAR(100) NOT NULL,
            batch_number VARCHAR(100) DEFAULT NULL,
            date VARCHAR(20) NOT NULL,
            filling_station VARCHAR(200) NOT NULL,
            supervisor_name VARCHAR(200) NOT NULL,
            equipment_condition VARCHAR(10) DEFAULT 'OK',
            safety_valves VARCHAR(10) DEFAULT 'OK',
            fire_safety VARCHAR(10) DEFAULT 'OK',
            ppe_compliance VARCHAR(10) DEFAULT 'OK',
            status VARCHAR(20) DEFAULT 'Passed',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # --- Gas Production Entry table ---
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS gas_production (
            id INT AUTO_INCREMENT PRIMARY KEY,
            production_id VARCHAR(100) NOT NULL UNIQUE,
            date VARCHAR(20) NOT NULL,
            plant_location VARCHAR(200) NOT NULL,
            gas_type VARCHAR(100) NOT NULL,
            shift VARCHAR(20) NOT NULL,
            machine_unit VARCHAR(200) NOT NULL,
            operator_name VARCHAR(200) NOT NULL,
            quantity_produced DOUBLE DEFAULT 0,
            quantity_unit VARCHAR(20) DEFAULT 'Kg',
            purity_level DOUBLE DEFAULT 0,
            pressure_level DOUBLE DEFAULT 0,
            linked_tank_id VARCHAR(100) DEFAULT NULL,
            remarks TEXT DEFAULT NULL,
            approval_status VARCHAR(30) DEFAULT 'Pending',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # --- Cylinder Issues table (Empty Cylinder Issue to Filling) ---
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS cylinder_issues (
            id INT AUTO_INCREMENT PRIMARY KEY,
            issue_id VARCHAR(100) NOT NULL UNIQUE,
            date VARCHAR(20) NOT NULL,
            from_location VARCHAR(200) NOT NULL,
            to_location VARCHAR(200) NOT NULL,
            gas_type_planned VARCHAR(100) NOT NULL,
            status VARCHAR(30) DEFAULT 'Pending',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS cylinder_issue_items (
            id INT AUTO_INCREMENT PRIMARY KEY,
            issue_id VARCHAR(100) NOT NULL,
            serial_number VARCHAR(100) NOT NULL,
            cylinder_type VARCHAR(100) DEFAULT '',
            current_status VARCHAR(30) DEFAULT 'Empty',
            FOREIGN KEY (issue_id) REFERENCES cylinder_issues(issue_id) ON DELETE CASCADE,
            UNIQUE KEY unique_issue_serial (issue_id, serial_number)
        )
    """)

    # --- Extend batches table with new fields (safe ALTERs) ---
    alter_columns = [
        ("batch_date", "VARCHAR(20) DEFAULT NULL"),
        ("gas_type", "VARCHAR(100) DEFAULT NULL"),
        ("filling_station", "VARCHAR(200) DEFAULT NULL"),
        ("tank_id", "VARCHAR(100) DEFAULT NULL"),
        ("operator_name", "VARCHAR(200) DEFAULT NULL"),
        ("shift", "VARCHAR(20) DEFAULT NULL"),
    ]
    for col_name, col_def in alter_columns:
        cursor.execute(
            "SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = %s AND table_name = 'batches' AND column_name = %s",
            (DB_NAME, col_name)
        )
        if cursor.fetchone()[0] == 0:
            cursor.execute(f"ALTER TABLE batches ADD COLUMN {col_name} {col_def}")
            print(f"  Added column '{col_name}' to batches table")

    conn.commit()
    cursor.close()
    conn.close()
    print(f"Database '{DB_NAME}' initialized successfully!")


def seed_demo_data():
    """Insert demo batches and items if the database is empty."""
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT COUNT(*) FROM batches")
    count = cursor.fetchone()[0]

    if count == 0:
        # Insert demo batches
        cursor.execute(
            "INSERT INTO batches (batch_number, product_type, status) VALUES (%s, %s, %s)",
            ("BATCH-2024-OXY-001", "OXYGEN", "Pending")
        )
        cursor.execute(
            "INSERT INTO batches (batch_number, product_type, status) VALUES (%s, %s, %s)",
            ("BATCH-2024-LUB-099", "LUBRICANT", "Pending")
        )

        # Insert demo items for OXYGEN batch
        for i in range(1, 6):
            cursor.execute(
                "INSERT INTO items (batch_number, serial_number) VALUES (%s, %s)",
                ("BATCH-2024-OXY-001", f"OXY-CYL-010{i}")
            )

        # Insert demo items for LUBRICANT batch
        for i in range(1, 4):
            cursor.execute(
                "INSERT INTO items (batch_number, serial_number) VALUES (%s, %s)",
                ("BATCH-2024-LUB-099", f"DRUM-LUB-500{i}")
            )

        conn.commit()
        print("Demo data seeded successfully!")
    else:
        print("Database already has data, skipping seed.")

    cursor.close()
    conn.close()
