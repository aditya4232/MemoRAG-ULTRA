"""
MemoRAG ULTRA - Hybrid RAG Engine
Combines Speed and Deep mode retrieval with LLM generation
"""
from typing import Dict, Any, Optional
import time
import logging

from app.core.config import get_config
from app.core.models import QueryMode
from app.core.lm_studio_client import get_lm_studio_client
from app.rag.retriever_speed import get_speed_retriever
from app.rag.retriever_deep import get_deep_retriever
from app.rag.mode_selector import get_mode_selector

logger = logging.getLogger(__name__)


class HybridRAGEngine:
    """Hybrid RAG engine with automatic mode selection"""
    
    def __init__(self):
        self.config = get_config()
        self.llm_client = get_lm_studio_client()
        self.speed_retriever = get_speed_retriever()
        self.deep_retriever = get_deep_retriever()
        self.mode_selector = get_mode_selector()
    
    async def query(
        self,
        question: str,
        mode: QueryMode = QueryMode.AUTO,
        **kwargs
    ) -> Dict[str, Any]:
        """
        Process query using hybrid RAG
        
        Args:
            question: User question
            mode: Query mode (AUTO, SPEED, or DEEP)
            **kwargs: Additional parameters
            
        Returns:
            Dict with answer, context, and metadata
        """
        start_time = time.time()
        
        # Select mode if AUTO
        if mode == QueryMode.AUTO:
            mode = await self.mode_selector.select_mode(question)
        
        logger.info(f"Processing query in {mode.value.upper()} mode: {question[:100]}")
        
        # Retrieve context
        if mode == QueryMode.SPEED:
            retrieval_result = await self.speed_retriever.retrieve(
                question,
                top_k=kwargs.get('top_k')
            )
        else:  # DEEP
            retrieval_result = await self.deep_retriever.retrieve(
                question,
                top_k=kwargs.get('top_k'),
                max_hops=kwargs.get('max_hops')
            )
        
        context = retrieval_result['context']
        
        if not context:
            return {
                'answer': "I don't have enough information to answer this question. Please try uploading relevant documents first.",
                'confidence': 0.0,
                'mode_used': mode,
                'retrieval_result': retrieval_result,
                'processing_time_ms': (time.time() - start_time) * 1000
            }
        
        # Generate answer using LLM
        answer = await self._generate_answer(question, context, mode)
        
        # Calculate confidence
        confidence = self._calculate_confidence(
            retrieval_result,
            answer
        )
        
        processing_time = (time.time() - start_time) * 1000
        
        logger.info(f"Query processed in {processing_time:.0f}ms (confidence: {confidence:.2f})")
        
        return {
            'answer': answer,
            'confidence': confidence,
            'mode_used': mode,
            'retrieval_result': retrieval_result,
            'processing_time_ms': processing_time
        }
    
    async def _generate_answer(
        self,
        question: str,
        context: str,
        mode: QueryMode
    ) -> str:
        """Generate answer using LLM"""
        
        if mode == QueryMode.SPEED:
            system_prompt = """You are a helpful AI assistant. Answer the question based ONLY on the provided context.
If the context doesn't contain enough information, say so.
Be concise and direct."""
        else:  # DEEP
            system_prompt = """You are a helpful AI assistant with access to a knowledge graph.
Answer the question by synthesizing information from multiple sources.
Use the knowledge graph paths to understand relationships between concepts.
Provide a comprehensive answer that connects different pieces of information.
If there are contradictions, mention them."""
        
        prompt = f"""Context:
{context}

Question: {question}

Answer:"""
        
        try:
            answer = await self.llm_client.generate_with_retry(
                prompt,
                system_prompt,
                temperature=0.3,  # Lower temperature for factual answers
                max_tokens=512
            )
            return answer.strip()
            
        except Exception as e:
            logger.error(f"Answer generation failed: {e}")
            return f"Error generating answer: {str(e)}"
    
    def _calculate_confidence(
        self,
        retrieval_result: Dict[str, Any],
        answer: str
    ) -> float:
        """
        Calculate confidence score for the answer
        
        Factors:
        - Number of chunks retrieved
        - Number of documents used
        - Presence of graph paths (for deep mode)
        - Answer length and completeness
        """
        confidence = 0.5  # Base confidence
        
        # Factor 1: Number of chunks (more = higher confidence)
        chunks_count = retrieval_result['metadata'].get('chunks_retrieved', 0)
        if chunks_count >= 5:
            confidence += 0.2
        elif chunks_count >= 3:
            confidence += 0.1
        
        # Factor 2: Multiple documents (cross-validation)
        docs_count = retrieval_result['metadata'].get('documents_used', 0)
        if docs_count >= 3:
            confidence += 0.15
        elif docs_count >= 2:
            confidence += 0.1
        
        # Factor 3: Graph paths (for deep mode)
        if retrieval_result['metadata'].get('mode') == 'deep':
            paths_count = retrieval_result['metadata'].get('graph_paths_found', 0)
            if paths_count > 0:
                confidence += 0.1
        
        # Factor 4: Answer quality (simple heuristic)
        if len(answer) > 100:  # Substantial answer
            confidence += 0.05
        
        if "I don't" in answer or "not enough" in answer:
            confidence -= 0.2
        
        # Normalize to 0-1
        return max(0.0, min(1.0, confidence))
    
    async def query_stream(
        self,
        question: str,
        mode: QueryMode = QueryMode.AUTO,
        **kwargs
    ):
        """
        Stream answer generation
        
        Args:
            question: User question
            mode: Query mode
            **kwargs: Additional parameters
            
        Yields:
            Answer chunks as they're generated
        """
        # Select mode
        if mode == QueryMode.AUTO:
            mode = await self.mode_selector.select_mode(question)
        
        # Retrieve context
        if mode == QueryMode.SPEED:
            retrieval_result = await self.speed_retriever.retrieve(question)
        else:
            retrieval_result = await self.deep_retriever.retrieve(question)
        
        context = retrieval_result['context']
        
        if not context:
            yield "I don't have enough information to answer this question."
            return
        
        # Generate answer with streaming
        system_prompt = "You are a helpful AI assistant. Answer based on the provided context."
        prompt = f"Context:\n{context}\n\nQuestion: {question}\n\nAnswer:"
        
        async for chunk in self.llm_client.generate_stream(prompt, system_prompt):
            yield chunk


# Global RAG engine instance
_rag_engine: Optional[HybridRAGEngine] = None


def get_rag_engine() -> HybridRAGEngine:
    """Get global RAG engine instance"""
    global _rag_engine
    if _rag_engine is None:
        _rag_engine = HybridRAGEngine()
    return _rag_engine
