"""
MemoRAG ULTRA - Query API
"""
import uuid
from typing import Optional
import logging

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse

from app.core.models import QueryRequest, QueryResponse, QueryMode, ReasoningStep, ProvenanceInfo, ChunkInfo
from app.rag.hybrid_engine import get_rag_engine
from app.db import get_db
from datetime import datetime

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/query", response_model=QueryResponse)
async def query(request: QueryRequest):
    """
    Query the knowledge base
    
    Supports:
    - Auto mode selection
    - Speed mode (fast vector search)
    - Deep mode (graph-based reasoning)
    """
    try:
        logger.info(f"Received query: {request.question[:100]}")
        
        # Get RAG engine
        rag_engine = get_rag_engine()
        
        # Process query
        result = await rag_engine.query(
            question=request.question,
            mode=request.mode,
            top_k=request.top_k
        )
        
        # Build provenance info
        provenance = None
        if request.include_provenance and result.get('retrieval_result'):
            retrieval = result['retrieval_result']
            
            # Convert chunks to ChunkInfo
            chunk_infos = []
            for chunk in retrieval.get('chunks', [])[:10]:  # Limit to 10
                doc = retrieval['documents'].get(chunk['doc_id'], {})
                chunk_infos.append(ChunkInfo(
                    chunk_id=chunk['chunk_id'],
                    doc_id=chunk['doc_id'],
                    doc_title=doc.get('title', 'Unknown'),
                    content=chunk['content'][:500],  # Truncate for response
                    score=chunk.get('score', 0.0),
                    page_number=chunk.get('page_number'),
                    timestamp=None  # TODO: Add timestamp if available
                ))
            
            # Get graph paths
            graph_paths = []
            for path_data in retrieval.get('graph_paths', [])[:5]:
                # Convert entity IDs to names
                from app.rag import get_knowledge_graph
                kg = get_knowledge_graph()
                entity_names = []
                for entity_id in path_data.get('entities', []):
                    node = kg.graph.nodes.get(entity_id, {})
                    if 'name' in node:
                        entity_names.append(node['name'])
                
                if entity_names:
                    from app.core.models import GraphPath
                    graph_paths.append(GraphPath(
                        entities=entity_names,
                        relations=[],  # TODO: Extract relation types
                        confidence=0.8  # TODO: Calculate actual confidence
                    ))
            
            provenance = ProvenanceInfo(
                chunks=chunk_infos,
                graph_paths=graph_paths,
                documents_used=[doc['title'] for doc in retrieval.get('documents', {}).values()],
                retrieval_mode=result['mode_used'],
                total_sources=len(chunk_infos)
            )
        
        # Build reasoning steps (simplified for now)
        reasoning_steps = []
        if request.include_reasoning:
            reasoning_steps.append(ReasoningStep(
                agent="ModeSelector",
                action=f"Selected {result['mode_used'].value.upper()} mode",
                result=f"Query complexity analysis completed",
                timestamp=datetime.now()
            ))
            
            reasoning_steps.append(ReasoningStep(
                agent="Retriever",
                action=f"Retrieved {len(result.get('retrieval_result', {}).get('chunks', []))} chunks",
                result="Context assembled",
                confidence=result.get('confidence'),
                timestamp=datetime.now()
            ))
            
            reasoning_steps.append(ReasoningStep(
                agent="Generator",
                action="Generated answer using LLM",
                result="Answer completed",
                confidence=result.get('confidence'),
                timestamp=datetime.now()
            ))
        
        # Log query to database
        db = get_db()
        log_id = str(uuid.uuid4())
        db.insert_provenance_log({
            'log_id': log_id,
            'query': request.question,
            'answer': result['answer'],
            'mode_used': result['mode_used'].value,
            'confidence': result['confidence'],
            'chunks_used': [c['chunk_id'] for c in result.get('retrieval_result', {}).get('chunks', [])],
            'processing_time_ms': result['processing_time_ms'],
            'cached': False,
            'session_id': request.session_id
        })
        
        return QueryResponse(
            answer=result['answer'],
            confidence=result['confidence'],
            mode_used=result['mode_used'],
            provenance=provenance,
            reasoning_steps=reasoning_steps,
            processing_time_ms=result['processing_time_ms'],
            cached=False
        )
        
    except Exception as e:
        logger.error(f"Query failed: {e}", exc_info=True)
        raise HTTPException(500, f"Query processing failed: {str(e)}")


@router.post("/query/stream")
async def query_stream(request: QueryRequest):
    """
    Stream query response
    
    Returns answer as it's being generated
    """
    try:
        rag_engine = get_rag_engine()
        
        async def generate():
            async for chunk in rag_engine.query_stream(
                question=request.question,
                mode=request.mode
            ):
                yield chunk
        
        return StreamingResponse(
            generate(),
            media_type="text/plain"
        )
        
    except Exception as e:
        logger.error(f"Streaming query failed: {e}")
        raise HTTPException(500, f"Streaming failed: {str(e)}")


@router.get("/query/history")
async def query_history(
    limit: int = 50,
    session_id: Optional[str] = None
):
    """Get query history"""
    db = get_db()
    
    if session_id:
        query = """
        SELECT * FROM provenance_logs 
        WHERE session_id = ? 
        ORDER BY created_at DESC 
        LIMIT ?
        """
        results = db.execute_query(query, (session_id, limit))
    else:
        query = """
        SELECT * FROM provenance_logs 
        ORDER BY created_at DESC 
        LIMIT ?
        """
        results = db.execute_query(query, (limit,))
    
    return {
        'history': [dict(row) for row in results],
        'total': len(results)
    }
