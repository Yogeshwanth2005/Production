from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from database import init_database
from routes.batches import router as batches_router
from routes.items import router as items_router
from routes.safety import router as safety_router
from routes.gas_production import router as gas_production_router
from routes.cylinder_issues import router as cylinder_issues_router

app = FastAPI(title="SOGFusion API", version="1.0.0")

# Allow React dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes
@app.on_event("startup")
def patch_database():
    try:
        from database import get_connection
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("UPDATE items SET process_status = 'Success' WHERE process_status = 'Rejected' AND indicator = 'Under'")
        conn.commit()
        print(f"Patched {cursor.rowcount} cylinders from Rejected to Success in database!")
        cursor.close()
        conn.close()
    except Exception as e:
        print("Patch failed:", e)

app.include_router(batches_router, prefix="/api", tags=["Batches"])
app.include_router(items_router, prefix="/api", tags=["Items"])
app.include_router(safety_router, prefix="/api", tags=["Safety Checklists"])
app.include_router(gas_production_router, prefix="/api", tags=["Gas Production"])
app.include_router(cylinder_issues_router, prefix="/api", tags=["Cylinder Issues"])


@app.get("/")
def root():
    return {"message": "SOGFusion API is running", "docs": "/docs"}

if __name__ == "__main__":
    print("Initializing database...")
    init_database()
    print("Starting SOGFusion API server...")
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
