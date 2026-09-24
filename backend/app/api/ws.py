from typing import Optional
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query
from app.core.websocket_manager import manager
from app.core.security import decode_access_token

router = APIRouter(tags=["WebSocket Real-Time"])

@router.websocket("/ws/notifications")
async def websocket_notifications(
    websocket: WebSocket,
    token: Optional[str] = Query(None)
):
    user_id = None
    vendor_id = None

    if token:
        payload = decode_access_token(token)
        if payload and "sub" in payload:
            try:
                user_id = int(payload["sub"])
            except Exception:
                pass

    await manager.connect(websocket, user_id=user_id, vendor_id=vendor_id)
    try:
        # Send initial confirmation message
        await websocket.send_json({
            "type": "CONNECTED",
            "message": "Connected to ShopSense Real-Time Notification Stream"
        })
        while True:
            data = await websocket.receive_text()
            # Respond to client heartbeats / ping
            if data == "ping":
                await websocket.send_text("pong")
    except WebSocketDisconnect:
        manager.disconnect(websocket, user_id=user_id, vendor_id=vendor_id)
    except Exception:
        manager.disconnect(websocket, user_id=user_id, vendor_id=vendor_id)
