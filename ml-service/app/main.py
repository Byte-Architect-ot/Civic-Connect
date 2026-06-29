from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import cluster, categorize, priority
import uvicorn
import os

app = FastAPI(title="Civic Issue ML Service", version="1.0.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:5000").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check
@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "ml-service"}

# Include routers
app.include_router(cluster.router, prefix="/api/ml/cluster", tags=["Clustering"])
app.include_router(categorize.router, prefix="/api/ml/categorize", tags=["NLP"])
app.include_router(priority.router, prefix="/api/ml/priority", tags=["Scoring"])

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)