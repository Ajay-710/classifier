import json
from fastapi import WebSocket
from typing import Dict, List
import asyncio

class ConnectionManager:
    def __init__(self):
        # Maps dataset_id -> List of WebSockets
        self.active_connections: Dict[int, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, dataset_id: int):
        await websocket.accept()
        if dataset_id not in self.active_connections:
            self.active_connections[dataset_id] = []
        self.active_connections[dataset_id].append(websocket)

    def disconnect(self, websocket: WebSocket, dataset_id: int):
        if dataset_id in self.active_connections:
            if websocket in self.active_connections[dataset_id]:
                self.active_connections[dataset_id].remove(websocket)
            if len(self.active_connections[dataset_id]) == 0:
                del self.active_connections[dataset_id]

    async def broadcast_progress(self, dataset_id: int, processed: int, total: int):
        if dataset_id in self.active_connections:
            message = {
                "type": "progress",
                "processed": processed,
                "total": total,
                "percent": int((processed / total * 100)) if total > 0 else 0
            }
            # Need to run in event loop because processor uses thread pool
            tasks = []
            for connection in self.active_connections[dataset_id]:
                tasks.append(connection.send_text(json.dumps(message)))
            if tasks:
                await asyncio.gather(*tasks, return_exceptions=True)

    async def broadcast_log(self, dataset_id: int, log_message: str):
        if dataset_id in self.active_connections:
            message = {
                "type": "log",
                "message": log_message
            }
            tasks = []
            for connection in self.active_connections[dataset_id]:
                tasks.append(connection.send_text(json.dumps(message)))
            if tasks:
                await asyncio.gather(*tasks, return_exceptions=True)

manager = ConnectionManager()
