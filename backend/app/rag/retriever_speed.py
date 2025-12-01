"""
MemoRAG ULTRA - Speed Mode Retriever
Fast vector-based retrieval for simple queries
"""
from typing import List, Dict, Any, Optional
import logging

from app.core.config import get_config
from app.rag import get_vector_index
from app.db import get_db

logger = logging.getLogger(__name__)


class SpeedModeRetriever:
    """Fast retrieval using vector similarity search"""
    
    def __init__(self):
        self.config = get_config().rag
        self.vector_index = get_vector_index()
        self.db = get_db()
    
    async def retrieve(
        self,
        query: str,
        top_k: Optional[int] = None
    ) -> Dict[str, Any]:
        """
        Retrieve relevant chunks using vector search
        
        Args:
            query: User query
            top_k: Number of chunks to retrieve
            
        Returns:
            Dict with chunks and metadata
        """
        if top_k is None:
            top_k = self.config.top_k_speed
        
        logger.info(f"Speed Mode: Retrieving top-{top_k} chunks for query")
        
        # Vector search
        results = self.vector_index.search(query, top_k)
        
        if not results:
            logger.warning("No results found in vector index")
            return {
                'chunks': [],
                'context': '',
                'metadata': {
                    'mode': 'speed',
                    'chunks_retrieved': 0
                }
            }
        
        # Fetch full chunk data from database
        chunks = []
        for chunk_id, distance in results:
            chunk_data = self.db.execute_query(
                "SELECT * FROM chunks WHERE chunk_id = ?",
                (chunk_id,)
            )
            
            if chunk_data:
                chunk = dict(chunk_data[0])
                chunk['score'] = float(1.0 / (1.0 + distance))  # Convert distance to similarity
                chunks.append(chunk)
        
        # Get document info for each chunk
        doc_ids = list(set(c['doc_id'] for c in chunks))
        documents = {}
        for doc_id in doc_ids:
            doc = self.db.get_document(doc_id)
            if doc:
                documents[doc_id] = doc
        
        # Assemble context
        context_parts = []
        for chunk in chunks:
            doc = documents.get(chunk['doc_id'], {})
            doc_title = doc.get('title', 'Unknown')
            
            context_parts.append(
                f"[Source: {doc_title}]\n{chunk['content']}"
            )
        
        context = "\n\n---\n\n".join(context_parts)
        
        return {
            'chunks': chunks,
            'documents': documents,
            'context': context,
            'metadata': {
                'mode': 'speed',
                'chunks_retrieved': len(chunks),
                'documents_used': len(documents)
            }
        }
    
    async def retrieve_with_reranking(
        self,
        query: str,
        top_k: Optional[int] = None,
        rerank_top_n: int = 3
    ) -> Dict[str, Any]:
        """
        Retrieve and rerank results
        
        Args:
            query: User query
            top_k: Initial retrieval count
            rerank_top_n: Final count after reranking
            
        Returns:
            Dict with reranked chunks
        """
        # Get initial results
        results = await self.retrieve(query, top_k or (rerank_top_n * 2))
        
        if not results['chunks']:
            return results
        
        # Simple reranking based on query term overlap
        # (In production, use a proper reranking model)
        query_terms = set(query.lower().split())
        
        for chunk in results['chunks']:
            chunk_terms = set(chunk['content'].lower().split())
            overlap = len(query_terms & chunk_terms)
            chunk['rerank_score'] = overlap / len(query_terms) if query_terms else 0
        
        # Sort by rerank score
        results['chunks'].sort(key=lambda x: x['rerank_score'], reverse=True)
        
        # Keep top N
        results['chunks'] = results['chunks'][:rerank_top_n]
        
        # Update context
        context_parts = []
        for chunk in results['chunks']:
            doc = results['documents'].get(chunk['doc_id'], {})
            doc_title = doc.get('title', 'Unknown')
            context_parts.append(f"[Source: {doc_title}]\n{chunk['content']}")
        
        results['context'] = "\n\n---\n\n".join(context_parts)
        results['metadata']['reranked'] = True
        results['metadata']['chunks_retrieved'] = len(results['chunks'])
        
        return results


def get_speed_retriever() -> SpeedModeRetriever:
    """Get speed mode retriever instance"""
    return SpeedModeRetriever()
