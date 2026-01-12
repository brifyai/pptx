"""
Pydantic models for request/response validation.
"""
from pydantic import BaseModel
from typing import Dict, Any, List, Optional


class UpdateMappingRequest(BaseModel):
    template_hash: str
    element_id: str
    new_type: str


class UpdateMappingResponse(BaseModel):
    success: bool
    message: str


class AnalysisElement(BaseModel):
    id: str
    type: str
    coordinates: Dict[str, int]
    style: Optional[Dict[str, Any]] = None
    confidence: Optional[float] = None
    shapeId: Optional[int] = None


class AnalysisResponse(BaseModel):
    success: bool
    templateHash: str
    elements: List[AnalysisElement]
    shapeMapping: Dict[str, int]
    source: str  # 'cache' or 'vision'
    message: str
