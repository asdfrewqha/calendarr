from datetime import date
from typing import Annotated, List, Optional

from app.api.user.schemas import MessageScheme
from app.api.user.services import MessageService
from app.dependencies.checks import check_user_token
from fastapi import APIRouter, Depends, Query

router = APIRouter()


@router.get("/message", response_model=List[MessageScheme])
async def list_message(
    user_id: Annotated[int, Depends(check_user_token)],
    service: Annotated[MessageService, Depends(MessageService)],
    start_date: date = Query(...),
    end_date: Optional[date] = Query(None),
):
    return await service.list_messages(user_id, start_date, end_date)
