"""
MemoRAG ULTRA - System API
Health checks, metrics, and system status
"""
import psutil
import time
from typing import Dict, Any
import logging

from fastapi import APIRouter

from app.core.models import SystemStatus, SystemMetrics
from app.core.lm_studio_client import get_lm_studio_client
from app.db import get_db
from app.rag import get_vector_index, get_knowledge_graph

logger = logging.getLogger(__name__)
router = APIRouter()

# Track system start time
_start_time = time.time()


@router.get("/system/status", response_model=SystemStatus)
async def get_system_status():
    """Get comprehensive system status"""
    
    # Check LM Studio connection
    lm_client = get_lm_studio_client()
    lm_connected = await lm_client.check_connection()
    
    # Get database stats
    db = get_db()
    doc_count = db.execute_query("SELECT COUNT(*) as count FROM documents")[0]['count']
    chunk_count = db.execute_query("SELECT COUNT(*) as count FROM chunks")[0]['count']
    entity_count = db.execute_query("SELECT COUNT(*) as count FROM entities")[0]['count']
    relation_count = db.execute_query("SELECT COUNT(*) as count FROM relations")[0]['count']
    
    # Get query stats
    query_count = db.execute_query("SELECT COUNT(*) as count FROM provenance_logs")[0]['count']
    
    # Calculate queries per minute (last hour)
    recent_queries = db.execute_query("""
        SELECT COUNT(*) as count FROM provenance_logs 
        WHERE created_at > datetime('now', '-1 hour')
    """)[0]['count']
    queries_per_minute = recent_queries / 60.0
    
    # Get average latency
    avg_latency_result = db.execute_query("""
        SELECT AVG(processing_time_ms) as avg_latency 
        FROM provenance_logs 
        WHERE created_at > datetime('now', '-1 hour')
    """)
    avg_latency = avg_latency_result[0]['avg_latency'] or 0.0
    
    # Get memory usage
    process = psutil.Process()
    memory_mb = process.memory_info().rss / 1024 / 1024
    
    # Uptime
    uptime = time.time() - _start_time
    
    # Get recent conflicts
    conflicts = db.execute_query("""
        SELECT * FROM conflicts 
        ORDER BY detected_at DESC 
        LIMIT 5
    """)
    
    # Get recent healing events
    healing_events = db.execute_query("""
        SELECT * FROM healing_events 
        ORDER BY created_at DESC 
        LIMIT 5
    """)
    
    # Determine overall status
    status = "healthy"
    if not lm_connected:
        status = "degraded"
    if memory_mb > 6000:  # Over 6GB
        status = "degraded"
    
    metrics = SystemMetrics(
        queries_total=query_count,
        queries_per_minute=queries_per_minute,
        avg_latency_ms=avg_latency,
        cache_hit_rate=0.0,  # TODO: Implement cache tracking
        memory_usage_mb=memory_mb,
        document_count=doc_count,
        chunk_count=chunk_count,
        entity_count=entity_count,
        relation_count=relation_count,
        uptime_seconds=uptime
    )
    
    from app.core.models import ConflictInfo, SelfHealingEvent
    
    return SystemStatus(
        status=status,
        metrics=metrics,
        recent_conflicts=[ConflictInfo(**dict(c)) for c in conflicts],
        recent_healing_events=[SelfHealingEvent(**dict(h)) for h in healing_events],
        lm_studio_connected=lm_connected,
        redis_connected=False  # TODO: Implement Redis check
    )


@router.get("/system/metrics")
async def get_metrics():
    """Get detailed metrics"""
    db = get_db()
    
    # Get vector index stats
    vector_index = get_vector_index()
    vector_stats = vector_index.get_stats()
    
    # Get knowledge graph stats
    kg = get_knowledge_graph()
    kg_stats = kg.get_stats()
    
    # Get query distribution by mode
    mode_distribution = db.execute_query("""
        SELECT mode_used, COUNT(*) as count 
        FROM provenance_logs 
        GROUP BY mode_used
    """)
    
    # Get average confidence by mode
    confidence_by_mode = db.execute_query("""
        SELECT mode_used, AVG(confidence) as avg_confidence 
        FROM provenance_logs 
        WHERE confidence IS NOT NULL
        GROUP BY mode_used
    """)
    
    return {
        'vector_index': vector_stats,
        'knowledge_graph': kg_stats,
        'query_distribution': [dict(row) for row in mode_distribution],
        'confidence_by_mode': [dict(row) for row in confidence_by_mode]
    }


@router.get("/system/health")
async def health_check():
    """Simple health check"""
    lm_client = get_lm_studio_client()
    lm_connected = await lm_client.check_connection()
    
    return {
        'status': 'healthy' if lm_connected else 'degraded',
        'lm_studio': lm_connected,
        'database': True,
        'timestamp': time.time()
    }


@router.post("/system/consolidate")
async def trigger_consolidation():
    """Manually trigger memory consolidation"""
    # TODO: Implement consolidation
    return {
        'message': 'Consolidation triggered',
        'status': 'pending'
    }


@router.get("/knowledge/timeline")
async def get_knowledge_timeline(limit: int = 50):
    """Get knowledge evolution timeline"""
    db = get_db()
    
    # Get document ingestion events
    docs = db.execute_query("""
        SELECT doc_id, title, created_at, 'ingestion' as event_type
        FROM documents 
        ORDER BY created_at DESC 
        LIMIT ?
    """, (limit,))
    
    # Get conflicts
    conflicts = db.execute_query("""
        SELECT conflict_id, detected_at as created_at, 'conflict' as event_type,
               claim1, claim2
        FROM conflicts 
        ORDER BY detected_at DESC 
        LIMIT ?
    """, (limit // 2,))
    
    # Combine and sort
    events = []
    for doc in docs:
        events.append({
            'timestamp': doc['created_at'],
            'event_type': 'ingestion',
            'description': f"Ingested document: {doc['title']}",
            'doc_ids': [doc['doc_id']]
        })
    
    for conflict in conflicts:
        events.append({
            'timestamp': conflict['created_at'],
            'event_type': 'conflict',
            'description': f"Conflict detected: {conflict['claim1'][:50]}...",
            'doc_ids': []
        })
    
    # Sort by timestamp
    events.sort(key=lambda x: x['timestamp'], reverse=True)
    
    return {
        'events': events[:limit],
        'total': len(events)
    }
