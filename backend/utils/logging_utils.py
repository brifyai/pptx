"""
Logging utilities for structured error tracking.
"""
import logging
import traceback
import json
from datetime import datetime
from typing import Dict, Any

# Configure logging with detailed format
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)


class ErrorCategory:
    """Error categories for structured logging."""
    FILE_VALIDATION = "FILE_VALIDATION"
    FILE_CONVERSION = "FILE_CONVERSION"
    GEMINI_API = "GEMINI_API"
    SHAPE_MATCHING = "SHAPE_MATCHING"
    CACHE_OPERATION = "CACHE_OPERATION"
    DATABASE = "DATABASE"
    NETWORK = "NETWORK"
    UNKNOWN = "UNKNOWN"


def log_error_with_context(
    error: Exception,
    category: str,
    operation: str,
    context: Dict[str, Any] = None,
    include_traceback: bool = True
) -> dict:
    """
    Log an error with full context for diagnosis.
    
    Args:
        error: The exception that occurred
        category: Error category from ErrorCategory
        operation: The operation that was being performed
        context: Additional context information
        include_traceback: Whether to include full traceback
    
    Returns:
        Error info dictionary
    """
    error_info = {
        "timestamp": datetime.utcnow().isoformat(),
        "category": category,
        "operation": operation,
        "error_type": type(error).__name__,
        "error_message": str(error),
        "context": context or {}
    }
    
    logger.error(f"❌ [{category}] {operation} failed: {str(error)}")
    logger.error(f"   Context: {json.dumps(error_info['context'], default=str)}")
    
    if include_traceback:
        tb = traceback.format_exc()
        logger.error(f"   Traceback:\n{tb}")
    
    return error_info


def log_operation_start(operation: str, context: Dict[str, Any] = None):
    """Log the start of an operation with context."""
    logger.info(f"🔄 Starting: {operation}")
    if context:
        logger.info(f"   Context: {json.dumps(context, default=str)}")


def log_operation_success(operation: str, result_summary: str = None):
    """Log successful completion of an operation."""
    msg = f"✅ Completed: {operation}"
    if result_summary:
        msg += f" - {result_summary}"
    logger.info(msg)
