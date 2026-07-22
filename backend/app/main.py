from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os

from .db.session import engine, Base
from .api.endpoints import router

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Enterprise Company Classifier API",
    description="Backend API for classifying and enriching company datasets.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/api")

# Mount the websocket endpoint on the root level to match the router definition
from .api.endpoints import websocket_endpoint
app.add_api_websocket_route("/ws/processing/{dataset_id}", websocket_endpoint)

# Setup path to frontend build
FRONTEND_DIST = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../frontend/dist"))

if os.path.exists(FRONTEND_DIST):
    # Mount the static files (JS, CSS, assets)
    app.mount("/assets", StaticFiles(directory=os.path.join(FRONTEND_DIST, "assets")), name="assets")
    
    # Catch-all route for SPA routing (React Router)
    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        # Don't intercept API or WS calls
        if full_path.startswith("api/") or full_path.startswith("ws/"):
            return {"error": "Not found"}
        
        # If specific file is requested (e.g. favicon.ico)
        requested_file = os.path.join(FRONTEND_DIST, full_path)
        if os.path.exists(requested_file) and os.path.isfile(requested_file):
            return FileResponse(requested_file)
            
        # Otherwise serve index.html
        return FileResponse(os.path.join(FRONTEND_DIST, "index.html"))
else:
    @app.get("/")
    def root():
        return {"status": "ok", "message": "Enterprise Company Classifier API is running. Frontend build not found."}
