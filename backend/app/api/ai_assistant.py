from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.schemas.schemas import RAGChatRequest, RAGChatResponse
from app.ai.rag_engine import answer_shopping_query

router = APIRouter(prefix="/ai", tags=["AI Shopping Assistant"])

@router.post("/shopping-assistant", response_model=RAGChatResponse)
async def chat_shopping_assistant(
    data: RAGChatRequest,
    db: Session = Depends(get_db)
):
    response_data = await answer_shopping_query(db, data.query)
    return RAGChatResponse(**response_data)
