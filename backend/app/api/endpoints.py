import threading
import pandas as pd
import io
from fastapi import APIRouter, UploadFile, File, Depends, WebSocket, WebSocketDisconnect
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import List, Optional

from ..db.session import get_db
from ..db.models import Dataset, Company, AppSettings
from .websockets import manager
from ..workers.processor import DatasetProcessor

router = APIRouter()

@router.post("/upload")
async def upload_dataset(file: UploadFile = File(...), db: Session = Depends(get_db)):
    content = await file.read()
    
    # Read using pandas
    try:
        if file.filename.endswith('.csv'):
            df = pd.read_csv(io.BytesIO(content))
        elif file.filename.endswith('.xlsx'):
            df = pd.read_excel(io.BytesIO(content))
        else:
            return {"error": "Unsupported file format. Please upload CSV or XLSX."}
    except Exception as e:
        return {"error": f"Failed to read file: {e}"}

    # Expecting 'Company Name' and 'Company Domain' columns
    if 'Company Name' not in df.columns or 'Company Domain' not in df.columns:
        return {"error": "Missing required columns: 'Company Name' and 'Company Domain'"}

    # Create dataset
    dataset = Dataset(filename=file.filename, total_rows=len(df), status="Pending")
    db.add(dataset)
    db.commit()
    db.refresh(dataset)

    # Insert companies
    companies_data = []
    for _, row in df.iterrows():
        name = str(row['Company Name']) if pd.notna(row['Company Name']) else ""
        domain = str(row['Company Domain']) if pd.notna(row['Company Domain']) else ""
        companies_data.append(Company(
            dataset_id=dataset.id,
            original_name=name,
            original_domain=domain
        ))
    
    db.bulk_save_objects(companies_data)
    db.commit()

    # Start processing in background thread
    processor = DatasetProcessor(dataset.id, manager)
    thread = threading.Thread(target=processor.run)
    thread.start()

    return {"dataset_id": dataset.id, "message": "Upload successful, processing started."}

@router.get("/datasets")
def list_datasets(db: Session = Depends(get_db)):
    datasets = db.query(Dataset).order_by(Dataset.created_at.desc()).all()
    return datasets

@router.get("/datasets/{dataset_id}")
def get_dataset(dataset_id: int, db: Session = Depends(get_db)):
    return db.query(Dataset).filter(Dataset.id == dataset_id).first()

@router.get("/companies")
def list_companies(
    dataset_id: int, 
    page: int = 1, 
    limit: int = 50, 
    search: str = "",
    status: str = "",
    db: Session = Depends(get_db)
):
    query = db.query(Company).filter(Company.dataset_id == dataset_id)
    
    if search:
        query = query.filter(Company.original_name.ilike(f"%{search}%") | Company.official_domain.ilike(f"%{search}%"))
        
    if status:
        query = query.filter(Company.status == status)

    total = query.count()
    companies = query.offset((page - 1) * limit).limit(limit).all()
    
    return {
        "total": total,
        "page": page,
        "limit": limit,
        "data": companies
    }

@router.get("/dashboard")
def get_dashboard_stats(db: Session = Depends(get_db)):
    total = db.query(Company).count()
    status_counts = db.query(Company.status, db.func.count(Company.status)).group_by(Company.status).all()
    industry_counts = db.query(Company.industry, db.func.count(Company.industry)).filter(Company.industry.isnot(None)).group_by(Company.industry).all()
    
    return {
        "total": total,
        "status_distribution": {k: v for k, v in status_counts},
        "industry_distribution": {k: v for k, v in industry_counts}
    }

@router.websocket("/ws/processing/{dataset_id}")
async def websocket_endpoint(websocket: WebSocket, dataset_id: int):
    await manager.connect(websocket, dataset_id)
    try:
        while True:
            # Keep connection alive
            data = await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket, dataset_id)
