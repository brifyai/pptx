"""
Lightweight async task queue for CPU/IO bound operations.
Uses asyncio + ThreadPoolExecutor for heavy tasks without blocking the event loop.

For 50-100 concurrent users. For 500+, migrate to Celery + Redis.
"""
import asyncio
import uuid
from concurrent.futures import ThreadPoolExecutor
from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
from typing import Any, Callable, Dict, Optional
import logging

logger = logging.getLogger(__name__)

# Thread pool for CPU-bound tasks (PPTX generation, image processing)
# Limit to prevent resource exhaustion
MAX_WORKERS = 4
executor = ThreadPoolExecutor(max_workers=MAX_WORKERS)


class TaskStatus(Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"


@dataclass
class Task:
    id: str
    status: TaskStatus = TaskStatus.PENDING
    result: Any = None
    error: Optional[str] = None
    progress: int = 0
    created_at: datetime = field(default_factory=datetime.utcnow)
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    
    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "status": self.status.value,
            "progress": self.progress,
            "error": self.error,
            "created_at": self.created_at.isoformat(),
            "started_at": self.started_at.isoformat() if self.started_at else None,
            "completed_at": self.completed_at.isoformat() if self.completed_at else None
        }


class TaskQueue:
    """
    In-memory task queue with async execution.
    
    Features:
    - Non-blocking execution of heavy tasks
    - Progress tracking
    - Task status polling
    - Automatic cleanup of old tasks
    - Concurrency limiting
    """
    
    def __init__(self, max_concurrent: int = MAX_WORKERS):
        self.tasks: Dict[str, Task] = {}
        self.semaphore = asyncio.Semaphore(max_concurrent)
        self._cleanup_interval = 300  # 5 minutes
        self._task_ttl = 3600  # 1 hour
    
    def create_task(self) -> Task:
        """Create a new task and return its ID."""
        task_id = str(uuid.uuid4())[:8]
        task = Task(id=task_id)
        self.tasks[task_id] = task
        logger.info(f"📋 Task created: {task_id}")
        return task
    
    def get_task(self, task_id: str) -> Optional[Task]:
        """Get task by ID."""
        return self.tasks.get(task_id)
    
    def update_progress(self, task_id: str, progress: int):
        """Update task progress (0-100)."""
        if task_id in self.tasks:
            self.tasks[task_id].progress = min(100, max(0, progress))
    
    async def run_in_background(
        self, 
        task_id: str, 
        func: Callable, 
        *args, 
        **kwargs
    ) -> None:
        """
        Run a CPU-bound function in thread pool without blocking.
        
        Args:
            task_id: Task ID to track
            func: Synchronous function to execute
            *args, **kwargs: Arguments to pass to func
        """
        task = self.tasks.get(task_id)
        if not task:
            logger.error(f"Task {task_id} not found")
            return
        
        async with self.semaphore:  # Limit concurrent tasks
            try:
                task.status = TaskStatus.RUNNING
                task.started_at = datetime.utcnow()
                logger.info(f"🚀 Task {task_id} started")
                
                # Run CPU-bound work in thread pool
                loop = asyncio.get_event_loop()
                result = await loop.run_in_executor(executor, func, *args)
                
                task.result = result
                task.status = TaskStatus.COMPLETED
                task.progress = 100
                task.completed_at = datetime.utcnow()
                
                duration = (task.completed_at - task.started_at).total_seconds()
                logger.info(f"✅ Task {task_id} completed in {duration:.2f}s")
                
            except Exception as e:
                task.status = TaskStatus.FAILED
                task.error = str(e)
                task.completed_at = datetime.utcnow()
                logger.error(f"❌ Task {task_id} failed: {e}")
    
    async def cleanup_old_tasks(self):
        """Remove completed tasks older than TTL."""
        now = datetime.utcnow()
        to_remove = []
        
        for task_id, task in self.tasks.items():
            if task.status in (TaskStatus.COMPLETED, TaskStatus.FAILED):
                if task.completed_at:
                    age = (now - task.completed_at).total_seconds()
                    if age > self._task_ttl:
                        to_remove.append(task_id)
        
        for task_id in to_remove:
            del self.tasks[task_id]
            logger.info(f"🗑️ Cleaned up old task: {task_id}")
    
    def get_queue_status(self) -> dict:
        """Get current queue statistics."""
        pending = sum(1 for t in self.tasks.values() if t.status == TaskStatus.PENDING)
        running = sum(1 for t in self.tasks.values() if t.status == TaskStatus.RUNNING)
        completed = sum(1 for t in self.tasks.values() if t.status == TaskStatus.COMPLETED)
        failed = sum(1 for t in self.tasks.values() if t.status == TaskStatus.FAILED)
        
        return {
            "pending": pending,
            "running": running,
            "completed": completed,
            "failed": failed,
            "total": len(self.tasks),
            "max_concurrent": MAX_WORKERS
        }


# Singleton instance
task_queue = TaskQueue()


# Convenience functions for common heavy operations
def generate_pptx_sync(template_path: str, content: dict, output_path: str) -> str:
    """
    Synchronous PPTX generation (runs in thread pool).
    This is the CPU-bound work that would block the event loop.
    """
    from pptx_generator import generate_presentation
    return generate_presentation(template_path, content)


def convert_slides_sync(pptx_path: str) -> list:
    """
    Synchronous slide conversion (runs in thread pool).
    LibreOffice conversion is CPU-bound.
    """
    from pptx_to_images import convert_pptx_to_images
    return convert_pptx_to_images(pptx_path)


def analyze_template_sync(pptx_path: str) -> dict:
    """
    Synchronous template analysis (runs in thread pool).
    """
    from pptx_analyzer import analyze_presentation
    return analyze_presentation(pptx_path)
