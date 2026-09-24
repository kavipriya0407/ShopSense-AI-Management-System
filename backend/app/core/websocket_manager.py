from typing import List, Dict, Any
from fastapi import WebSocket

class ConnectionManager:
    def __init__(self):
        # List of all active WebSocket connections
        self.active_connections: List[WebSocket] = []
        # Map user_id to web sockets
        self.user_connections: Dict[int, List[WebSocket]] = {}
        # Map vendor_id to web sockets
        self.vendor_connections: Dict[int, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, user_id: int = None, vendor_id: int = None):
        await websocket.accept()
        self.active_connections.append(websocket)
        if user_id:
            if user_id not in self.user_connections:
                self.user_connections[user_id] = []
            self.user_connections[user_id].append(websocket)
        if vendor_id:
            if vendor_id not in self.vendor_connections:
                self.vendor_connections[vendor_id] = []
            self.vendor_connections[vendor_id].append(websocket)

    def disconnect(self, websocket: WebSocket, user_id: int = None, vendor_id: int = None):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
        if user_id and user_id in self.user_connections:
            if websocket in self.user_connections[user_id]:
                self.user_connections[user_id].remove(websocket)
            if not self.user_connections[user_id]:
                del self.user_connections[user_id]
        if vendor_id and vendor_id in self.vendor_connections:
            if websocket in self.vendor_connections[vendor_id]:
                self.vendor_connections[vendor_id].remove(websocket)
            if not self.vendor_connections[vendor_id]:
                del self.vendor_connections[vendor_id]

    async def broadcast(self, message: Dict[str, Any]):
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception:
                pass

    async def send_to_vendor(self, vendor_id: int, message: Dict[str, Any]):
        if vendor_id in self.vendor_connections:
            for connection in self.vendor_connections[vendor_id]:
                try:
                    await connection.send_json(message)
                except Exception:
                    pass

    async def send_to_user(self, user_id: int, message: Dict[str, Any]):
        if user_id in self.user_connections:
            for connection in self.user_connections[user_id]:
                try:
                    await connection.send_json(message)
                except Exception:
                    pass

manager = ConnectionManager()
