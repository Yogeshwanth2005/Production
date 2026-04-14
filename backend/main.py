from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from database import init_database, seed_demo_data
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
    seed_demo_data()
    print("Starting SOGFusion API server...")
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
